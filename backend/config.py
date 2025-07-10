from flask import FLask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = FLask(__name__)

CORS(app)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///ArtSiteGallery.db"

app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)