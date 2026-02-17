# Fraemi SRT Translator

**Fraemi SRT Translator** is a full-stack, AI-powered platform designed to help professional dubbing studios manage and translate `.srt` subtitle files. The application provides a secure, multi-user environment where studios can manage their projects efficiently. It features a scalable backend and a modern frontend designed for an intuitive user experience.

---

## Project Overview

The Fraemi SRT Translator is architected as a modern web application with a distinct **frontend** and **backend**.

- **Backend:** A robust REST API built with Flask that handles user authentication, secure data storage, project management, and integration with third-party AI translation services.
- **Frontend:** A dynamic Single Page Application (SPA) built with React, offering a seamless interface for registration, login, dashboards, and file management.

---

## Key Features

- **Secure User Authentication**  
  Users can register and log in to secure accounts. Passwords are encrypted using Bcrypt.

- **Private Project Dashboards**  
  Authenticated users have access only to their projects via persistent login sessions.

- **Scalable Architecture**  
  Backend uses Flask's Application Factory pattern and Blueprints for maintainability and scalability.

- **AI Integration Ready**  
  Designed for seamless integration with AI translation services (e.g., Google Generative AI).

---

## Technology Stack

### Backend
- **Framework:** Flask
- **Database:** SQLite (development)
- **ORM:** Flask-SQLAlchemy
- **Authentication:** Flask-Login, Flask-Bcrypt

### Frontend
- **Framework:** React
- **Build Tool:** Vite
- **Styling:** CSS

---

## Frontend Setup & Installation

### 1. Prerequisites
- Node.js (v16 or higher is recommended)
- `npm` (Node Package Manager), which comes with Node.js

### 2. Installation

```bash
# Navigate to the frontend directory
cd frontend

# Install all the required dependencies
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the `frontend` directory to connect with the backend API.

```
# Example for a Vite-based project
VITE_API_BASE_URL=http://127.0.0.1:5000
```

### 4. Running the App

```bash
# Start the local development server
npm run dev
```

The frontend will be available at: **http://localhost:5173** (or similar, check the console output).

---

## Backend Setup & Installation

### 1. Prerequisites
- Python 3.10 or higher
- `pip` and `venv` for package management

### 2. Installation

```bash
# Clone the repository
git clone [your-repository-url]
cd Fraemi-SRT-Translator-App

# Create and activate a virtual environment
python3 -m venv backend/venv

# Activate (macOS/Linux)
source backend/venv/bin/activate

# Activate (Windows)
backend\venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt
```

### 3. Configure Flask Environment

Create a `.flaskenv` file in the project root and add:

```
FLASK_APP=backend/run.py
GOOGLE_API_KEY={API_KEY_PLACEHOLDER}
```

### 4. Initialize the Database

```bash
flask init-db
```

This creates `database.db` and all necessary tables.

### 5. Running the Server

```bash
python backend/run.py
```

The API will now be available at:  
**http://127.0.0.1:5000**

---

## API Endpoints

### Authentication (`/auth`)

| Method | Endpoint         | Description                  |
|--------|------------------|------------------------------|
| POST   | `/auth/register` | Register a new user          |
| POST   | `/auth/login`    | Log in a user                |
| POST   | `/auth/logout`   | Log out the current session  |

### Projects (`/api`)  
*Note: Requires authentication.*

| Method | Endpoint          | Description                             |
|--------|-------------------|-----------------------------------------|
| GET    | `/api/projects`   | Fetch all projects for the user         |
| POST   | `/api/projects`   | Create a new project for the user       |
| GET    | `/api/projects/<id>` | Fetch a specific project               |
| PUT    | `/api/projects/<id>` | Update a project                       |
| DELETE | `/api/projects/<id>` | Delete a project                       |

### SRT Files (`/api`)  
*Note: Requires authentication.*

| Method | Endpoint          | Description                             |
|--------|-------------------|-----------------------------------------|
| POST   | `/api/translate`  | Translate an SRT file                   |

---

## Project Roadmap

### Backend
- [x] User authentication & session management
- [x] Project creation & retrieval
- [x] SRT file upload & management
- [x] Integration with Google Generative AI for translations

### Frontend
- [x] User registration & login UI
- [x] Project dashboard & file management UI
- [ ] Character Count Finder
- [ ] Sign Up enhancements
- [ ] Adding File enhancements

### Full Stack
- [ ] Team collaboration features
- [ ] Subscription plans for B2B clients
- [ ] Dynamic Login

---

## License

MIT License

---

## Contributions

Contributions are welcome! Please open issues or submit pull requests.

---

## Built by

Students from Panimalar Engineering College IT Department  
Fraemi Vision — [fraemivision.in](https://fraemivision.in)

-----
