import os
import srt
import google.generativeai as genai
from flask import Blueprint, request, jsonify, current_app
from flask_login import login_required, current_user
from ..models import Project, SrtFile, TranslatedFile
from .. import db
import threading

genai.configure(api_key=os.environ.get("GOOGLE_API_KEY"))

translate_bp = Blueprint('translate', __name__)

def translate_srt_content(srt_content, target_language):
    """Helper function to translate SRT content and handle errors."""
    try:
        prompt = (
            f"You are an expert translator for movie subtitles. Your task is to translate the following SRT content into {target_language}. "
            "Follow these rules strictly:\n"
            "1. Translate the dialogue text for each subtitle entry.\n"
            "2. Do NOT alter the timestamps or the sequence numbers.\n"
            "3. Preserve the original tone and context of the dialogue.\n"
            "4. Return only the complete, translated SRT content.\n\n"
            f"SRT content:\n{srt_content}"
        )
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(prompt)
        translated_srt = response.text
        list(srt.parse(translated_srt))  # Validate the output
        return translated_srt
    except Exception:
        return None

@translate_bp.route('/', methods=['POST'])
@login_required
def translate_text():
    data = request.get_json()
    if not data or 'target_language' not in data or 'file_id' not in data:
        return jsonify({'error': 'Missing target_language or file_id in request'}), 400

    target_language = data['target_language']
    file_id = data['file_id']

    original_file = SrtFile.query.get_or_404(file_id)
    if original_file.project.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403

    existing_translation = TranslatedFile.query.filter_by(
        original_file_id=file_id,
        target_language=target_language
    ).first()

    if existing_translation:
        return jsonify({
            'message': 'Translation already exists.',
            'translated_srt': existing_translation.content
        })

    translated_srt = translate_srt_content(original_file.original_content, target_language)

    if not translated_srt:
        return jsonify({'error': 'AI returned an invalid SRT format. Please try again.'}), 500

    new_translation = TranslatedFile(
        content=translated_srt,
        target_language=target_language,
        original_file_id=original_file.id,
        project_id=original_file.project_id
    )
    db.session.add(new_translation)
    db.session.commit()

    return jsonify({
        'message': 'Translation successful.',
        'translated_srt': translated_srt
    })

def background_translate(app, project_id, target_language):
    with app.app_context():
        print(f"[BG Task] Starting translation for project {project_id} to {target_language}")
        files_to_translate = SrtFile.query.filter_by(project_id=project_id).all()
        print(f"[BG Task] Found {len(files_to_translate)} files to process.")

        for original_file in files_to_translate:
            print(f"[BG Task] Processing file: {original_file.filename}")
            existing_translation = TranslatedFile.query.filter_by(
                original_file_id=original_file.id,
                target_language=target_language
            ).first()

            if not existing_translation:
                print(f"[BG Task] No existing translation found. Translating...")
                translated_srt = translate_srt_content(original_file.original_content, target_language)
                if translated_srt:
                    print(f"[BG Task] Translation successful. Saving to DB.")
                    new_translation = TranslatedFile(
                        content=translated_srt,
                        target_language=target_language,
                        original_file_id=original_file.id,
                        project_id=original_file.project_id
                    )
                    db.session.add(new_translation)
                    db.session.commit()
                    print(f"[BG Task] Saved translation for {original_file.filename}.")
                else:
                    print(f"[BG Task] Translation failed for {original_file.filename}.")
            else:
                print(f"[BG Task] Translation already exists. Skipping.")
        print(f"[BG Task] Finished translation for project {project_id}.")

@translate_bp.route('/<int:project_id>/translate-all', methods=['POST'])
@login_required
def translate_all_files(project_id):
    data = request.get_json()
    if not data or 'target_language' not in data:
        return jsonify({'error': 'Missing target_language in request'}), 400

    target_language = data['target_language']
    
    project = Project.query.filter_by(id=project_id, user_id=current_user.id).first_or_404()
    
    app = current_app._get_current_object()
    thread = threading.Thread(target=background_translate, args=(app, project.id, target_language))
    thread.start()
    
    return jsonify({'message': f'Translation to {target_language} has started in the background.'})
