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


            var seenIndexes: Array<number> = Array(wordTag.textContent.length);
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

        var correctChars = 0;
        for (let i = 0; i < this.wordTags.length; i++) {
            const wordTag = this.wordTags[i];
            if (wordTag.classList.contains("current")) break;

            if (wordTag.classList.contains("correct")) correctChars += wordTag.textContent.length + 1;
        }

        const realCorrectWords = Math.floor(correctChars / 5);

        // Get statistics related to word e.g word speed
        const wordSpeed = correctWords == 0 ? 0 : Math.floor(realCorrectWords / (totalTime / 60000));
        const wordAccuracy = Math.floor((correctWords / (wrongWords + correctWords)) * 100);

        // Set the word statistics
        passageResult.correctWords = correctWords;
        passageResult.wrongWords = wrongWords;
        passageResult.wordSpeed = wordSpeed;
        passageResult.wordAccuracy = wordAccuracy;

        document.getElementById("wordSpeed").textContent = wordSpeed.toString();
        document.getElementById("wordAccuracy").textContent = wordAccuracy.toString() + "%";
        document.getElementById("correctWords").textContent = correctWords.toString();
        document.getElementById("wrongWords").textContent = wrongWords.toString();

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
            if (correctCharNumber[i] == 0) {
                passageResult.charSpeeds[i] = 0;
                passageResult.charAccuracies[i] = 0;
            }
            else {
                passageResult.charSpeeds[i] = charSpeed;
                passageResult.charAccuracies[i] = charAccuracy;
            }
        }

        // Set the character statistics for A
        document.getElementById("charName").textContent = "A";
        document.getElementById("charSpeed").textContent = passageResult.charSpeeds[0].toString();
        document.getElementById("charAccuracy").textContent = passageResult.charAccuracies[0].toString() + "%";
        document.getElementById("correctChars").textContent = passageResult.correctChars[0].toString();
        document.getElementById("wrongChars").textContent = passageResult.wrongChars[0].toString();

        document.querySelectorAll(".char").forEach(charDiv => {
            charDiv.addEventListener("click", (e: Event) => {
                const clickedDiv = e.target as HTMLElement;
                const charIndex = this.GetCharIndex(clickedDiv.textContent);

                document.getElementById("charName").textContent = clickedDiv.textContent[0];
                document.getElementById("charSpeed").textContent = passageResult.charSpeeds[charIndex].toString();
                document.getElementById("charAccuracy").textContent = passageResult.charAccuracies[charIndex].toString() + "%";
                document.getElementById("correctChars").textContent = passageResult.correctChars[charIndex].toString();
                document.getElementById("wrongChars").textContent = passageResult.wrongChars[charIndex].toString();
            });
        })

        document.getElementById("charList").style.display = "block";
        document.getElementById("results").style.display = "flex";

        return passageResult;
    }

    private GetNumberArray(): Array<number> {
        var array: Array<number> = Array<number>(26);

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
    // General Statistics
    correctWords: number = 0;
    wrongWords: number = 0;
    wordSpeed: number = 0;
    wordAccuracy: number = 0;

    // Individual Statistics
    correctChars: Array<number> = Array<number>(26);
    wrongChars: Array<number> = Array<number>(26);
    charSpeeds: Array<number> = Array<number>(26);
    charAccuracies: Array<number> = Array<number>(26);
}
