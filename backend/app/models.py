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