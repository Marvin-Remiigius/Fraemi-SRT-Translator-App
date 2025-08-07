from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from .. import db
from ..models import Project

project_bp = Blueprint('projects', __name__)

@project_bp.route('/projects', methods=['GET'])
@login_required
def get_projects():
    projects = Project.query.filter_by(user_id=current_user.id).order_by(Project.created_at.desc()).all()
    # Convert project objects to dictionaries for JSON response
    projects_list = [
        {'id': p.id, 'project_name': p.project_name, 'created_at': p.created_at.isoformat()}
        for p in projects
    ]
    return jsonify(projects_list)

@project_bp.route('/projects', methods=['POST'])
@login_required
def create_project():
    data = request.get_json()
    new_project = Project(
        project_name=data.get('project_name'),
        user_id=current_user.id
    )
    db.session.add(new_project)
    db.session.commit()
    return jsonify({'message': 'Project created successfully'}), 201