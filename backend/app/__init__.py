import os
import click
from flask import Flask, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_login import LoginManager
from flask_sqlalchemy import SQLAlchemy
from werkzeug.middleware.proxy_fix import ProxyFix

# Initialize extensions outside the factory
db = SQLAlchemy()
bcrypt = Bcrypt()
login_manager = LoginManager()

def create_app():
    app = Flask(__name__, instance_relative_config=True)
    # Tell Flask it is behind Render's secure proxy
    app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_prefix=1)

    # --- Database & Session Configuration ---
    # FIXED: Use a static environment variable for the Secret Key instead of regenerating it
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev_fallback_secret_key_12345')
    
    # No hardcoded fallback: the previous default embedded the Supabase host and
    # user in source control, and its placeholder password could never connect
    # anyway — it only turned a missing-config error into a confusing one.
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        raise RuntimeError(
            'DATABASE_URL is not set. Configure it in the environment '
            '(Render dashboard, or a local .env) before starting the app.'
        )
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # The frontend is served from a different origin than this API, so the
    # session cookie must be SameSite=None, which browsers only honour when
    # Secure is also set.
    app.config['SESSION_COOKIE_SAMESITE'] = 'None'

    # 3. Keeps it locked behind your Vercel/Render SSL certificates
    app.config['SESSION_COOKIE_SECURE'] = True
    # Initialize Extensions
    db.init_app(app)
    bcrypt.init_app(app)
    login_manager.init_app(app)
    
    # --- FIXED CORS CONFIGURATION ---
    # Added supports_credentials=True so Flask accepts the frontend's cookies
    # CORS(app, supports_credentials=True, resources={
    #     r"/api/*": {
    #         "origins": [
    #             "https://fraemi-srt-translator-app.vercel.app", 
    #             "http://localhost:5173",
    #             "http://127.0.0.1:5173",
    #             "https://app.fraemivision.in"
    #         ]
    #     }
    # })

    CORS(app, supports_credentials=True, origins=["https://app.fraemivision.in"])

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