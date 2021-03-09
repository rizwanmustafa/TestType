from flask import Flask, render_template, jsonify
from GetRandomWords import GetRandomWords
import os.path

app = Flask(__name__)
app.SECRET_KEY = "AODJF;LKASJDFASLKDJFKL;AJSDLKF;JA;SD"


@app.route("/")
def index():
    styleTime = int(os.path.getmtime("static/styles.css"))
    script1Time = int(os.path.getmtime("static/MainScript.js"))
    script2Time = int(os.path.getmtime("static/PassageHandler.js"))
    script3Time = int(os.path.getmtime("static/PassageStatistics.js"))

    return render_template("index.html", styleTime=styleTime, script1Time=script1Time, script2Time=script2Time, script3Time=script3Time)

# Later check if the user is logged in. If yes, then send personalized words
@app.route("/GetWords")
def GetWords():
    return jsonify(GetRandomWords(50).split(" "))


if __name__ == "__main__":
    app.run(debug=True)