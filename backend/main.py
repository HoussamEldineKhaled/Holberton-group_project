from flask import Flask, jsonify, request, render_template, send_file
import sqlite3
from flask_cors import CORS
import os
import uuid
from werkzeug.utils import secure_filename

app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "http://localhost:5500"}}, supports_credentials=True)

app.config['UPLOAD_DIR'] = os.path.join(app.root_path, 'uploads')
os.makedirs(app.config['UPLOAD_DIR'], exist_ok=True)


def get_db_connection():
    conn = sqlite3.connect(
        'ArtSiteGallery.db',
        timeout=10,              # wait up to 10s if DB is locked
        check_same_thread=False  # allow usage across threads
    )
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL;")  # enable WAL for better concurrency
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
    
    try:
        cursor.execute(
            "INSERT INTO Account(User_name, Email, Password, User_Role, Instagram, GitHub, Twitter) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (user_name, email, password, 0, '', '', '')
        )
        conn.commit()
        return jsonify({"Message": "Successful account creation"}), 201
    except sqlite3.IntegrityError as e:
        conn.rollback()
        return jsonify({"Error": "User already exists or invalid data"}), 409
    except Exception as e:
        conn.rollback()
        return jsonify({"Error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


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
        return jsonify({"Message": "Login successful", "id": user["id"]}), 200
    else:
        return jsonify({"Error": "Invalid email or password"}), 401


@app.route('/uploadUserPost', methods=['POST'])
def uploadPost():
    ct = request.content_type or ""
    if ct.startswith('multipart/form-data'):
        form = request.form
        title = (form.get('title') or '').strip()
        description = (form.get('description') or None)
        user_id = (form.get('U_id') or form.get('userId') or '').strip()

        if not title or not user_id:
            return jsonify({'Error': 'Title and user_id are required'}), 400

        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            cursor.execute(
                'INSERT INTO Post (title, description, U_id, Post_time) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
                (title, description, user_id)
            )
            post_id = cursor.lastrowid

            files = (request.files.getlist('attachments') or
                     request.files.getlist('attachments[]') or [])
            saved = 0

            if files:
                post_dir = os.path.join(app.config['UPLOAD_DIR'], str(post_id))
                os.makedirs(post_dir, exist_ok=True)

                for f in files:
                    if not f or not f.filename:
                        continue
                    original_name = f.filename
                    safe_name = secure_filename(original_name) or "file"
                    unique_name = f"{uuid.uuid4().hex}_{safe_name}"
                    save_path = os.path.join(post_dir, unique_name)

                    f.save(save_path)

                    mime = f.mimetype or 'application/octet-stream'
                    size = os.path.getsize(save_path)

                    cursor.execute(
                        'INSERT INTO Attachments (A_type, File_size, A_name, A_time, P_Id) '
                        'VALUES (?, ?, ?, CURRENT_TIMESTAMP, ?)',
                        (mime, size, original_name, post_id)
                    )
                    saved += 1

            conn.commit()
            return jsonify({
                'Message': 'Post uploaded successfully',
                'post_id': post_id,
                'attachments_saved': saved
            }), 201

        except Exception as e:
            conn.rollback()
            return jsonify({'Error': str(e)}), 500
        finally:
            cursor.close()
            conn.close()

    data = request.get_json(silent=True) or {}

    title = data.get('title')
    description = data.get('description')
    user_id = data.get('U_id')
    attachments = data.get('Attachments', [])

    if not title or not user_id:
        return jsonify({'Error': 'Title and user_id are required'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            'INSERT INTO Post (title, description, U_id, Post_time) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
            (title, description, user_id)
        )
        post_id = cursor.lastrowid

        for attachment in attachments:
            a_type = attachment.get('A_type') or 'application/octet-stream'
            file_size = attachment.get('File_size') or 0
            a_name = attachment.get('A_name') or 'file'
            cursor.execute(
                'INSERT INTO Attachments (A_type, File_size, A_name, A_time, P_Id) '
                'VALUES (?, ?, ?, CURRENT_TIMESTAMP, ?)',
                (a_type, file_size, a_name, post_id)
            )

        conn.commit()
        return jsonify({
            'Message': 'Post uploaded successfully',
            'post_id': post_id,
            'attachments_saved': len(attachments)
        }), 201
    except Exception as e:
        conn.rollback()
        return jsonify({'Error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@app.route('/posts', methods=['GET'])
def get_posts():
    try:
        page = int(request.args.get('page', 1))
    except ValueError:
        page = 1
    page = max(page, 1)

    try:
        page_size = int(request.args.get('page_size', 20))
    except ValueError:
        page_size = 20
    page_size = max(1, min(page_size, 100))

    user_id = request.args.get('user_id')
    include_attachments = request.args.get('include_attachments', '0') in ('1', 'true', 'True')
    sort = request.args.get('sort', 'latest').lower()
    order_clause = 'DESC' if sort == 'latest' else 'ASC'
    q = (request.args.get('q') or '').strip()
    q_like = f"%{q.lower()}%" if q else None

    conn = get_db_connection()
    cur = conn.cursor()

    try:
        where = []
        args = []

        if user_id is not None and str(user_id).strip() != "":
            where.append("p.U_id = ?")
            args.append(user_id)

        if q_like:
            where.append("""
                (
                  LOWER(p.title) LIKE ?
                  OR LOWER(IFNULL(p.description,'')) LIKE ?
                  OR LOWER(IFNULL(a.User_name,'')) LIKE ?
                )
            """)
            args.extend([q_like, q_like, q_like])

        where_sql = ("WHERE " + " AND ".join(where)) if where else ""

        cur.execute(f"SELECT COUNT(*) AS cnt FROM Post p LEFT JOIN Account a ON a.id = p.U_id {where_sql}", args)
        total = cur.fetchone()["cnt"]

        offset = (page - 1) * page_size

        posts_sql = f"""
            SELECT
                p.p_id as id,
                p.title,
                p.description,
                p.U_id AS author_id,
                p.Post_time AS post_time,
                a.User_name AS author_name,
                IFNULL(att.cnt, 0) AS attachments_count
            FROM Post p
            LEFT JOIN Account a ON a.id = p.U_id
            LEFT JOIN (
                SELECT P_Id, COUNT(*) AS cnt
                FROM Attachments
                GROUP BY P_Id
            ) att ON att.P_Id = p.p_id
            {where_sql}
            ORDER BY p.Post_time {order_clause}, p.p_id {order_clause}
            LIMIT ? OFFSET ?
        """
        cur.execute(posts_sql, args + [page_size, offset])
        rows = cur.fetchall()

        payload = []
        post_ids = [r["id"] for r in rows]

        attachments_map = {}
        if include_attachments and post_ids:
            placeholders = ",".join(["?"] * len(post_ids))
            cur.execute(
                f"""
                SELECT
                    A_id as id, A_type, File_size, A_name, A_time, P_Id
                FROM Attachments
                WHERE P_Id IN ({placeholders})
                ORDER BY A_time DESC, id DESC
                """,
                post_ids
            )
            for att in cur.fetchall():
                pid = att["P_Id"]
                attachments_map.setdefault(pid, []).append({
                    "id": att["id"],
                    "A_type": att["A_type"],
                    "File_size": att["File_size"],
                    "A_name": att["A_name"],
                    "A_time": att["A_time"]
                })

        for r in rows:
            item = {
                "id": r["id"],
                "title": r["title"],
                "description": r["description"],
                "post_time": r["post_time"],
                "author": {"id": r["author_id"], "name": r["author_name"]},
                "attachments_count": r["attachments_count"]
            }
            if include_attachments:
                item["attachments"] = attachments_map.get(r["id"], [])
            payload.append(item)

        return jsonify({
            "data": payload,
            "page": page,
            "page_size": page_size,
            "total": total
        }), 200

    except Exception as e:
        return jsonify({"Error": str(e)}), 500
    finally:
        cur.close()
        conn.close()


@app.route('/attachments/<int:att_id>', methods=['GET'])
def get_attachment(att_id: int):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT A_name, P_Id, A_type FROM Attachments WHERE A_id = ?", (att_id,))
        row = cur.fetchone()
        if not row:
            return jsonify({"Error": "Attachment not found"}), 404

        post_id = row["P_Id"]
        original = secure_filename(row["A_name"] or "file")
        post_dir = os.path.join(app.config.get('UPLOAD_DIR', os.path.join(app.root_path, 'uploads')), str(post_id))
        if not os.path.isdir(post_dir):
            return jsonify({"Error": "File not found"}), 404

        chosen_path = None
        for name in os.listdir(post_dir):
            if name == original or name.endswith(f"_{original}"):
                chosen_path = os.path.join(post_dir, name)
                break

        if not chosen_path or not os.path.isfile(chosen_path):
            return jsonify({"Error": "File not found"}), 404

        return send_file(chosen_path, mimetype=row["A_type"] or None)
    finally:
        cur.close()
        conn.close()


if __name__ == '__main__':
    app.run(debug=True)
