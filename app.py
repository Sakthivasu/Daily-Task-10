import os
from datetime import date, datetime
from flask import Flask, request, jsonify, session
from flask_cors import CORS
from flask_bcrypt import Bcrypt
import mysql.connector
from mysql.connector import pooling

app = Flask(__name__)

# Mandatory Security configurations
app.secret_key = "super-secure-key-change-in-production-environments"
bcrypt = Bcrypt(app)

# CORS Configuration allowing credentials and mapping to Vite's local dev server
CORS(app, supports_credentials=True, origins=["http://localhost:5173"])

# Robust Thread-safe Database Connection Pool configuration setup
db_pool = mysql.connector.pooling.MySQLConnectionPool(
    pool_name="tracker_pool",
    pool_size=5,
    host="localhost",
    user="root",         
    password="12345",  
    database="job_tracker"
)

def get_db_connection():
    """Retrieves a client connection instance with automatic dictionary transformation cursor mapping."""
    conn = db_pool.get_connection()
    return conn, conn.cursor(dictionary=True)

def safe_serialize_date(obj):
    """Converts native python dates and database timestamps safely into valid JSON strings."""
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    raise TypeError(f"Type {type(obj)} is not web JSON serializable.")

# --- USER AUTHENTICATION LAYER ---

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json or {}
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    confirm_password = data.get('confirmPassword')

    if not username or not email or not password:
        return jsonify({"error": "All verification entry slots are required"}), 400
    
    if password != confirm_password:
        return jsonify({"error": "Target credentials verification match failure"}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    
    conn, cursor = get_db_connection()
    try:
        query = "INSERT INTO users (username, email, password) VALUES (%s, %s, %s)"
        cursor.execute(query, (username, email, hashed_password))
        conn.commit()
        return jsonify({"message": "User registered successfully"}), 201
    except mysql.connector.Error as err:
        if err.errno == 1062:  # Duplicate Unique Constraint Key
            return jsonify({"error": "Username or Email identity array already registered"}), 400
        return jsonify({"error": "Internal infrastructure database failure"}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json or {}
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "Missing key identifier parameters"}), 400

    conn, cursor = get_db_connection()
    try:
        query = "SELECT * FROM users WHERE username = %s"
        cursor.execute(query, (username,))
        user = cursor.fetchone()

        if user and bcrypt.check_password_hash(user['password'], password):
            session['user_id'] = user['id']
            session['username'] = user['username']
            return jsonify({
                "message": "Session handshake authenticated",
                "user": {"id": user['id'], "username": user['username'], "email": user['email']}
            }), 200
        else:
            return jsonify({"error": "Invalid username or password validation mismatch"}), 401
    finally:
        cursor.close()
        conn.close()

@app.route('/api/logout', methods=['GET'])
def logout():
    session.clear()
    return jsonify({"message": "Session array dropped safely"}), 200

@app.route('/api/me', methods=['GET'])
def me():
    if 'user_id' not in session:
        return jsonify({"logged_in": False, "error": "Unauthorized session context"}), 401
    return jsonify({
        "logged_in": True,
        "user": {"id": session['user_id'], "username": session['username']}
    }), 200

# --- APPLICATIONS DATA DATA READ/WRITE CRUD LAYER ---

@app.route('/api/applications', methods=['GET'])
def get_applications():
    if 'user_id' not in session:
        return jsonify({"error": "Access validation denied"}), 401
    
    conn, cursor = get_db_connection()
    try:
        query = "SELECT * FROM applications WHERE user_id = %s ORDER BY applied_on DESC"
        cursor.execute(query, (session['user_id'],))
        apps = cursor.fetchall()
        
        for app_item in apps:
            app_item['applied_on'] = safe_serialize_date(app_item['applied_on'])
            app_item['updated_at'] = safe_serialize_date(app_item['updated_at'])
            
        return jsonify(apps), 200
    finally:
        cursor.close()
        conn.close()

@app.route('/api/applications', methods=['POST'])
def add_application():
    if 'user_id' not in session:
        return jsonify({"error": "Access validation denied"}), 401

    data = request.json or {}
    conn, cursor = get_db_connection()
    try:
        query = """
            INSERT INTO applications (user_id, company, role, status, applied_on, location, job_url, notes)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        params = (
            session['user_id'],
            data.get('company'),
            data.get('role'),
            data.get('status', 'Applied'),
            data.get('applied_on'),
            data.get('location'),
            data.get('job_url'),
            data.get('notes')
        )
        cursor.execute(query, params)
        conn.commit()
        return jsonify({"message": "Application index created safely"}), 201
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 400
    finally:
        cursor.close()
        conn.close()

@app.route('/api/applications/<int:app_id>', methods=['PUT'])
def update_application(app_id):
    if 'user_id' not in session:
        return jsonify({"error": "Access validation denied"}), 401

    data = request.json or {}
    conn, cursor = get_db_connection()
    try:
        # Step-verify absolute data ownership boundary structure
        check_query = "SELECT id FROM applications WHERE id = %s AND user_id = %s"
        cursor.execute(check_query, (app_id, session['user_id']))
        if not cursor.fetchone():
            return jsonify({"error": "Target trace data file not found or modification unauthorized"}), 404

        update_query = """
            UPDATE applications 
            SET company = %s, role = %s, status = %s, applied_on = %s, location = %s, job_url = %s, notes = %s
            WHERE id = %s AND user_id = %s
        """
        params = (
            data.get('company'),
            data.get('role'),
            data.get('status'),
            data.get('applied_on'),
            data.get('location'),
            data.get('job_url'),
            data.get('notes'),
            app_id,
            session['user_id']
        )
        cursor.execute(update_query, params)
        conn.commit()
        return jsonify({"message": "Application file modifications committed successfully"}), 200
    finally:
        cursor.close()
        conn.close()

@app.route('/api/applications/<int:app_id>', methods=['DELETE'])
def delete_application(app_id):
    if 'user_id' not in session:
        return jsonify({"error": "Access validation denied"}), 401

    conn, cursor = get_db_connection()
    try:
        query = "DELETE FROM applications WHERE id = %s AND user_id = %s"
        cursor.execute(query, (app_id, session['user_id']))
        conn.commit()
        
        if cursor.rowcount == 0:
            return jsonify({"error": "Pipeline item not found or modification unauthorized"}), 404
            
        return jsonify({"message": "Index erased from database array"}), 200
    finally:
        cursor.close()
        conn.close()

@app.route('/api/applications/stats', methods=['GET'])
def get_stats():
    if 'user_id' not in session:
        return jsonify({"error": "Access validation denied"}), 401

    conn, cursor = get_db_connection()
    try:
        uid = session['user_id']
        
        # 1. Total Application Metrics Count
        cursor.execute("SELECT COUNT(*) as total FROM applications WHERE user_id = %s", (uid,))
        total = cursor.fetchone()['total']

        # 2. Key Status Counts Breakdown List mapping
        cursor.execute("SELECT status, COUNT(*) as count FROM applications WHERE user_id = %s GROUP BY status", (uid,))
        status_rows = cursor.fetchall()
        
        # Ensure default baseline definitions exist matching standard state structures
        status_counts = {
            'Applied': 0, 'Shortlisted': 0, 'Interview Scheduled': 0, 'Offer Received': 0, 'Rejected': 0
        }
        for row in status_rows:
            status_counts[row['status']] = row['count']

        # 3. Stream modern recent entries array list
        cursor.execute("SELECT * FROM applications WHERE user_id = %s ORDER BY id DESC LIMIT 5", (uid,))
        latest_apps = cursor.fetchall()
        for app_item in latest_apps:
            app_item['applied_on'] = safe_serialize_date(app_item['applied_on'])
            app_item['updated_at'] = safe_serialize_date(app_item['updated_at'])

        return jsonify({
            "total": total,
            "status_counts": status_counts,
            "latest": latest_apps
        }), 200
    finally:
        cursor.close()
        conn.close()

if __name__ == '__main__':
    app.run(port=5000, debug=True)