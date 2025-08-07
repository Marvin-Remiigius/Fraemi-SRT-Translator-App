from . import db  # This 'db' object will be our SQLAlchemy instance
from flask_login import UserMixin

# The User model now defines the 'users' table in our database
class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    # This creates a relationship, allowing you to access a user's projects easily
    projects = db.relationship('Project', backref='author', lazy=True)

# The Project model defines the 'projects' table
class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    project_name = db.Column(db.String(255), nullable=False)
    srt_content = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)