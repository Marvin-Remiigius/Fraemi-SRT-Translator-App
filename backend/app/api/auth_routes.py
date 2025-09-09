from flask import Blueprint, request, jsonify, session
from .. import db, bcrypt
from ..models import User
from flask_login import login_user, logout_user, login_required, current_user

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Check if user already exists
    user = User.query.filter_by(email=data.get('email')).first()
    if user:
        return jsonify({'error': 'User with that email already exists'}), 409
    
    # Create new user
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
    data = request.get_json()
    user = User.query.filter_by(email=data.get('email')).first()
    
    if user and bcrypt.check_password_hash(user.password_hash, data.get('password')):
        # Login the user with remember=True for persistent session
        login_user(user, remember=True)
        # Make session permanent
        session.permanent = True
        
        return jsonify({
            'message': 'Logged in successfully',
            'username': user.username,
            'user_id': user.id,
            'email': user.email
        }), 200
    
    return jsonify({'error': 'Invalid credentials'}), 401

@auth_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Logged out successfully'}), 200

@auth_bp.route('/status', methods=['GET'])
def status():
    """
    Check if the user is currently logged in.
    This endpoint doesn't require @login_required so it won't return 401
    """
    if current_user.is_authenticated:
        return jsonify({
            'logged_in': True,
            'username': current_user.username,
            'user_id': current_user.id,
            'email': current_user.email
        }), 200
    else:
        return jsonify({'logged_in': False}), 200