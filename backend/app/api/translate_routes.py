from flask import Blueprint, jsonify, request
import uuid # Used to generate a fake job ID

# Create a "Blueprint". This is Flask's way of organizing routes.
api_bp = Blueprint('api_bp', __name__)

@api_bp.route('/translate', methods=['POST'])
def start_translation():
    # We don't need the files for the mock, but we can check they exist.
    if 'files' not in request.files:
        return jsonify({"error": "No files uploaded"}), 400

    # Return a fake job ID, just like we planned in the API Contract.
    fake_job_id = str(uuid.uuid4())
    print(f"Received files, assigned fake job ID: {fake_job_id}")
    return jsonify({"job_id": fake_job_id}), 202


@api_bp.route('/translate/status/<job_id>', methods=['GET'])
def get_translation_status(job_id):
    # For the mock, we don't care about the job_id. We just return a fake success.
    print(f"Frontend is asking for status of job: {job_id}")
    
    # This is the fake successful response from our API Contract.
    mock_response = {
      "job_id": job_id,
      "status": "SUCCESS",
      "progress": 100,
      "result_url": f"/api/v1/download/{job_id}" # A fake download URL
    }
    return jsonify(mock_response), 200

@api_bp.route('/download/<job_id>', methods=['GET'])
def download_result(job_id):
    # For now, just return a message. Later this will return a ZIP file.
    return jsonify({"message": f"This will eventually be a ZIP file for job {job_id}"})