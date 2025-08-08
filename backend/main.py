from flask import Flask, jsonify, request, render_template
import sqlite3
from flask_cors import CORS

app = Flask(__name__)

cors = CORS(app)

def get_db_connection():
    conn = sqlite3.connect('ArtSiteGallery.db')
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/api/tables', methods=['GET'])
def get_tables():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Account;")
    tables = cursor.fetchall()
    table_names = [table['User_Name'] for table in tables]
    
    conn.close()
    
    return jsonify(table_names)

@app.route('/sign_up', methods=['POST'])
def sign_up():
    data = request.get_json()
    
    user_name = data.get('User_name')
    email = data.get('Email')
    password = data.get('Password')
    
    if not all([user_name, email, password]):
        return jsonify({"Error": "Missing Fields"}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("INSERT INTO Account(User_name, Email, Password, User_Role, Instagram, GitHub, Twitter) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (user_name, email, password, 0, '', '', ''))
    conn.commit()
    conn.close()
    return jsonify({"Message": "Successful account creation"}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    email = data.get('Email')
    password = data.get('Password')
    
    if not email or not password:
        return jsonify({"Error": "Email and password not entered"})
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM ACCOUNT WHERE Email = ? AND Password = ?", 
            (email, password))
    user = cursor.fetchone()
    
    conn.close()
    
    if user:
        return jsonify({"Message": "Login successful"}), 200
    else:
        return jsonify({"Error": "Invalid email or password"}), 401



if __name__ == '__main__':
    app.run(debug=True)
