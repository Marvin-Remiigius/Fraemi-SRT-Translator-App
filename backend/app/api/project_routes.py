from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from ..models import Project, SrtFile # <-- Import the new SrtFile model
from .. import db

project_bp = Blueprint('projects', __name__)

# --- GET and CREATE Projects (No changes) ---
import pytz
from datetime import datetime

@project_bp.route('/projects', methods=['GET'])
@login_required
def get_projects():
    # ... (existing code) ...
    projects = Project.query.filter_by(user_id=current_user.id).order_by(Project.created_at.desc()).all()
    projects_list = [
        {'id': p.id, 'name': p.project_name, 'created': p.created_at.strftime('%Y-%m-%d')}
        for p in projects
    ]
    return jsonify(projects_list)

@project_bp.route('/projects', methods=['POST'])
@login_required
def create_project():
    # ... (existing code) ...
    data = request.get_json()
    project_name = data.get('project_name')
    if not project_name:
        return jsonify({'error': 'Project name is required'}), 400

    # Check if project with same name already exists for this user
    existing_project = Project.query.filter_by(user_id=current_user.id, project_name=project_name).first()
    if existing_project:
        return jsonify({'error': 'A project with this name already exists'}), 400

    new_project = Project(
        project_name=project_name,
        user_id=current_user.id
    )
    #Creating a new database session
    db.session.add(new_project)
    db.session.commit()
    return jsonify({'id': new_project.id, 'name': new_project.project_name, 'created': new_project.created_at.strftime('%Y-%m-%d')}), 201

@project_bp.route('/projects/<int:project_id>', methods=['DELETE'])
@login_required
def delete_project(project_id):
    project = Project.query.filter_by(id=project_id, user_id=current_user.id).first_or_404()
    # Delete associated SRT files
    SrtFile.query.filter_by(project_id=project.id).delete()
    db.session.delete(project)
    db.session.commit()
    return jsonify({'message': 'Project deleted successfully'})


# --- File Upload Route (NEW) ---
@project_bp.route('/projects/<int:project_id>/upload', methods=['POST'])
@login_required
def upload_srt_file(project_id):
    """
    Handles uploading an SRT file to a specific project.
    """
    # 1. Find the project and ensure it belongs to the current user.
    #    first_or_404() is a handy shortcut that automatically returns a 404 error if not found.
    project = Project.query.filter_by(id=project_id, user_id=current_user.id).first_or_404()

    # 2. Check if the file is present in the request.
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400
    
    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    # 3. Validate the file type.
    if file and file.filename.endswith('.srt'):
        # Read the content of the file as a string.
        original_content = file.read().decode('utf-8')
        
        # 4. Create a new SrtFile record in the database.
        new_srt_file = SrtFile(
            filename=file.filename,
            original_content=original_content,
            project_id=project.id  # Link it to the parent project
        )
        
        # 5. Add to the session and commit.
        db.session.add(new_srt_file)
        db.session.commit()

        return jsonify({
            'message': f'File "{file.filename}" uploaded successfully to project: {project.project_name}',
            'file_id': new_srt_file.id
        }), 200
    else:
        return jsonify({'error': 'Invalid file type, please upload an .srt file'}), 400

@project_bp.route('/projects/<int:project_id>/files', methods=['GET'])
@login_required
def get_srt_files(project_id):
    project = Project.query.filter_by(id=project_id, user_id=current_user.id).first_or_404()
    files = SrtFile.query.filter_by(project_id=project.id).all()
    files_list = [{'id': f.id, 'filename': f.filename, 'original_content': f.original_content} for f in files]
    return jsonify(files_list)


# --- Save Edited SRT Content ---
@project_bp.route('/srt-files/<int:file_id>/save', methods=['PUT'])
@login_required
def save_srt_file(file_id):
    """
    Updates the translated content of an SRT file.
    """
    # Find the SRT file and ensure it belongs to the current user via project
    srt_file = SrtFile.query.join(Project).filter(
        SrtFile.id == file_id,
        Project.user_id == current_user.id
    ).first_or_404()

    data = request.get_json()
    if not data or 'translated_content' not in data:
        return jsonify({'error': 'Missing translated_content in request'}), 400

    srt_file.translated_content = data['translated_content']
    db.session.commit()

    return jsonify({'message': 'SRT file saved successfully'})


# --- Download Translated SRT File ---
@project_bp.route('/srt-files/<int:file_id>/download', methods=['GET'])
@login_required
def download_srt_file(file_id):
    """
    Downloads the translated SRT file.
    """
    # Find the SRT file and ensure it belongs to the current user via project
    srt_file = SrtFile.query.join(Project).filter(
        SrtFile.id == file_id,
        Project.user_id == current_user.id
    ).first_or_404()

    if not srt_file.translated_content:
        return jsonify({'error': 'No translated content available'}), 400

    from flask import Response
    response = Response(srt_file.translated_content, mimetype='text/plain')
    response.headers['Content-Disposition'] = f'attachment; filename={srt_file.filename}'
    return response
