from flask import Flask, jsonify, request, render_template
import sqlite3
from flask_cors import CORS

app = Flask(__name__)

cors = CORS(app)

def get_db_connection():
    conn = sqlite3.connect('ArtSiteGallery.db')
    conn.row_factory = sqlite3.Row
    return conn


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

@app.route('/uploadUserPost', methods=['POST'])
def uploadPost():
    data = request.get_json()
    
    title = data.get('title')
    description = data.get('description')
    user_id = data.get('U_id')
    attachments = data.get('Attachments', [])
    
    if not title or not user_id:
        return jsonify({'error': 'Title and user_id are required'}), 400
    
    conn = get_db_connection()
    
    cursor = conn.cursor()
    
    try:
        cursor.execute('INSERT INTO Post (title, description, U_id, Post_time) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
                (title, description, user_id))
            
        post_id = cursor.lastrowid
            
        for attachment in attachments:
            a_type = attachment.get('A_type')
            file_size = attachment.get('File_size')
            a_name = attachment.get('A_name')
            cursor.execute('INSERT INTO Attachments (A_type, File_size, A_name, A_time, P_Id) VALUES (?, ?, ?, CURRENT_TIMESTAMP, ?)',
                (a_type, file_size, a_name, post_id))
            
        conn.commit()
        return jsonify({'Message': 'Post uploaded successfully'}), 201
    except Exception as e:
        return jsonify({'Error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()
    
    


if __name__ == '__main__':
    app.run(debug=True)
