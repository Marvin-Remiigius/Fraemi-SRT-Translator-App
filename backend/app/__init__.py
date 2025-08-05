from flask import Flask

def create_app():
    app = Flask(__name__)

    # Import and register the API blueprint
    from .api.translate_routes import api_bp
    app.register_blueprint(api_bp, url_prefix='/api/v1')

    @app.route('/health')
    def health_check():
        return "Backend server is running!"

    return app