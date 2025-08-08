# FILE: backend/app/models.py
#
# We are adding a new 'SrtFile' model and updating the 'Project' model
# to create a relationship between them.

from . import db
from flask_login import UserMixin

# --- User Model (No changes) ---
class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    projects = db.relationship('Project', backref='author', lazy=True)

# --- Project Model (UPDATED) ---
class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    project_name = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # This line creates the relationship. It allows you to easily access
    # all the SRT files associated with a project.
    srt_files = db.relationship('SrtFile', backref='project', lazy=True, cascade="all, delete-orphan")

# --- SrtFile Model (NEW) ---
# This new table will store the individual SRT files.
class SrtFile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    original_content = db.Column(db.Text, nullable=False)
    translated_content = db.Column(db.Text, nullable=True)
    target_language = db.Column(db.String(50), nullable=True)
    
    # This is the foreign key that links this file to a specific project.
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)


# =====================================================================
# FILE: backend/app/api/project_routes.py
#
# We are adding a new route to handle file uploads for a specific project.
# =====================================================================

from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from ..models import Project, SrtFile # <-- Import the new SrtFile model
from .. import db

project_bp = Blueprint('projects', __name__)

# --- GET and CREATE Projects (No changes) ---
@project_bp.route('/projects', methods=['GET'])
@login_required
def get_projects():
    # ... (existing code) ...
    projects = Project.query.filter_by(user_id=current_user.id).order_by(Project.created_at.desc()).all()
    projects_list = [
        {'id': p.id, 'project_name': p.project_name, 'created_at': p.created_at.isoformat()}
        for p in projects
    ]
    return jsonify(projects_list)

@project_bp.route('/projects', methods=['POST'])
@login_required
def create_project():
    # ... (existing code) ...
    data = request.get_json()
    new_project = Project(
        project_name=data.get('project_name'),
        user_id=current_user.id
    )
    db.session.add(new_project)
    db.session.commit()
    return jsonify({'message': 'Project created successfully', 'project_id': new_project.id}), 201


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
