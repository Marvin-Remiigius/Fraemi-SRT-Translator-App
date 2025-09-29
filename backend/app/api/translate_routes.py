# backend/app/api/translate_routes.py
import os
import srt
import google.generativeai as genai
from flask import Blueprint, request, jsonify
from flask_login import login_required
from ..models import SrtFile, TranslatedFile
from .. import db

# Configure the Gemini client using the API key from our .flaskenv file
genai.configure(api_key=os.environ.get("GOOGLE_API_KEY"))

translate_bp = Blueprint('translate', __name__)

@translate_bp.route('/translate', methods=['POST'])
@login_required
def translate_text():
    data = request.get_json()
    if not data or 'target_language' not in data or 'file_id' not in data:
        return jsonify({'error': 'Missing target_language or file_id in request'}), 400

    target_language = data['target_language']
    file_id = data['file_id']

    # 1. Find the original SRT file
    original_file = SrtFile.query.get(file_id)
    if not original_file:
        return jsonify({'error': 'SRT file not found'}), 404

    # Check if a translation for this language already exists
    existing_translation = TranslatedFile.query.filter_by(
        original_file_id=file_id,
        target_language=target_language
    ).first()

    if existing_translation:
        return jsonify({
            'message': 'Translation already exists.',
            'translated_srt': existing_translation.content
        })

    try:
        # 2. BUILD THE PROMPT
        prompt = (
            f"You are an expert translator for movie subtitles. Your task is to translate the following SRT content into {target_language}. "
            "Follow these rules strictly:\n"
            "1. Translate the dialogue text for each subtitle entry.\n"
            "2. Do NOT alter the timestamps or the sequence numbers.\n"
            "3. Preserve the original tone and context of the dialogue.\n"
            "4. Return only the complete, translated SRT content.\n\n"
            f"SRT content:\n{original_file.original_content}"
        )

        # 3. CALL THE GEMINI API
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(prompt)
        translated_srt = response.text

        # 4. VALIDATE THE OUTPUT
        try:
            list(srt.parse(translated_srt))
        except Exception:
            return jsonify({'error': 'AI returned an invalid SRT format. Please try again.'}), 500

        # 5. SAVE THE NEW TRANSLATION
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

    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({'error': f'An internal error occurred: {str(e)}'}), 500
