# backend/app/api/translate_routes.py
import os
import srt
import google.generativeai as genai
from flask import Blueprint, request, jsonify
from flask_login import login_required
from ..models import SrtFile
from .. import db

# Configure the Gemini client using the API key from our .flaskenv file
genai.configure(api_key=os.environ.get("GOOGLE_API_KEY"))

translate_bp = Blueprint('translate', __name__)

@translate_bp.route('/translate', methods=['POST'])
@login_required
def translate_text():
    data = request.get_json()
    if not data or 'srt_content' not in data or 'target_language' not in data or 'file_id' not in data:
        return jsonify({'error': 'Missing srt_content, target_language or file_id in request'}), 400

    srt_content = data['srt_content']
    target_language = data['target_language']
    file_id = data['file_id']

    try:
        # 1. PARSE THE SRT CONTENT (Same as before)
        # This gives us a structured way to work with the subtitles
        subs = list(srt.parse(srt_content))

        # 2. BUILD OUR ADVANCED, CONTEXT-AWARE PROMPT
        # This is where we take inspiration from the GitHub code.
        # We give the AI a role, clear instructions, and the full context.
        prompt = (
            f"You are an expert translator for movie subtitles. Your task is to translate the following SRT content into {target_language}. "
            "Follow these rules strictly:\n"
            "1. Translate the dialogue text for each subtitle entry.\n"
            "2. Do NOT alter the timestamps or the sequence numbers.\n"
            "3. Preserve the original tone and context of the dialogue by considering the surrounding lines.\n"
            "4. Ensure the translated text fits naturally within the subtitle format.\n"
            "5. Return only the complete, translated SRT content and nothing else.\n\n"
            "Here is the full SRT content to translate:\n\n"
            f"{srt_content}"
        )

        # 3. CALL THE GEMINI API
        print("Calling Gemini API...")
        # We initialize the generative model
        model = genai.GenerativeModel('gemini-2.5-pro')
        # We send the prompt and get the response
        response = model.generate_content(prompt)
        print("Gemini API call completed.")

        # The translated SRT is in the response text
        translated_srt = response.text

        # 4. (Optional but good) VALIDATE THE OUTPUT
        # We can try to parse the result to make sure the AI returned a valid SRT
        try:
            list(srt.parse(translated_srt))
        except Exception:
            # If parsing fails, the AI might have made a mistake.
            # We can return an error or even try again.
            return jsonify({'error': 'AI returned an invalid SRT format. Please try again.'}), 500

        # 5. Save the translated content to the database
        srt_file = SrtFile.query.get(file_id)
        if not srt_file:
            return jsonify({'error': 'SRT file not found'}), 404

        # Check if translated file already exists
        translated_filename = f"t_{srt_file.filename.rsplit('.', 1)[0]}_translated.srt"
        translated_file = SrtFile.query.filter_by(filename=translated_filename, project_id=srt_file.project_id).first()
        if translated_file:
            # Already translated, return the existing translated content
            return jsonify({'translated_srt': translated_file.original_content})

        # Update the original file's translated_content and target_language
        srt_file.translated_content = translated_srt
        srt_file.target_language = target_language

        # Create a new SrtFile for the translated file with name "t_{original_filename}_translated.srt"
        translated_file = SrtFile(
            filename=translated_filename,
            original_content=translated_srt,
            translated_content=translated_srt,
            target_language=target_language,
            project_id=srt_file.project_id
        )
        db.session.add(translated_file)

        db.session.commit()

        return jsonify({'translated_srt': translated_srt})

    except Exception as e:
        # Catch parsing errors or API errors
        print(f"An error occurred: {e}") # Good for debugging
        return jsonify({'error': f'An internal error occurred: {str(e)}'}), 500
