from random import randint
from pathlib import Path
import json

fileContent = Path("Words.json").read_text()
words = json.loads(fileContent)


def GetRandomWords(passageLength):
    passage: str = ""

    for x in range(0, passageLength):
        randomWord = words[randint(0, len(words) - 1)] + " "
        passage += randomWord

    passage = passage[:-1]
    return passage