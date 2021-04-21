from flask import Flask, render_template, jsonify, request, session, redirect
from Utility import GetRandomWords, HashPassword, ValidateUserData, clamp
import os.path
from flask_sqlalchemy import SQLAlchemy
import json
from random import randrange

app = Flask(__name__)
app.secret_key = "8MHdc9SYGEH$4l92OU*FELXrA50Fh*z%mJRTgGpHHebzc*N5UP"

# Initiate the database connection using SQLAlchemy
app.config[
    'SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://flaskDBManager:2hhZ)&9wN{5y5Gb-@localhost/TestType'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

dbModels: dict = {}


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
        tableName = "results" + username
        if tableName not in dbModels:
            dbModels[tableName] = GetUserResultTable(username)
            db.create_all()

        userResultTable = dbModels[tableName]()
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


@app.route("/API/GetPassage/<username>/<passageLength>")
def GetPersonalizedPassage(username, passageLength):
    weakestKey = GetWeakestKey(username)
    passageLength = int(passageLength)
    if weakestKey == "":
        return GetWords()
    else:
        sourceList = json.loads(WordList.query.filter_by(
            character=weakestKey).first().wordList)
        userPassage = ""
        for x in range(passageLength):
            userPassage += sourceList[randrange(0, len(sourceList))] + " "

        userPassage = userPassage[:-1]
        return jsonify(userPassage.split())


def GetWeakestKey(username):
    foundUser = User.query.filter_by(username=username).first()
    if foundUser:  # Store the result only if the user exists
        # Get table class for the specific user
        tableName = "results" + username
        if tableName not in dbModels:
            dbModels[tableName] = GetUserResultTable(username)
            db.create_all()

        # Get all the results
        userResults = dbModels[tableName].query.all()
        if len(userResults) == 0:
            return ""
        charScores: list = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        minLimit = clamp(len(userResults)-3, 0, len(userResults))

        def GetCharScore(charString: str):
            charInfo = charString.split(';')
            return int(charInfo[1]) * int(charInfo[2])

        # Add the scores for the characters for the last 3 lessons at max
        for x in range(minLimit, len(userResults)):
            charScores[0] += GetCharScore(userResults[x].A)
            charScores[1] += GetCharScore(userResults[x].B)
            charScores[2] += GetCharScore(userResults[x].C)
            charScores[3] += GetCharScore(userResults[x].D)
            charScores[4] += GetCharScore(userResults[x].E)
            charScores[5] += GetCharScore(userResults[x].F)
            charScores[6] += GetCharScore(userResults[x].G)
            charScores[7] += GetCharScore(userResults[x].H)
            charScores[8] += GetCharScore(userResults[x].I)
            charScores[9] += GetCharScore(userResults[x].J)
            charScores[10] += GetCharScore(userResults[x].K)
            charScores[11] += GetCharScore(userResults[x].L)
            charScores[12] += GetCharScore(userResults[x].M)
            charScores[13] += GetCharScore(userResults[x].N)
            charScores[14] += GetCharScore(userResults[x].O)
            charScores[15] += GetCharScore(userResults[x].P)
            charScores[16] += GetCharScore(userResults[x].Q)
            charScores[17] += GetCharScore(userResults[x].R)
            charScores[18] += GetCharScore(userResults[x].S)
            charScores[19] += GetCharScore(userResults[x].T)
            charScores[20] += GetCharScore(userResults[x].U)
            charScores[21] += GetCharScore(userResults[x].V)
            charScores[22] += GetCharScore(userResults[x].W)
            charScores[23] += GetCharScore(userResults[x].X)
            charScores[24] += GetCharScore(userResults[x].Y)
            charScores[25] += GetCharScore(userResults[x].Z)

        minCharIndex = 0
        for x in range(26):
            # Take average of the scores and find the weakest key
            charScores[x] = int(charScores[x] / (len(userResults) - minLimit))
            if charScores[x] < charScores[minCharIndex]:
                minCharIndex = x
        return chr(minCharIndex + 65)
    else:
        return ""


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


class WordList(db.Model):
    __tablename__ = "WordList"
    character = db.Column(db.String(1), nullable=False, primary_key=True)
    wordList = db.Column(db.String(900), nullable=False)


if __name__ == "__main__":
    db.create_all()
    app.run(debug=True)
