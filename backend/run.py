from app import create_app, db
from app.models import User, Project, SrtFile

app = create_app()

# This creates a new command that can be run from the terminal
# For example: 'flask init-db'
@app.cli.command("init-db")
def init_db_command():
    """Clear existing data and create new tables."""
    with app.app_context():
        db.create_all()
    print("Initialized the database.")

if __name__ == '__main__':
    app.run(debug=True, port=5000)
