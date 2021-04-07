from flask import Flask, render_template, jsonify, request, session, redirect
from Utility import GetRandomWords, HashPassword, ValidateUserData
import os.path
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.secret_key = "8MHdc9SYGEH$4l92OU*FELXrA50Fh*z%mJRTgGpHHebzc*N5UP"

# Initiate the database connection using SQLAlchemy
app.config[
    'SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://flaskDBManager:2hhZ)&9wN{5y5Gb-@localhost/TestType'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)


@app.route("/", methods=['GET'])
def index():
    username = session["username"] if "username" in session else ""
    return render_template("index.html.j2",  loggedIn=GetLoginState(), username=username)

# Later check if the user is logged in. If yes, then send personalized words


@app.route("/GetWords", methods=['GET'])
def GetWords():
    return jsonify(GetRandomWords(50).split(" "))


@app.route("/signup", methods=['GET', 'POST'])
def SignUp():
    if request.method == 'GET':
        if GetLoginState():
            return redirect("/")
        else:
            return render_template("signup.html.j2", loggedIn=GetLoginState())
    elif request.method == 'POST':
        # Get necessary data
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']
        hashedPassword, saltUsed = HashPassword(password)

        # Later send an email for verification
        # Ensure that the user does not already exist
        dataValid = ValidateUserData(username, email, password)

        if dataValid == "":
            usernameExists = User.query.filter_by(username=username).first()
            emailExists = User.query.filter_by(email=email).first()
            if usernameExists == None and emailExists == None:
                # Add  the user in database if the data is valid
                newuser = User(username, email, hashedPassword, saltUsed)
                db.session.add(newuser)
                db.session.commit()
                session['username'] = username
                return redirect("/")
            else:
                if usernameExists:
                    # Do something like send a message saying the username is already taken
                    return "Username is already taken!"
                elif emailExists:
                    # Do something like send a message saying the email is already taken
                    return "Email is already taken!"
        else:
            # Do something like flash a message saying that the input data is invalid
            return dataValid


@app.route("/login", methods=["GET", "POST"])
def Login():
    if request.method == "GET":
        if GetLoginState():
            return redirect("/")
        else:
            return render_template("login.html.j2", loggedIn=False)
    elif request.method == "POST":
        username: str = request.form['username']
        password: str = request.form['password']

        if username.strip() != "" and password.strip() != "":
            # Get the user data from the database
            foundUser: User = User.query.filter_by(username=username).first()
            if foundUser == None:
                # Do something like send back a message saying, wrong credentials as no username found
                return "Wrong credentials used!"
            inputHashPassword, saltUsed = HashPassword(
                password, foundUser.saltUsed)
            if inputHashPassword == foundUser.hashedPassword:
                # Do something like store the user
                session['username'] = username
                return redirect("/")
            else:
                # Do something like flash a message saying, wrong credentials as wrong password input
                return "Wrong credentials used!"
        elif username.strip() == "":
            return "Please enter a username!"
        elif password.strip() == "":
            return "Please enter a password!"


@app.route("/logout")
def Logout():
    session.pop("username", None)
    return redirect("/login")


@app.route("/isusernameavailable/<username>")
def IsUserAvailable(username):
    foundUser = User.query.filter_by(username=username).first()
    if foundUser == None:
        return jsonify("1")
    else:
        return jsonify("0")


@app.route("/API/AddResult/<username>", methods=['POST'])
def AddResult(username):
    foundUser = User.query.filter_by(username=username).first()
    if foundUser:  # Store the result only if the user exists
        # Get the user result table and create all database models
        userResultTable = GetUserResultTable(username)()
        db.create_all()

        # Process the results
        correctChars = request.json[0]
        wrongChars = request.json[1]
        charAccuracies = request.json[2]
        charSpeeds = request.json[3]

        def GetCharResult(charNum: int):
            return str(correctChars[charNum] + wrongChars[charNum]) + ";" + str(charAccuracies[charNum]) + ";" + str(charSpeeds[charNum])

        userResultTable.A = GetCharResult(0)
        userResultTable.B = GetCharResult(1)
        userResultTable.C = GetCharResult(2)
        userResultTable.D = GetCharResult(3)
        userResultTable.E = GetCharResult(4)
        userResultTable.F = GetCharResult(5)
        userResultTable.G = GetCharResult(6)
        userResultTable.H = GetCharResult(7)
        userResultTable.I = GetCharResult(8)
        userResultTable.J = GetCharResult(9)
        userResultTable.K = GetCharResult(10)
        userResultTable.L = GetCharResult(11)
        userResultTable.M = GetCharResult(12)
        userResultTable.N = GetCharResult(13)
        userResultTable.O = GetCharResult(14)
        userResultTable.P = GetCharResult(15)
        userResultTable.Q = GetCharResult(16)
        userResultTable.R = GetCharResult(17)
        userResultTable.S = GetCharResult(18)
        userResultTable.T = GetCharResult(19)
        userResultTable.U = GetCharResult(20)
        userResultTable.V = GetCharResult(21)
        userResultTable.W = GetCharResult(22)
        userResultTable.X = GetCharResult(23)
        userResultTable.Y = GetCharResult(24)
        userResultTable.Z = GetCharResult(25)

        # Add the results into the database
        db.session.add(userResultTable)
        db.session.commit()

        return jsonify("Result added!")
    else:
        return jsonify("Result not added!")


def GetLoginState() -> bool:
    return "username" in session


@app.context_processor
def utility_processor():
    def AddModifiedTime(filePath):
        newFilePath = filePath + "?p=" + \
            str(int(os.path.getmtime(filePath[1:])))
        return newFilePath
    return dict(AddModifiedTime=AddModifiedTime)


def GetUserResultTable(username):
    tabledict = {
        'passageToken': db.Column(db.Integer, nullable=False, primary_key=True, autoincrement=True),
        'A': db.Column(db.String(15), nullable=False),
        'B': db.Column(db.String(15), nullable=False),
        'C': db.Column(db.String(15), nullable=False),
        'D': db.Column(db.String(15), nullable=False),
        'E': db.Column(db.String(15), nullable=False),
        'F': db.Column(db.String(15), nullable=False),
        'G': db.Column(db.String(15), nullable=False),
        'H': db.Column(db.String(15), nullable=False),
        'I': db.Column(db.String(15), nullable=False),
        'J': db.Column(db.String(15), nullable=False),
        'K': db.Column(db.String(15), nullable=False),
        'L': db.Column(db.String(15), nullable=False),
        'M': db.Column(db.String(15), nullable=False),
        'N': db.Column(db.String(15), nullable=False),
        'O': db.Column(db.String(15), nullable=False),
        'P': db.Column(db.String(15), nullable=False),
        'Q': db.Column(db.String(15), nullable=False),
        'R': db.Column(db.String(15), nullable=False),
        'S': db.Column(db.String(15), nullable=False),
        'T': db.Column(db.String(15), nullable=False),
        'U': db.Column(db.String(15), nullable=False),
        'V': db.Column(db.String(15), nullable=False),
        'W': db.Column(db.String(15), nullable=False),
        'X': db.Column(db.String(15), nullable=False),
        'Y': db.Column(db.String(15), nullable=False),
        'Z': db.Column(db.String(15), nullable=False),
    }
    newclass = type("results"+username, (db.Model, ), tabledict)
    return newclass


class User(db.Model):
    __tablename__ = "Users"
    username = db.Column(db.String(50), nullable=False, primary_key=True)
    email = db.Column(db.String(50), nullable=False)
    hashedPassword = db.Column(db.LargeBinary, nullable=False)
    saltUsed = db.Column(db.LargeBinary, nullable=False)

    def __init__(self, username, email, hashedPassword, saltUsed):
        self.username = username
        self.email = email
        self.hashedPassword = hashedPassword
        self.saltUsed = saltUsed


if __name__ == "__main__":
    db.create_all()
    app.run(debug=True)
