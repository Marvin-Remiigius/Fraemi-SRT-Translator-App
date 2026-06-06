import os
import click
from flask import Flask, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_login import LoginManager
from flask_sqlalchemy import SQLAlchemy

# Initialize extensions outside the factory
db = SQLAlchemy()
bcrypt = Bcrypt()
login_manager = LoginManager()

def create_app():
    app = Flask(__name__, instance_relative_config=True)

    # --- Database Configuration ---
    app.config['SECRET_KEY'] = os.urandom(24)
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'postgresql://postgres.gfyxaykogeiyxmdkiixa:[YOUR-PASSWORD]@aws-1-ap-south-1.pooler.supabase.com:6543/postgres')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Initialize Extensions
    db.init_app(app)
    bcrypt.init_app(app)
    login_manager.init_app(app)
    
    # Allow requests from your specific Vercel URL
    CORS(app, resources={r"/api/*": {"origins": "https://fraemi-srt-translator-app.vercel.app"}})

    # --- CLI Commands ---
    @app.cli.command("init-db")
    def init_db_command():
        """Clear existing data and create new tables."""
        # Import models here so SQLAlchemy registers them
        from .models import User 
        # If you have Project or other models, import them here too:
        # from .models import User, Project, Translation
        
        db.create_all()
        click.echo("Initialized the database (tables created).")

    # --- User Loader ---
    from .models import User
    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    # --- Unauthorized Handler ---
    @login_manager.unauthorized_handler
    def unauthorized():
        return jsonify({'error': 'Authentication required. Please log in.'}), 401

    # --- Register Blueprints ---
    from .api.auth_routes import auth_bp
    from .api.project_routes import project_bp
    from .api.translate_routes import translate_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(project_bp, url_prefix='/api/projects')
    app.register_blueprint(translate_bp, url_prefix='/api/translate')

    return app