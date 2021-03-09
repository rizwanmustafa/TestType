import { PassageHandler } from './PassageHandler.js';
const typeText = document.querySelector("#typeText");
const typeSpace = document.querySelector("#typeSpace");
const myUtility = new PassageHandler();
// Get words from server
myUtility.GetWordsFromServer(function () {
    //Store time taken for each character
    var timePressed = new Array(myUtility.wordArray.length);
    InitializeTimePressedArray();
    var lastInput = "";
    let wordIndex = 0;
    myUtility.MarkWordTagAsCurrent(wordIndex);
    // Add event when user types
    document.querySelector("#typeSpace").addEventListener("input", OnInput);
    // Handle user input
    function OnInput(e) {
        const currentTime = Date.now();
        const target = e.target;
        var userInput = target.value;
        // Do not do anything if the user has already finished their exercise
        if (wordIndex >= myUtility.wordArray.length) {
            target.value = "";
            return;
        }
        if (userInput == lastInput)
            return;
        else if (userInput == "") {
            myUtility.UnformatWordTag(wordIndex);
            myUtility.MarkWordTagAsCurrent(wordIndex);
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
        if (charIndex < myUtility.wordArray[wordIndex].length && lastInput.length < userInput.length) {
            timePressed[wordIndex][charIndex] = currentTime;
        }
        // Remove time for any character that has not yet been typed
        for (let i = userInput.length; i < myUtility.wordArray[wordIndex].length; i++) {
            timePressed[wordIndex][i] = undefined;
        }
        lastInput = userInput;
        if (userInput[userInput.length - 1] == " ") {
            if (wordIndex >= myUtility.wordArray.length - 1 || myUtility.GetIndexOfNewLine(wordIndex)) {
                myUtility.HideWordTagsUntilIndex(wordIndex);
                target.value = "";
            }
            userInput = userInput.trim();
            myUtility.UnformatWordTag(wordIndex);
            // Validate this word and move on to the next one
            if (userInput == myUtility.wordArray[wordIndex]) {
                myUtility.wordTags[wordIndex].classList.add("correct");
            }
            else {
                ValidateAndFormatWord(userInput, true);
            }
            MoveToNextWord();
        }
        else {
            userInput = userInput.trim();
            // Remove any classes from all span tags
            myUtility.UnformatSpanTags(wordIndex);
            // Add "current" class to the current span tag
            if (userInput.length < myUtility.wordArray[wordIndex].length) {
                myUtility.spanTags[wordIndex][userInput.length].classList.add("current");
            }
            ValidateAndFormatWord(userInput);
        }
    }
    function InitializeTimePressedArray() {
        for (let i = 0; i < myUtility.wordArray.length; i++) {
            timePressed[i] = new Array(myUtility.wordArray[i].length);
        }
    }
    // Use when the user adds a character in between the word
    function ShiftValuesToRight(index) {
        for (let i = myUtility.wordArray[wordIndex].length - 1; i > index; i--)
            timePressed[wordIndex][i] = timePressed[wordIndex][i - 1];
    }
    // Use when the user removes a character in between the word
    function ShiftValuesToLeft(index) {
        for (let i = index + 2; i < timePressed[wordIndex].length; i++) {
            timePressed[wordIndex][i - 1] = timePressed[wordIndex][i];
        }
    }
    // Returns the index where the last input differs from the current input
    function GetDifferentCharIndex(lastInput, currentInput) {
        var maxLength = Math.max(lastInput.length, currentInput.length);
        // Check where the new input has changed
        for (let i = 0; i < maxLength; i++) {
            if (lastInput[i] == undefined || currentInput[i] == undefined)
                return i;
            if (lastInput[i] != currentInput[i])
                return i;
        }
    }
    function MoveToNextWord() {
        wordIndex++;
        lastInput = "";
        myUtility.MarkWordTagAsCurrent(wordIndex);
        typeSpace.value = "";
    }
    function ValidateAndFormatWord(userInput, wordCompleted = false) {
        const word = myUtility.wordArray[wordIndex];
        const wordTag = myUtility.wordTags[wordIndex];
        wordTag.classList.remove("wrong");
        if (userInput.length > word.length || (userInput != word && wordCompleted)) {
            wordTag.classList.add("wrong");
        }
        else if (userInput.length < word.length && wordCompleted) {
            // Add wrong class to span tags that have not been typed if user moved to next word
            for (let i = userInput.length; i < word.length; i++) {
                myUtility.spanTags[wordIndex][i].classList.add("wrong");
            }
        }
        for (let i = 0; i < userInput.length; i++) {
            const char = userInput[i];
            const spanTag = myUtility.spanTags[wordIndex][i];
            // If the user's input's length is greater than the word length
            // Mark the word as wrong
            if (i >= word.length) {
                wordTag.classList.add("wrong");
                break;
            }
            // If the current character does not match the corresponding character
            // Mark the character and the word wrong
            if (char != word[i]) {
                wordTag.classList.add("wrong");
                spanTag.classList.add("wrong");
            }
            else {
                spanTag.classList.remove("wrong");
            }
        }
    }
    function GetTimeTakenArray() {
        var timeTaken = new Array(myUtility.wordArray.length);
        for (let i = 0; i < myUtility.wordArray.length; i++) {
            timeTaken[i] = new Array(myUtility.wordArray[i].length);
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
            console.log("we reached here!");
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
                console.log(searchArray[i]);
                console.log(searchArray[smallestValueIndex]);
                console.log("\n");
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
        console.log(totalTime);
    }
    function GetNumberOfWordsCompleted() {
        var wordsCompleted = 0;
        // Loop through each of the word
        for (let i = 0; i < myUtility.wordTags.length; i++) {
            if (myUtility.wordTags[i].classList.contains("current"))
                break;
            wordsCompleted++;
        }
        return wordsCompleted;
    }
    /*
    To Do:
    Check for exceptions in the GetTimeTakenArray function and make the function more readable
    */
});
//# sourceMappingURL=MainScript.js.map