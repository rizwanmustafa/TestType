export class PassageStatistics {
    constructor(wordTags, spanTags) {
        this.SetVariables(wordTags, spanTags);
    }
    SetVariables(wordTags, spanTags) {
        this.wordTags = wordTags;
        this.spanTags = spanTags;
    }
    GetNumberOfCorrectWords() {
        var correctWords = 0;
        for (let i = 0; i < this.wordTags.length; i++) {
            if (this.wordTags[i].classList.contains("correct"))
                correctWords++;
        }
        return correctWords;
    }
    GetNumberOfWrongWords() {
        var wrongWords = 0;
        for (let i = 0; i < this.wordTags.length; i++) {
            if (this.wordTags[i].classList.contains("wrong"))
                wrongWords++;
        }
        return wrongWords;
    }
    GetNumberOfCorrectChars() {
        var correctChars = 0;
        this.spanTags.forEach(word => {
            word.forEach(char => {
                if (char.classList.contains("correct"))
                    correctChars++;
            });
        });
        return correctChars;
    }
    GetNumberOfWrongChars() {
        var wrongChars = 0;
        this.spanTags.forEach(word => {
            word.forEach(char => {
                if (char.classList.contains("wrong"))
                    wrongChars++;
            });
        });
        return wrongChars;
    }
}
//# sourceMappingURL=PassageStatistics.js.map