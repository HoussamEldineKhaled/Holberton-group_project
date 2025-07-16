from config import db
from datetime import datetime
# create the database model

#Account table
class Account(db.Model):
    __tablename__ = 'Account'
    
    Id = db.Column(db.Integer, primary_key = True, nullable=False)
    User_name = db.Column(db.String(255), nullable=False, unique=True)
    Email = db.Column(db.String(255))
    Password = db.Column(db.String(255), nullable=False)
    User_Role = db.Column(db.Integer, nullable=False)
    Instagram = db.Column(db.String(255))
    GitHub = db.Column(db.String(255))
    Twitter = db.Column(db.String(255))
    
    posts = db.relationship('Post', backref='author', lazy=True)
    
    def to_json(self):
        return {
            "Id": self.Id,
            "User_name": self.User_name,
            "Email": self.Email,
            "Password": self.Password,
            "User_Role": self.User_Role,
            "Instagram": self.Instagram,
            "GitHub": self.GitHub,
            "Twitter": self.Twitter
        }

#Post table
class Post(db.Model):
    __tablename__ = 'Post'
    P_id = db.Column(db.Integer, primary_key = True, nullable=False)
    Title = db.Column(db.String(255))
    Description = db.Column(db.String(255))
    U_Id = db.Column(db.Integer, db.ForeignKey('Account.Id'), nullable=False)
    Post_time = db.Column(db.DateTime,default=datetime.utcnow)
    def to_json(self):
        return {
            "P_Id": self.P_id,
            "Title": self.Title,
            "Description": self.Description,
            "U_Id": self.U_Id,
            "Post_time": self.Post_time.isoformat() if self.Post_time else None
        }

class Likes(db.Model):
    __tablename__='Likes'
    L_Id = db.Column(db.Integer, primary_key=True, nullable=False)
    U_Id = db.Column(db.Integer, db.ForeignKey(''), nullable=False)
    P_id = db.Column(db.Integer)
    Like_time = db.Column()

