from flask import Blueprint, request, jsonify
from .. import db, bcrypt
from ..models import User
from flask_login import login_user, logout_user, login_required, current_user
from sqlalchemy.exc import IntegrityError

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    # Check if user already exists by email
    user = User.query.filter_by(email=data.get('email')).first()
    if user:
        return jsonify({'error': 'User with that email already exists'}), 409

    # Check if user already exists by username
    user = User.query.filter_by(username=data.get('username')).first()
    if user:
        return jsonify({'error': 'User with that username already exists'}), 409

    hashed_password = bcrypt.generate_password_hash(data.get('password')).decode('utf-8')
    new_user = User(
        username=data.get('username'),
        email=data.get('email'),
        password_hash=hashed_password
    )
    db.session.add(new_user)
    import logging
    try:
        db.session.commit()
        return jsonify({'message': 'User registered successfully'}), 201
    except Exception as e:
        db.session.rollback()
        logging.error(f"Error during user registration: {e}")
        return jsonify({'error': 'Registration failed due to server error'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data.get('email')).first()
    if user and bcrypt.check_password_hash(user.password_hash, data.get('password')):
        login_user(user) # Session magic
        return jsonify({'message': 'Logged in successfully', 'username': user.username})
    return jsonify({'error': 'Invalid credentials'}), 401

@auth_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Logged out successfully'})

@auth_bp.route('/status', methods=['GET'])
@login_required
def status():
    return jsonify({'username': current_user.username})

@auth_bp.route('/user', methods=['GET', 'PUT'])
@login_required
def user_profile():
    if request.method == 'GET':
        return jsonify({
            'username': current_user.username,
            'email': current_user.email
        })
    
    if request.method == 'PUT':
        data = request.get_json()
        
        # Check for uniqueness if username/email is being changed
        if 'username' in data and data['username'] != current_user.username:
            if User.query.filter_by(username=data['username']).first():
                return jsonify({'error': 'Username already taken'}), 409
            current_user.username = data['username']
            
        if 'email' in data and data['email'] != current_user.email:
            if User.query.filter_by(email=data['email']).first():
                return jsonify({'error': 'Email already registered'}), 409
            current_user.email = data['email']
        
        try:
            db.session.commit()
            return jsonify({'message': 'Profile updated successfully'})
        except IntegrityError:
            db.session.rollback()
            return jsonify({'error': 'An error occurred. Please try again.'}), 500
