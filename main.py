from flask import Flask, render_template, jsonify, request, session, redirect
from Utility import GetRandomWords, HashPassword, ValidateUserData
import os.path
import mysql.connector

app = Flask(__name__)
app.secret_key = "AODJF;LKASJDFASLKDJFKL;AJSDLKF;JA;SD"

# Initiate the database connection
db = mysql.connector.connect(
    host="localhost",
    username="flaskDBManager",
    password="2hhZ)&9wN{5y5Gb-",
    database="TestType")
dbCursor = db.cursor()


@app.route("/", methods=['GET'])
def index():
    return render_template("index.html.j2",  loggedIn=GetLoginState())

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
            dbCursor.execute("SELECT username, email FROM UserInfo WHERE username = '" +
                             username + "' OR email ='" + email + "';")
            data = dbCursor.fetchall()
            if len(data) == 0:
                # Add  the user in database if the data is valid
                dbCursor.execute("INSERT INTO UserInfo(username, email, hashedpassword, saltused) VALUES(%s,%s,%s,%s);",
                                 (username, email, hashedPassword, saltUsed))
                db.commit()
                return "You have successfully signed up"
            else:
                for x in data:
                    if x[0] == username:
                        # Do something like send a message saying the username is already taken
                        return "Username is already taken!"
                    elif x[1] == email:
                        # Do something like send a message saying the email is already taken
                        return "Email is already taken!"
        else:
            # Do something like send a message saying that the input data is invalid
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

        dataValid = ValidateUserData(
            username, "validemail@something.com", password)

        if username.strip() != "" and password.strip() != "":
            # Get the user data from the database
            dbCursor.execute(
                "SELECT hashedpassword, saltused FROM UserInfo WHERE username = '" + username + "';")
            data = dbCursor.fetchall()
            if(len(data) == 0):
                # Do something like send back a message saying, wrong credentials as no username found
                return "Wrong credentials used!"
            hashedPassword = data[0][0]
            saltUsed = data[0][1]
            inputHashPassword, saltUsed = HashPassword(password, saltUsed)
            if inputHashPassword == hashedPassword:
                # Do something like store the user
                session['username'] = username
                return redirect("/")
            else:
                # Do something like send back a message saying, wrong credentials as wrong password input
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
    dbCursor.execute(
        "SELECT username FROM UserInfo WHERE username = '" + username + "';")
    data = dbCursor.fetchall()
    if len(data) == 0:
        return jsonify("1")
    else:
        return jsonify("0")


def GetLoginState() -> bool:
    return "username" in session

@app.context_processor
def utility_processor():
    def AddModifiedTime(filePath):
        newFilePath = filePath + "?p=" + str(int(os.path.getmtime(filePath[1:])))
        return newFilePath
    return dict(AddModifiedTime=AddModifiedTime)

if __name__ == "__main__":
    app.run(debug=True)
