# backend/app/api/translate_routes.py
import os
import srt
import google.generativeai as genai
from flask import Blueprint, request, jsonify
from flask_login import login_required

# Configure the Gemini client using the API key from environment
genai.configure(api_key=os.environ.get("GOOGLE_API_KEY"))

# Define the Blueprint
translate_bp = Blueprint('translate', __name__)

@translate_bp.route('/translate', methods=['POST'])
@login_required
def translate_text():
    data = request.get_json()
    if not data or 'srt_content' not in data or 'target_language' not in data:
        return jsonify({'error': 'Missing srt_content or target_language in request'}), 400

    srt_content = data['srt_content']
    target_language = data['target_language']

    try:
        # 1. Parse the SRT content
        subs = list(srt.parse(srt_content))

        # 2. Build the context-aware prompt
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

        # 3. Call the Gemini API
        model = genai.GenerativeModel('gemini-1.5-flash-latest')
        response = model.generate_content(prompt)

        # The translated SRT is in the response text
        translated_srt = response.text

        # 4. Validate the output
        try:
            list(srt.parse(translated_srt))
        except Exception:
            return jsonify({'error': 'AI returned an invalid SRT format. Please try again.'}), 500

        return jsonify({'translated_srt': translated_srt})

    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({'error': f'An internal error occurred: {str(e)}'}), 500