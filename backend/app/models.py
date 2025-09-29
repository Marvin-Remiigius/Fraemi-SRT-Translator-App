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

# --- SrtFile Model (REVISED) ---
# This table now only stores the original uploaded SRT files.
class SrtFile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    original_content = db.Column(db.Text, nullable=False)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    
    # This relationship links an original file to its various translations.
    translations = db.relationship('TranslatedFile', backref='original_file', lazy=True, cascade="all, delete-orphan")

# --- TranslatedFile Model (NEW) ---
# This new table stores the translated versions of an SRT file.
class TranslatedFile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    target_language = db.Column(db.String(50), nullable=False)
    
    # Foreign key linking back to the original SrtFile.
    original_file_id = db.Column(db.Integer, db.ForeignKey('srt_file.id'), nullable=False)
    
    # We also link to the project for easier querying.
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
