from flask import Flask, jsonify, request, render_template, redirect
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
    cursor.execute("SELECT * FROM Accounts;")
    tables = cursor.fetchall()
    table_names = [table['User_Name'] for table in tables]
    
    conn.close()
    
    return jsonify(table_names)

@app.route('/sign_up', methods=['POST'])
def sign_up():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO Account(Id, User_name, Email, Password, User_Role, Instagram, GitHub, Twitter) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
    conn.commit()
    conn.close()
    return "User created account successfully", 200

@app.route('/login', methods=['POST', 'GET'])
def login():
    return render_template('../frontend/login.html')



if __name__ == '__main__':
    app.run(debug=True)
