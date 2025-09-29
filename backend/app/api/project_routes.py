from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from ..models import Project, SrtFile, TranslatedFile
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
    try:
        project = Project.query.filter_by(id=project_id, user_id=current_user.id).first_or_404()
        # Delete associated SRT files
        # Use synchronize_session=False to avoid session issues
        SrtFile.query.filter_by(project_id=project.id).delete(synchronize_session=False)
        db.session.delete(project)
        db.session.commit()
        return jsonify({'message': 'Project deleted successfully'})
    except Exception as e:
        import traceback
        tb_str = traceback.format_exc()
        print(tb_str)
        return jsonify({'error': f'Failed to delete project: {str(e)}', 'traceback': tb_str}), 500


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

        # 4. Check if a file with the same filename already exists in the project.
        existing_file = SrtFile.query.filter_by(filename=file.filename, project_id=project.id).first()
        if existing_file:
            # Update the existing file's content
            existing_file.original_content = original_content
            db.session.commit()
            return jsonify({
                'message': f'File "{file.filename}" updated successfully in project: {project.project_name}',
                'file_id': existing_file.id
            }), 200
        else:
            # Create a new SrtFile record in the database.
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

@project_bp.route('/projects/<int:project_id>', methods=['GET'])
@login_required
def get_project_details(project_id):
    project = Project.query.filter_by(id=project_id, user_id=current_user.id).first_or_404()
    
    original_files = SrtFile.query.filter_by(project_id=project.id).all()
    
    files_data = []
    for f in original_files:
        translations = TranslatedFile.query.filter_by(original_file_id=f.id).all()
        files_data.append({
            'id': f.id,
            'filename': f.filename,
            'original_content': f.original_content,
            'translations': [{
                'id': t.id,
                'content': t.content,
                'target_language': t.target_language
            } for t in translations]
        })

    return jsonify({
        'id': project.id,
        'project_name': project.project_name,
        'files': files_data
    })


# --- Save Edited Translated Content ---
@project_bp.route('/translated-files/<int:file_id>/save', methods=['PUT'])
@login_required
def save_translated_file(file_id):
    """
    Updates the content of a translated file.
    """
    translated_file = TranslatedFile.query.join(Project).filter(
        TranslatedFile.id == file_id,
        Project.user_id == current_user.id
    ).first_or_404()

    data = request.get_json()
    if not data or 'content' not in data:
        return jsonify({'error': 'Missing content in request'}), 400

    translated_file.content = data['content']
    db.session.commit()

    return jsonify({'message': 'Translated file saved successfully'})


# --- Download Translated SRT File ---
@project_bp.route('/translated-files/<int:file_id>/download', methods=['GET'])
@login_required
def download_translated_file(file_id):
    """
    Downloads a translated SRT file.
    """
    translated_file = TranslatedFile.query.join(Project).filter(
        TranslatedFile.id == file_id,
        Project.user_id == current_user.id
    ).first_or_404()

    original_file = SrtFile.query.get(translated_file.original_file_id)
    filename = f"{original_file.filename.split('.')[0]}_{translated_file.target_language}.srt"

    from flask import Response
    response = Response(translated_file.content, mimetype='text/plain')
    response.headers['Content-Disposition'] = f'attachment; filename={filename}'
    return response
