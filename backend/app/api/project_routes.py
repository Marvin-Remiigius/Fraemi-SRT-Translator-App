from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from ..models import Project, SrtFile
from .. import db
import datetime # <-- Make sure to import this

project_bp = Blueprint('projects', __name__)

# --- GET and CREATE Projects (FIXED) ---
@project_bp.route('/projects', methods=['GET'])
@login_required
def get_projects():
    projects = Project.query.filter_by(user_id=current_user.id).order_by(Project.created_at.desc()).all()
    projects_list = [
        # BUG FIX: Changed p.project_name to p.created_at
        {'id': p.id, 'project_name': p.project_name, 'created_at': p.created_at.isoformat()}
        for p in projects
    ]
    return jsonify(projects_list)

@project_bp.route('/projects', methods=['POST'])
@login_required
def create_project():
    data = request.get_json()
    # Add validation to ensure project_name is provided
    if not data or not data.get('project_name'):
        return jsonify({'error': 'Project name is required'}), 400
        
    new_project = Project(
        project_name=data.get('project_name'),
        user_id=current_user.id,
        created_at=datetime.datetime.utcnow() # BUG FIX: Explicitly set creation time
    )
    db.session.add(new_project)
    db.session.commit()
    return jsonify({
        'message': 'Project created successfully', 
        'project_id': new_project.id
    }), 201


# --- File Upload Route (No changes needed here) ---
@project_bp.route('/projects/<int:project_id>/upload', methods=['POST'])
@login_required
def upload_srt_file(project_id):
    """
    Handles uploading an SRT file to a specific project.
    """
    project = Project.query.filter_by(id=project_id, user_id=current_user.id).first_or_404()

    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400
    
    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file and file.filename.endswith('.srt'):
        original_content = file.read().decode('utf-8')
        
        new_srt_file = SrtFile(
            filename=file.filename,
            original_content=original_content,
            project_id=project.id
        )
        
        db.session.add(new_srt_file)
        db.session.commit()

        return jsonify({
            'message': f'File "{file.filename}" uploaded successfully to project: {project.project_name}',
            'file_id': new_srt_file.id
        }), 200
    else:
        return jsonify({'error': 'Invalid file type, please upload an .srt file'}), 400

