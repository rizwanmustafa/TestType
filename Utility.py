from random import randint
from pathlib import Path
import json
import os
import hashlib
import re

fileContent = Path("Words.json").read_text()
words = json.loads(fileContent)


def GetRandomWords(passageLength):
    passage: str = ""

    for x in range(0, passageLength):
        randomWord = words[randint(0, len(words) - 1)] + " "
        passage += randomWord

    passage = passage[:-1]
    return passage


def HashPassword(password: str, saltUsed=None):
    if saltUsed == None:
        saltUsed = os.urandom(32)

    hashedPassword = hashlib.pbkdf2_hmac(
        'sha256',  # The hash digest algorithm for HMAC
        password.encode('utf-8'),  # Convert the password to bytes
        saltUsed,
        100000  # It is recommended to use at least 100,000 iterations of SHA-256
    )

    return hashedPassword, saltUsed


def ValidateUserData(username: str, email: str, password: str):
    # Presence check for all variables
    if username == None or username == "":
        return "Please enter a username!"
    elif email == None or email == "":
        return "Please enter an email!"
    elif password == None or password == "":
        return "Please enter a password!"

    # Validate username.
    for x in username:
        if not x.isalpha() and not x.isnumeric():
            return "Username should only contain alphabets or numbers!"
    if len(username) > 50:  # Length Check
        return "Username should not be longer than 50 characters!"

    # Validate email
    if not re.search('^[a-z0-9]+[\._]?[a-z0-9]+[@]\w+[.]\w{2,3}$', email):
        return "Please enter a valid email!"

    # Validate password. Rules: length > 8. Contains both numbers and alphabets
    if len(password) < 8:
        return "Password must be at least 8 characters long!"
    containsAlpha = containsNum = False
    for x in password:
        if x.isalpha():
            containsAlpha = True
        if x.isnumeric():
            containsNum = True
    if containsAlpha == False or containsNum == False:
        return "Password must contain both an alphabet and a number"

    return ""