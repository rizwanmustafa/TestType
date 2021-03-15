export class PassageStatistics {
    wordTags: NodeListOf<HTMLElement>;
    spanTags: Array<NodeListOf<HTMLSpanElement>>;
    startingTime: number;
    timePressed: Array<Array<number>>;

    constructor(wordTags: NodeListOf<HTMLElement>, spanTags: Array<NodeListOf<HTMLSpanElement>>, startingTime: number, timePressed: Array<Array<number>>) {
        this.wordTags = wordTags;
        this.spanTags = spanTags;
        this.startingTime = startingTime;
        this.timePressed = timePressed;
    }

    public GetStatistics(): PassageResult {
        // Don't calculate any statistics if we haven't typed any word
        if (this.wordTags[0].classList.contains("current")) return;

        var correctWords: number = 0;
        var wrongWords: number = 0;
        var totalTime: number = 0;

        // An array for holding the number of correct entries for each character from A-Z
        var correctCharNumber: Array<number> = this.GetNumberArray();
        // An array for holding the number of wrong entries for each character from A-Z
        var wrongCharNumber: Array<number> = this.GetNumberArray();
        // An array for holding the total time taken for pressing each character from A-Z
        var totalTimeChar: Array<number> = this.GetNumberArray();

        var lastTimePressed: number = this.startingTime;

        for (let i = 0; i < this.wordTags.length; i++) {
            const wordTag = this.wordTags[i];
            // If we have reached the end of where the user has typed, stop!
            if (wordTag.classList.contains("current")) break;
            const spanTags = this.spanTags[i];
            const timePressed = this.timePressed[i];

            if (wordTag.classList.contains("correct")) correctWords++;
            else wrongWords++;


            var seenIndexes: Array<number> = new Array(wordTag.textContent.length);
            var currentIndex = this.GetSmallestValueIndex(timePressed, seenIndexes);

            while (currentIndex != -1) {

                var charIndex = this.GetCharIndex(wordTag.textContent[currentIndex]);
                if (spanTags[currentIndex].classList.contains("wrong")) wrongCharNumber[charIndex]++;
                else correctCharNumber[charIndex]++;

                // Get and store the time taken for the character
                const currentTimePressed = timePressed[currentIndex];
                if (currentTimePressed != null || currentTimePressed != undefined) {

                    const charTimeTaken = currentTimePressed - lastTimePressed;

                    totalTime += charTimeTaken;
                    totalTimeChar[charIndex] += charTimeTaken;

                    lastTimePressed = currentTimePressed;
                }

                seenIndexes.push(currentIndex);
                currentIndex = this.GetSmallestValueIndex(timePressed, seenIndexes);
            }

        }

        const passageResult = new PassageResult();

        // Get statistics related to word e.g word speed
        const wordSpeed = Math.floor(correctWords / (totalTime / 60000));
        const wordAccuracy = Math.floor((correctWords / (wrongWords + correctWords)) * 100);

        // Set the word statistics
        passageResult.correctWords = correctWords;
        passageResult.wrongWords = wrongWords;
        passageResult.wordSpeed = wordSpeed;
        passageResult.wordAccuracy = wordAccuracy;


        // Print the word statistics for now
        console.log("Correct Words: " + correctWords);
        console.log("Wrong Words: " + wrongWords);
        console.log("Words per Minute: " + wordSpeed);
        console.log("Accuracy: " + wordAccuracy + "%");
        console.log("\n");

        passageResult.correctChars = this.GetNumberArray();
        passageResult.wrongChars = this.GetNumberArray();
        passageResult.charSpeeds = this.GetNumberArray();
        passageResult.charAccuracies = this.GetNumberArray();

        // Get statistics related to char e.g char speed
        for (let i = 0; i < 26; i++) {
            const charSpeed: number = Math.floor(correctCharNumber[i] / (totalTimeChar[i] / 60000));
            const charAccuracy: number = Math.floor((correctCharNumber[i] / (wrongCharNumber[i] + correctCharNumber[i]) * 100));

            // Set the statistics for the characters
            passageResult.correctChars[i] = correctCharNumber[i];
            passageResult.wrongChars[i] = wrongCharNumber[i];
            passageResult.charSpeeds[i] = charSpeed;
            passageResult.charAccuracies[i] = charAccuracy;


            // Print the character statistics for now
            console.log("Character: " + String.fromCharCode(i + 65));
            console.log("Correct inputs: " + correctCharNumber[i]);
            console.log("Wrong inputs: " + wrongCharNumber[i]);
            console.log("Characters per Minute: " + charSpeed);
            console.log("Character Accuracy: " + charAccuracy + "%");
            console.log("\n");
        }

        return passageResult;
    }

    private GetNumberArray(): Array<number> {
        var array: Array<number> = new Array<number>(26);

        for (var i = 0; i < array.length; i++) {
            array[i] = 0;
        }
        return array;
    }

    private GetCharIndex(char: String): number {
        return char.toUpperCase().charCodeAt(0) - 65;
    }

    private GetSmallestValueIndex(searchArray: Array<number>, seenArray: Array<number>): number {
        var smallestValueIndex: number = -1;

        if (searchArray == null || searchArray == undefined) return smallestValueIndex;

        // Loop through each of the elements and find the smallest value
        for (let i = 0; i < searchArray.length; i++) {
            // If the index is seen, move on
            if (seenArray != undefined && seenArray != null && seenArray.includes(i)) continue;
            // If the value is undefined or null, return the value
            if (searchArray[i] == null || searchArray[i] == undefined) return i;

            // If the current number is smaller than our stored number, replace the numbers
            if (smallestValueIndex == -1 || searchArray[i] < searchArray[smallestValueIndex]) {
                smallestValueIndex = i;
            }
        }

        return smallestValueIndex;
    }


}

export class PassageResult {
    correctWords: number = 0;
    wrongWords: number = 0;
    wordSpeed: number = 0;
    wordAccuracy: number = 0;
    correctChars: Array<number> = new Array<number>(26);
    wrongChars: Array<number> = new Array<number>(26);
    charSpeeds: Array<number> = new Array<number>(26);
    charAccuracies: Array<number> = new Array<number>(26);
}