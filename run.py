# This file starts our Flask application server.
from backend.app import create_app

app = create_app()

if __name__ == '__main__':
    # We run in debug mode for development to get helpful error messages.
    app.run(debug=True, port=5000)