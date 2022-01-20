from flask import Flask, render_template, jsonify, request, session, redirect, flash
from Utility import GetRandomWords, HashPassword, ValidateUserData, clamp
from os import path
from flask_sqlalchemy import SQLAlchemy
from random import randrange
from math import floor
from json import load
from dotenv import dotenv_values

app = Flask(__name__)
ENV_CONFIG = dotenv_values()
app.secret_key = ENV_CONFIG.get("SECRET_KEY", None)

# Initiate the database connection using SQLAlchemy
app.config['SQLALCHEMY_DATABASE_URI'] = ENV_CONFIG.get("DATABASE_URI", None)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
dbModels: dict = {}


@app.route("/", methods=['GET'])
def index():
    username = session["username"] if "username" in session else ""
    return render_template("index.html.j2",  loggedIn=GetLoginState(), username=username)


@app.route("/API/GetWords", methods=['GET'])
def GetWords():
    return jsonify(GetRandomWords(app, 50).split(" "))


@app.route("/API/GetWords/<username>/<passageLength>")
def GetPersonalizedPassage(username, passageLength):
    # Get user's weakest key if possible
    weakestKey = GetWeakestKey(username)
    passageLength = int(passageLength)
    # If the user has a weak key, generate a personalized passage, else give a random passage
    if weakestKey == "":
        return GetWords()
    else:
        sourceList = WordList.query.filter_by(
            char=weakestKey).first().wordList.split(",")
        userPassage = ""
        for x in range(passageLength):
            userPassage += sourceList[randrange(0, len(sourceList))] + " "

        userPassage = userPassage[:-1]
        return jsonify(userPassage.split())


@app.route("/API/AddResult/<username>", methods=['POST'])
def AddResult(username):
    foundUser = User.query.filter_by(username=username).first()
    if not foundUser:
        # Store the result only if the user exists
        return jsonify("User not found!")
        # Get the user result table and create all database models
    tableName = "results" + username
    if tableName not in dbModels:
        GetUserResultTable(username)

    userResultTable = dbModels[tableName]

    # Get the data from the request
    correctChars = request.json[0]
    wrongChars = request.json[1]
    charAccuracies = request.json[2]
    charSpeeds = request.json[3]

    def AddCharResult(charNum: int):
        # Don't add the result for the char if it was not present in the typing passage
        if correctChars[charNum] == 0 and wrongChars[charNum] == 0:
            return

        # Create an instance for char result
        charResult = userResultTable()
        charResult.char = chr(charNum+65)
        charResult.speed = floor(charSpeeds[charNum])
        charResult.accuracy = floor(charAccuracies[charNum])
        charResult.occurrences = floor(
            correctChars[charNum] + wrongChars[charNum])

        # Add the char result and commit the changes
        db.session.add(charResult)
        db.session.commit()

    for x in range(26):
        AddCharResult(x)

    return jsonify("Result added!")


def GetWeakestKey(username):
    foundUser = User.query.filter_by(username=username).first()
    # Calculate the weakest key only if the user exists
    if not foundUser:
        return ""
    # Get results table databse model for the specific user
    tableName = "results" + username
    # If the database model for our user is not created, create it
    if tableName not in dbModels:
        GetUserResultTable(username)

    # Get all the results
    try:
        userResults = dbModels[tableName].query.all()
    except:
        return ""
    if not userResults:
        return ""

    charScores: list = []
    minCharIndex = 0

    for x in range(26):
        # Create a new entry for the current char
        charScores.append(0)
        # Get the results for the current char
        charResults = dbModels[tableName].query.filter_by(char=chr(x+65))

        # Give the most priority to chars the user hasn't typed before
        if charResults.count() == 0:
            minCharIndex = x
            break

        # Loop through the last 3 results added and add the char scores
        minLimit = clamp(charResults.count() - 3, 0, charResults.count())

        for i in range(minLimit, charResults.count()):
            charScores[x] += charResults[i].speed * charResults[i].accuracy

        # Get the average score for the char
        charScores[x] /= (minLimit + charResults.count())
        charScores[x] = floor(charScores[x])
        # If the char has the smallest score, update the data
        if charScores[x] < charScores[minCharIndex]:
            minCharIndex = x

    return chr(minCharIndex + 65)


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
                    flash("Username is already taken!", "error")
                    return redirect("/signup")
                elif emailExists:
                    # Do something like send a message saying the email is already taken
                    flash("Email is already taken!", "error")
                    return redirect("/signup")
        else:
            # Do something like flash a message saying that the input data is invalid
            flash(dataValid, "error")
            return redirect("/signup")


@app.route("/login", methods=["GET", "POST"])
def Login():
    if request.method == "GET":
        # If the user is already logged in, redirect them to the main page
        if GetLoginState():
            return redirect("/")
        else:
            return render_template("login.html.j2", loggedIn=False)
    elif request.method == "POST":
        # Get the necessary data from the POST request
        username: str = request.form['username']
        password: str = request.form['password']

        if username.strip() != "" and password.strip() != "":
            # Get the user data from the database
            foundUser: User = User.query.filter_by(username=username).first()
            if foundUser == None:
                flash("Wrong credentials used!", "error")
                return redirect("/login")
            inputHashPassword, saltUsed = HashPassword(
                password, foundUser.saltUsed)
            if inputHashPassword == foundUser.hashedPassword:
                # Store the user
                session['username'] = username
                return redirect("/")
            else:
                flash("Wrong credentials used!", "error")
                return redirect("/login")
        elif username.strip() == "":
            flash("Please enter a username!", "error")
            return redirect("/login")
        elif password.strip() == "":
            flash("Please enter a password!", "error")
            return redirect("/login")


@app.route("/logout")
def Logout():
    session.pop("username", None)
    flash("You have been logged out!", "info")
    return redirect("/login")


def GetLoginState() -> bool:
    return "username" in session


@app.context_processor
def utility_processor():
    # This method adds the last modified time to a file path
    # Used to prevent the browser from serving old files from its cache
    def modified_url_for(foldername, filename):
        realFilePath = path.join(app.root_path, foldername, filename)
        modifiedTime = str(int(path.getmtime(realFilePath)))
        newFilePath = '/' + foldername + '/' + filename + '?q=' + modifiedTime
        return newFilePath
    return dict(modified_url_for=modified_url_for)


# This method generates a database model for results for a user in runtime
def GetUserResultTable(username):
    tabledict = {
        'id': db.Column(db.Integer, primary_key=True, autoincrement=True),
        'char': db.Column(db.String(1), nullable=False),
        'speed': db.Column(db.Integer, nullable=False),
        'accuracy': db.Column(db.Integer, nullable=False),
        'occurrences': db.Column(db.Integer, nullable=False),
    }
    newclass = type("results"+username, (db.Model, ), tabledict)
    db.create_all()
    dbModels["results"+username] = newclass
    return newclass


# This database model holds basic information regarding the user
class User(db.Model):
    __tablename__ = "Users"
    username = db.Column(db.String(50), nullable=False, primary_key=True)
    email = db.Column(db.String(50), nullable=False, unique=True)
    hashedPassword = db.Column(db.LargeBinary, nullable=False)
    saltUsed = db.Column(db.LargeBinary, nullable=False)

    def __init__(self, username, email, hashedPassword, saltUsed):
        self.username = username
        self.email = email
        self.hashedPassword = hashedPassword
        self.saltUsed = saltUsed


# This database model holds words containing the character
class WordList(db.Model):
    __tablename__ = "WordList"
    char = db.Column(db.String(1), nullable=False, primary_key=True)
    wordList = db.Column(db.String(900), nullable=False)

    def __init__(self, char, wordList):
        self.char = char
        self.wordList = wordList


# This method automates the process of  adding words in the database
# This method is to be run while setting up the server to add words
def AddWordsToDatabase():

    # Get the list of the words
    jsonFile = app.open_resource("WordList.json")
    wordList = load(jsonFile)

    # Loop through each character in the alphabet and add their words
    for charCode in range(26):
        char = chr(charCode + 65)
        wordListString = ""
        for word in wordList[charCode]:
            wordListString += word + ","

        wordListString = wordListString[:len(wordListString)-1]

        dbObject = WordList(char, wordListString)
        db.session.add(dbObject)

    # Commit the changes to the database
    db.session.commit()


if __name__ == "__main__":
    db.create_all()
    app.run(debug=True)
