from flask import Blueprint, request, jsonify
from .. import db, bcrypt
from ..models import User
from flask_login import login_user, logout_user, login_required, current_user

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    # ... (existing code)
    data = request.get_json()
    user = User.query.filter_by(email=data.get('email')).first()
    if user:
        return jsonify({'error': 'User with that email already exists'}), 409
    hashed_password = bcrypt.generate_password_hash(data.get('password')).decode('utf-8')
    new_user = User(
        username=data.get('username'),
        email=data.get('email'),
        password_hash=hashed_password
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'User registered successfully'}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    # ... (existing code)
    data = request.get_json()
    user = User.query.filter_by(email=data.get('email')).first()
    if user and bcrypt.check_password_hash(user.password_hash, data.get('password')):
        login_user(user)
        return jsonify({'message': 'Logged in successfully', 'username': user.username})
    return jsonify({'error': 'Invalid credentials'}), 401

@auth_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    # ... (existing code)
    logout_user()
    return jsonify({'message': 'Logged out successfully'})

# --- NEW ENDPOINT ---
@auth_bp.route('/status')
@login_required
def status():
    """
    An endpoint to check if the user is currently logged in.
    The @login_required decorator handles everything. If the user has a valid
    session cookie, this code will run. If not, it will return a 401 error.
    """
    return jsonify({
        'logged_in': True,
        'username': current_user.username
    })