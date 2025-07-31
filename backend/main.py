from flask import Flask, jsonify
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

if __name__ == '__main__':
    app.run(debug=True)
