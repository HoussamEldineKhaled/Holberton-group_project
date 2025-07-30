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
    
    posts = db.relationship('Post', backref='', lazy=True)
    comments = db.relationship('Comments', backref='', lazy=True)
    likes = db.relationship('Likes', backref='', lazy=True)
    
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
    P_Id = db.Column(db.Integer, primary_key = True, nullable=False)
    Title = db.Column(db.String(255))
    Description = db.Column(db.String(500))
    U_Id = db.Column(db.Integer, db.ForeignKey('Account.Id'), nullable=False)
    Post_time = db.Column(db.Date)
    
    attachments = db.relationship('Attachments', backref='')
    likes = db.relationship('Likes', backref='')
    comments = db.relationship('Comments', backref='')
    
    
    def to_json(self):
        return {
            "P_Id": self.P_Id,
            "Title": self.Title,
            "Description": self.Description,
            "U_Id": self.U_Id,
            "Post_time": self.Post_time.isoformat() if self.Post_time else None
        }
#Likes table
class Likes(db.Model):
    __tablename__ = 'Likes'
    L_Id = db.Column(db.Integer, primary_key=True, nullable=False)
    U_Id = db.Column(db.Integer, db.ForeignKey('Account.Id'), nullable=False)
    P_Id = db.Column(db.Integer, db.ForeignKey('Post.P_Id'), nullable=False)
    Like_time = db.Column(db.DateTime,default=datetime.utcnow)
    
    def to_json(self):
        return {
            "L_Id": self.L_Id,
            "U_Id": self.U_Id,
            "P_Id": self.P_Id,
            "Like_time": self.Like_time.isoformat() if self.Like_time else None
        }
#Comments table
class Comments(db.Model):
    __tablename__ = 'Comments'
    C_Id = db.Column(db.Integer, primary_key=True, nullable=False)
    U_Id = db.Column(db.Integer, db.ForeignKey('Account.Id'), nullable=False)
    P_Id = db.Column(db.Integer, db.ForeignKey('Post.P_Id'), nullable=False)
    Content = db.Column(db.Text, nullable=False)
    Comment_time = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_json(self):
        return {
            "C_Id": self.C_Id,
            "U_Id": self.U_Id,
            "P_Id": self.P_Id,
            "Content": self.Content,
            "Comment_time": self.Comment_time.isoformat() if self.Comment_time else None
        }

#Attachments table
class Attachments(db.Model):
    __tablename__ = 'Attachments'
    A_Id = db.Column(db.Integer, primary_key=True, nullable=False)
    A_type = db.Column(db.String(255), nullable=False)
    File_size = db.Column(db.BigInteger, nullable=False)
    A_name = db.Column(db.String(500), nullable=False)
    A_time = db.Column(db.DateTime, default=datetime.utcnow)
    P_Id = db.Column(db.Integer, db.ForeignKey('Post.P_Id'), nullable=False)
    
    def to_json(self):
        return {
            "A_Id": self.A_Id,
            "A_type": self.A_type,
            "File_size": self.File_size,
            "A_name": self.A_name,
            "A_time": self.A_time.isoformat() if self.A_time else None,
            "P_Id": self.P_Id
        }
