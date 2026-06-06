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

    # --- Database & Session Configuration ---
    # FIXED: Use a static environment variable for the Secret Key instead of regenerating it
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev_fallback_secret_key_12345')
    
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'postgresql://postgres.gfyxaykogeiyxmdkiixa:[YOUR-PASSWORD]@aws-1-ap-south-1.pooler.supabase.com:6543/postgres')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Required to allow session cookies across different domains (Vercel to Render)
    app.config['SESSION_COOKIE_SAMESITE'] = 'None'
    # For cookies with SameSite=None, browsers require Secure cookies.
    # Default to True unless explicitly overridden.
    app.config['SESSION_COOKIE_SECURE'] = os.environ.get('SESSION_COOKIE_SECURE', 'true').lower() == 'true'

    # Initialize Extensions
    db.init_app(app)
    bcrypt.init_app(app)
    login_manager.init_app(app)
    
    # --- FIXED CORS CONFIGURATION ---
    # Added supports_credentials=True so Flask accepts the frontend's cookies
    CORS(app, supports_credentials=True, resources={
        r"/api/*": {
            "origins": [
                "https://fraemi-srt-translator-app.vercel.app", 
                "http://localhost:5173"  
            ]
        }
    })

    # --- CLI Commands ---
    @app.cli.command("init-db")
    def init_db_command():
        """Clear existing data and create new tables."""
        from .models import User 
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