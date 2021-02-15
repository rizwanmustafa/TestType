from flask import Flask, render_template
from GetRandomWords import GetRandomWords

app = Flask(__name__)
app.SECRET_KEY = "AODJF;LKASJDFASLKDJFKL;AJSDLKF;JA;SD"


@app.route("/")
def index():
    return render_template("index.html", words=GetRandomWords(50))


if __name__ == "__main__":
    app.run(debug=True)