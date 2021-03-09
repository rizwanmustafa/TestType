export class PassageStatistics {
    constructor(wordTags, spanTags, timePressed) {
        this.SetVariables(wordTags, spanTags, timePressed);
    }
    SetVariables(wordTags, spanTags, timePressed) {
        this.wordTags = wordTags;
        this.spanTags = spanTags;
        this.timePressed = timePressed;
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
    GetNumberOfCompletedWords() {
        var completedWords = 0;
        for (let i = 0; i < this.wordTags.length; i++) {
            if (this.wordTags[i].classList.contains("current"))
                break;
            completedWords++;
        }
        return completedWords;
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
    GetTimeTakenArray() {
        var timeTaken = new Array(this.wordTags.length);
        for (let i = 0; i < this.wordTags.length; i++) {
            timeTaken[i] = new Array(this.wordTags[i].textContent.length);
        }
        var lastIndex = this.GetSmallestValue(this.timePressed[0], null);
        for (let i = 0; i < timeTaken.length; i++) {
            // Create an array to store the seen indexes
            var seenIndexes = new Array(timeTaken[i].length);
            var smallestValueIndex = this.GetSmallestValue(this.timePressed[i], seenIndexes);
            timeTaken[i][this.GetSmallestValue(this.timePressed[i], null)] = this.timePressed[i][smallestValueIndex] - this.timePressed[i == 0 ? 0 : i - 1][lastIndex];
            lastIndex = smallestValueIndex;
            seenIndexes.push(smallestValueIndex);
            while (this.GetSmallestValue(this.timePressed[i], seenIndexes) != -1) {
                smallestValueIndex = this.GetSmallestValue(this.timePressed[i], seenIndexes);
                // Set the time taken
                timeTaken[i][smallestValueIndex] = this.timePressed[i][smallestValueIndex] - this.timePressed[i][lastIndex];
                lastIndex = smallestValueIndex;
                seenIndexes.push(smallestValueIndex);
            }
        }
        return timeTaken;
    }
    GetSmallestValue(searchArray, seenArray) {
        var smallestValueIndex = -1;
        if (searchArray == null || searchArray == undefined)
            return smallestValueIndex;
        // Loop through each of the elements and find the smallest value
        for (let i = 0; i < searchArray.length; i++) {
            // If the index is seen, move on
            if (seenArray != undefined && seenArray != null && seenArray.includes(i))
                continue;
            // If the value is undefined or null, move on
            if (searchArray[i] == null || searchArray[i] == undefined)
                continue;
            // If the current number is smaller than our stored number, replace the numbers
            if (smallestValueIndex == -1 || searchArray[i] < searchArray[smallestValueIndex]) {
                smallestValueIndex = i;
            }
        }
        return smallestValueIndex;
    }
    GetTotalTime() {
        var timeTaken = this.GetTimeTakenArray();
        var totalTime = 0;
        for (let i = 0; i < this.wordTags.length; i++) {
            const word = timeTaken[i];
            if (word == null || word == undefined)
                continue;
            for (let a = 0; a < word.length; a++) {
                if (word[a] != null || word[a] != undefined)
                    totalTime += word[a];
            }
        }
        return totalTime;
    }
    GetWordSpeed(netSpeed) {
        var totalTime = this.GetTotalTime() / 60000;
        var totalWords = netSpeed ? this.GetNumberOfCorrectWords() : this.GetNumberOfCompletedWords();
        return Math.floor(totalWords / totalTime);
    }
}
//# sourceMappingURL=PassageStatistics.js.map