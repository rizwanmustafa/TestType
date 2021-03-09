import { PassageHandler } from './PassageHandler.js';
import { PassageStatistics } from './PassageStatistics.js';
const typeSpace = document.querySelector("#typeSpace");
const passageHandler = new PassageHandler();
// Get words from server
passageHandler.GetWordsFromServer(function () {
    //Store time taken for each character
    var timePressed = new Array(passageHandler.wordArray.length);
    InitializeTimePressedArray();
    var lastInput = "";
    let wordIndex = 0;
    passageHandler.MarkWordTagAsCurrent(wordIndex);
    // Add event when user types
    document.querySelector("#typeSpace").addEventListener("input", OnInput);
    // Handle user input
    function OnInput(e) {
        const currentTime = Date.now();
        const target = e.target;
        var userInput = target.value;
        // Do not do anything if the user has already finished their exercise
        if (wordIndex >= passageHandler.wordArray.length) {
            // Get Results and log them in the console for now
            var passageStats = new PassageStatistics(passageHandler.wordTags, passageHandler.spanTags);
            var totalTime = GetTotalTime();
            var correctWords = passageStats.GetNumberOfCorrectWords();
            console.log("WPM: " + Math.floor(correctWords / (totalTime / 60000)));
            target.value = "";
            return;
        }
        if (userInput == lastInput)
            return;
        else if (userInput == "") {
            passageHandler.UnformatWordTag(wordIndex);
            passageHandler.MarkWordTagAsCurrent(wordIndex);
            return;
        }
        //Get current cursor place
        const charIndex = target.selectionStart - 1;
        //Store time for current char
        // Get place where the input changed and shift the values accordingly
        if (typeSpace.selectionStart != userInput.length) {
            // Check if the user has removed the character or added one
            if (userInput.length < lastInput.length) {
                ShiftValuesToLeft(charIndex);
            }
            else if (userInput.length > lastInput.length) {
                ShiftValuesToRight(charIndex);
            }
        }
        // A char was added so set the time it was pressed
        if (charIndex < passageHandler.wordArray[wordIndex].length && lastInput.length < userInput.length) {
            timePressed[wordIndex][charIndex] = currentTime;
        }
        // Remove time for any character that has not yet been typed
        for (let i = userInput.length; i < passageHandler.wordArray[wordIndex].length; i++) {
            timePressed[wordIndex][i] = undefined;
        }
        lastInput = userInput;
        if (userInput[userInput.length - 1] == " ") {
            if (wordIndex >= passageHandler.wordArray.length - 1 || passageHandler.GetIndexOfNewLine(wordIndex)) {
                passageHandler.HideWordTagsUntilIndex(wordIndex);
                target.value = "";
            }
            userInput = userInput.trim();
            passageHandler.UnformatWordTag(wordIndex);
            // Validate this word and move on to the next one
            if (userInput == passageHandler.wordArray[wordIndex]) {
                passageHandler.wordTags[wordIndex].classList.add("correct");
            }
            else {
                passageHandler.ValidateAndFormatWord(wordIndex, userInput, true);
            }
            MoveToNextWord();
        }
        else {
            userInput = userInput.trim();
            // Remove any classes from all span tags
            passageHandler.UnformatSpanTags(wordIndex);
            // Add "current" class to the current span tag
            if (userInput.length < passageHandler.wordArray[wordIndex].length) {
                passageHandler.spanTags[wordIndex][userInput.length].classList.add("current");
            }
            passageHandler.ValidateAndFormatWord(wordIndex, userInput, false);
        }
    }
    function InitializeTimePressedArray() {
        for (let i = 0; i < passageHandler.wordArray.length; i++) {
            timePressed[i] = new Array(passageHandler.wordArray[i].length);
        }
    }
    // Use when the user adds a character in between the word
    function ShiftValuesToRight(index) {
        for (let i = passageHandler.wordArray[wordIndex].length - 1; i > index; i--)
            timePressed[wordIndex][i] = timePressed[wordIndex][i - 1];
    }
    // Use when the user removes a character in between the word
    function ShiftValuesToLeft(index) {
        for (let i = index + 2; i < timePressed[wordIndex].length; i++) {
            timePressed[wordIndex][i - 1] = timePressed[wordIndex][i];
        }
    }
    function MoveToNextWord() {
        wordIndex++;
        if (wordIndex >= passageHandler.wordTags.length)
            return;
        lastInput = "";
        passageHandler.MarkWordTagAsCurrent(wordIndex);
        typeSpace.value = "";
    }
    function GetTimeTakenArray() {
        var timeTaken = new Array(passageHandler.wordArray.length);
        for (let i = 0; i < passageHandler.wordArray.length; i++) {
            timeTaken[i] = new Array(passageHandler.wordArray[i].length);
        }
        var lastIndex = GetSmallestValue(timePressed[0], null);
        for (let i = 0; i < timeTaken.length; i++) {
            // Create an array to store the seen indexes
            var seenIndexes = new Array(timeTaken[i].length);
            var smallestValueIndex = GetSmallestValue(timePressed[i], seenIndexes);
            timeTaken[i][GetSmallestValue(timePressed[i], null)] = timePressed[i][smallestValueIndex] - timePressed[i == 0 ? 0 : i - 1][lastIndex];
            lastIndex = smallestValueIndex;
            seenIndexes.push(smallestValueIndex);
            while (GetSmallestValue(timePressed[i], seenIndexes) != -1) {
                smallestValueIndex = GetSmallestValue(timePressed[i], seenIndexes);
                // Set the time taken
                timeTaken[i][smallestValueIndex] = timePressed[i][smallestValueIndex] - timePressed[i][lastIndex];
                lastIndex = smallestValueIndex;
                seenIndexes.push(smallestValueIndex);
            }
        }
        return timeTaken;
    }
    function GetSmallestValue(searchArray, seenArray) {
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
    function GetTotalTime() {
        var timeTaken = GetTimeTakenArray();
        var wordsCompleted = GetNumberOfWordsCompleted();
        var totalTime = 0;
        for (let i = 0; i < wordsCompleted; i++) {
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
    function GetNumberOfWordsCompleted() {
        var wordsCompleted = 0;
        // Loop through each of the word
        for (let i = 0; i < passageHandler.wordTags.length; i++) {
            if (passageHandler.wordTags[i].classList.contains("current"))
                break;
            wordsCompleted++;
        }
        return wordsCompleted;
    }
    function UpdateWords() {
        passageHandler.GetWordsFromServer(null);
        wordIndex = 0;
        lastInput = "";
        InitializeTimePressedArray();
    }
    setTimeout(UpdateWords, 10000);
    /*
    To Do:
    Check for exceptions in the GetTimeTakenArray function and make the function more readable
    */
});
//# sourceMappingURL=MainScript.js.map