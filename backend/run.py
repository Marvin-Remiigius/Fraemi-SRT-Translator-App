from app import create_app, db

app = create_app()

# This creates a new command that can be run from the terminal
# For example: 'flask init-db'
@app.cli.command("init-db")
def init_db():
    """Clear existing data and create new tables."""
    db.create_all()
    print("Initialized the database.")

if __name__ == '__main__':
    app.run(debug=True, port=5001)