from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_login import LoginManager
from flask_sqlalchemy import SQLAlchemy
import os

db = SQLAlchemy()
bcrypt = Bcrypt()
login_manager = LoginManager()

def create_app():
    app = Flask(__name__)

    # --- THIS IS THE DEFINITIVE FIX FOR THE CORS & REFRESH ISSUE ---
    @app.before_request
    def handle_preflight():
        """
        This function runs before every request.
        It handles the browser's preflight 'OPTIONS' request to ensure that
        subsequent requests with credentials (cookies) are allowed.
        """
        if request.method.lower() == 'options':
            # This is the preflight request. Respond immediately with a 200 OK.
            return jsonify(success=True), 200
    # --- END OF FIX ---

    # --- Configuration ---
    app.config['SECRET_KEY'] = os.urandom(24)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Configure the session cookie for a local HTTP environment.
    app.config.update(
        SESSION_COOKIE_SAMESITE='None',
        SESSION_COOKIE_SECURE=False 
    )

    # --- Initialize Extensions with the App ---
    db.init_app(app)
    bcrypt.init_app(app)
    login_manager.init_app(app)
    # This CORS call is still necessary to add the correct headers to
    # the actual GET/POST requests after the preflight check succeeds.
    CORS(app, supports_credentials=True, origins="http://localhost:5173")

    # --- User Loader & Handlers ---
    from .models import User
    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    @login_manager.unauthorized_handler
    def unauthorized():
        return jsonify({'error': 'Authentication required. Please log in.'}), 401

    # --- Register Blueprints ---
    from .api.auth_routes import auth_bp
    from .api.project_routes import project_bp
    from .api.translate_routes import translate_bp
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(project_bp, url_prefix='/api')
    app.register_blueprint(translate_bp, url_prefix='/api')

    return app

