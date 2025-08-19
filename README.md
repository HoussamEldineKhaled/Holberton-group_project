# Holberton Group Project

The first topic we had in mind, which came from both love of community and admiration for the arts, is a community website in which all users may express themselves or share their
reflection to the world through their art. The art would be shared through individual posts be certain users and can be in the form of an audio, a photo, a painting, a video, etc.
The website will be community driven, meaning that there will be no material profit from any of the posts and works displayed. The website will include community moderation to insure the
following of ethical rules in addition to an AI tool which will also enforce these rules. This website is aimed to encourage a creative community on all artistic endeavours, discussions of art between people, and
creative solidarity between users. Rules and conditions will be put in place in order to ensure a smooth and positive environment with in the wbesite. The impact of this is the potential revitalisation of artistic communities which
robust moderation both manual and automated. Finally, the team was formed of two people, Houssam Khaled and Mohammad Aoun, who will be working together and contact each other through WhatsApp for texting and calling
and github for code sharing.

---

## Prerequisites

Make sure you have the following installed:

- [Visual Studio Code](https://code.visualstudio.com/)  
- [Python 3.x](https://www.python.org/downloads/)  
- [Git](https://git-scm.com/downloads)  

---

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/HoussamEldineKhaled/Holberton-group_project.git
   cd Holberton-group_project
   ```

2. **Open the project in VS Code**
   ```bash
   code .
   ```

3. **Create a virtual environment**
   ```bash
   python -m venv .venv
   ```

4. **Activate the virtual environment (Windows PowerShell)**
   ```bash
   powershell -ExecutionPolicy Bypass -NoProfile -File .\.venv\Scripts\Activate.ps1
   ```

5. **Install dependencies**
   ```bash
   pip install flask flask-cors
   ```

---

## Database

The project uses `ArtSiteGallery.db` (SQLite).  
You can open it in your browser using: [https://beta.sqliteviewer.app/](https://beta.sqliteviewer.app/)

⚠️ **Note:** After inserting new records (e.g., creating a new post), you need to **reload the database file** in the SQLite viewer to see the updated data.

---

## Running the Project

### 1. Start the backend (Flask API)
From the root project folder:
```bash
python backend/main.py
```
This starts the backend at `http://127.0.0.1:5000/`.

### 2. Start the frontend (simple static server)
From the `frontend` folder:
```bash
cd frontend
python -m http.server 5173
```
This serves the frontend at [http://localhost:5173/](http://localhost:5173/).

---

## Authentication

- New users can sign up from `signup.html`.  
- Existing users can log in from `login.html`.  
- Authenticated users can create posts via `upload-post.html`.  

The login/signup pages store user information in `localStorage` so the session is preserved for posting.

---

## Project Structure

```
Holberton-group_project/
│
├── backend/              # Flask backend
│   └── main.py
│
├── frontend/             # Static frontend (HTML/CSS/JS)
│   ├── login.html / .css / .js
│   ├── signup.html / .css / .js
│   ├── upload-post.html / .css / .js
│   └── images/
│
├── ArtSiteGallery.db     # SQLite database
└── README.md
```

---

## Notes

- Use Chrome/Edge/Firefox for best results.  
- Ensure backend (`:5000`) and frontend (`:5173`) are both running before logging in or uploading posts.  

---
