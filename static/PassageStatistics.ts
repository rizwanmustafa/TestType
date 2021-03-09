export class PassageStatistics {
    wordTags: NodeListOf<HTMLElement>;
    spanTags: Array<NodeListOf<HTMLSpanElement>>;
    timePressed: Array<Array<number>>;

    constructor(wordTags: NodeListOf<HTMLElement>, spanTags: Array<NodeListOf<HTMLSpanElement>>, timePressed: Array<Array<number>>) {
        this.SetVariables(wordTags, spanTags, timePressed);
    }

    public SetVariables(wordTags: NodeListOf<HTMLElement>, spanTags: Array<NodeListOf<HTMLSpanElement>>, timePressed: Array<Array<number>>) {
        this.wordTags = wordTags;
        this.spanTags = spanTags;
        this.timePressed = timePressed;
    }


    public GetNumberOfCorrectWords(): number {
        var correctWords: number = 0;

        for (let i = 0; i < this.wordTags.length; i++) {
            if (this.wordTags[i].classList.contains("correct")) correctWords++;
        }

        return correctWords;
    }

    public GetNumberOfWrongWords(): number {
        var wrongWords: number = 0;

        for (let i = 0; i < this.wordTags.length; i++) {
            if (this.wordTags[i].classList.contains("wrong")) wrongWords++;
        }

        return wrongWords;
    }

    public GetNumberOfCompletedWords(): number {
        var completedWords: number = 0;

        for (let i = 0; i < this.wordTags.length; i++) {
            if (this.wordTags[i].classList.contains("current")) break;
            completedWords++;
        }

        return completedWords;
    }

    public GetNumberOfCorrectChars(): number {
        var correctChars: number = 0;
        this.spanTags.forEach(word => {
            word.forEach(char => {
                if (char.classList.contains("correct")) correctChars++;
            });
        });

        return correctChars;
    }

    public GetNumberOfWrongChars(): number {
        var wrongChars: number = 0;
        this.spanTags.forEach(word => {
            word.forEach(char => {
                if (char.classList.contains("wrong")) wrongChars++;
            });
        });

        return wrongChars;
    }

    private GetTimeTakenArray() {
        var timeTaken = new Array<Array<number>>(this.wordTags.length);
        for (let i = 0; i < this.wordTags.length; i++) {
            timeTaken[i] = new Array<number>(this.wordTags[i].textContent.length);
        }

        var lastIndex: number = this.GetSmallestValue(this.timePressed[0], null);
        for (let i = 0; i < timeTaken.length; i++) {

            // Create an array to store the seen indexes
            var seenIndexes: Array<number> = new Array<number>(timeTaken[i].length);
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

    private GetSmallestValue(searchArray: Array<number>, seenArray: Array<number>): number {
        var smallestValueIndex: number = -1;

        if (searchArray == null || searchArray == undefined) return smallestValueIndex;

        // Loop through each of the elements and find the smallest value
        for (let i = 0; i < searchArray.length; i++) {
            // If the index is seen, move on
            if (seenArray != undefined && seenArray != null && seenArray.includes(i)) continue;
            // If the value is undefined or null, move on
            if (searchArray[i] == null || searchArray[i] == undefined) continue;

            // If the current number is smaller than our stored number, replace the numbers
            if (smallestValueIndex == -1 || searchArray[i] < searchArray[smallestValueIndex]) {
                smallestValueIndex = i;
            }
        }

        return smallestValueIndex;
    }

    public GetTotalTime(): number {
        var timeTaken = this.GetTimeTakenArray();
        var totalTime = 0;

        for (let i = 0; i < this.wordTags.length; i++) {
            const word = timeTaken[i];
            if (word == null || word == undefined) continue;

            for (let a = 0; a < word.length; a++) {
                if (word[a] != null || word[a] != undefined) totalTime += word[a];
            }

        }
        return totalTime;
    }

    public GetWordSpeed(netSpeed: boolean) {
        var totalTime = this.GetTotalTime() / 60000;
        var totalWords = netSpeed ? this.GetNumberOfCorrectWords() : this.GetNumberOfCompletedWords();

        return Math.floor(totalWords/totalTime);
    }
}