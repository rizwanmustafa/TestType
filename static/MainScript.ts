import { PassageHandler } from "./PassageHandler.js";
import { PassageResult, PassageStatistics } from "./PassageStatistics.js";

const passageHandler: PassageHandler = new PassageHandler();
const username = document.querySelector("#username").textContent;

passageHandler.GetWordsFromServer(function () {
    // Initialize variables for later use
    const typeTextBox = document.querySelector("#typeTextBox") as HTMLInputElement;
    var wordIndex: number = 0;
    var lastInput: String = "";
    var timePressed: Array<Array<number>> = new Array(passageHandler.wordArray.length);
    var startingTime = -1;
    ResetTimePressedArray();

    typeTextBox.addEventListener("input", OnInput);

    // This function handles input for the textbox
    function OnInput(e: Event) {
        // Store the necessary variables like current time
        const currentTime: number = Date.now();
        const target: HTMLInputElement = e.target as HTMLInputElement;
        const userInput: String = target.value;


        /*---------------------------------------------------------------------------------*/
        /* Deal with any exceptions or special cases */
        // If the user has already completed the test, show the statistics of current lesson and get new words
        if (wordIndex >= passageHandler.wordArray.length) {
            const passageStats = new PassageStatistics(passageHandler.wordTags, passageHandler.spanTags, startingTime, timePressed);
            const passageResult = passageStats.GetStatistics();
            UpdateWords(passageResult);
            target.value = "";
            return;
        }
        // If the user input is same as before, do nothing
        // Or if the input is empty, reset the formatting on the word tag and do no more
        if (userInput == lastInput) return;
        else if (userInput == "") {
            passageHandler.UnformatWordTag(wordIndex);
            passageHandler.FormatWordTagAsCurrent(wordIndex);
            // Remove any stored time for this word
            timePressed[wordIndex] = new Array<number>(passageHandler.wordArray[wordIndex].length);
            return;
        }
        /*-------------------------------------------------------------------------------- */

        // Set the starting time if it has not been already set
        if (startingTime == -1) startingTime = currentTime;

        // Move to the next word if the user inputs space at the end of the word
        if (target.value[target.value.length - 1] == " ") {

            // Remove time for any character that has not yet been typed
            for (let i = userInput.length; i < passageHandler.wordArray[wordIndex].length; i++) {
                timePressed[wordIndex][i] = undefined;
            }

            // Hide all previous words if the next word is on a new line
            if (wordIndex >= passageHandler.wordArray.length - 1 || passageHandler.IsNewLineStarting(wordIndex)) {
                passageHandler.HideWordTagsUntilIndex(wordIndex)
                target.value = "";
            }

            // Move to the next word
            MoveToNextWord(userInput.substr(0, userInput.length - 1));

        }
        else {
            passageHandler.ValidateAndFormatWord(wordIndex, userInput, false);

            // Get index of the char which was edited
            const charIndex = target.selectionStart - 1;
            // Get place where the input changed and shift the values accordingly
            if (typeTextBox.selectionStart != userInput.length) {
                // Check if the user has removed the character or added one
                if (userInput.length < lastInput.length) {
                    ShiftValuesToLeft(charIndex);
                }
                else if (userInput.length > lastInput.length) {
                    ShiftValuesToRight(charIndex);
                }
            }

            // A char was added so set the time it was pressed
            if (charIndex < passageHandler.wordArray[wordIndex].length && lastInput.length <= userInput.length) {
                timePressed[wordIndex][charIndex] = currentTime;
            }
            // Remove time for any character that has not yet been typed
            for (let i = userInput.length; i < passageHandler.wordArray[wordIndex].length; i++) {
                timePressed[wordIndex][i] = undefined;
            }

            lastInput = userInput;
        }
    }

    // This function resets the array values
    function ResetTimePressedArray() {
        for (let i = 0; i < passageHandler.wordArray.length; i++) {
            timePressed[i] = new Array<number>(passageHandler.wordArray[i].length);
        }
    }

    // Use when the user adds a character in between the word
    function ShiftValuesToRight(index: number) {
        for (let i = passageHandler.wordArray[wordIndex].length - 1; i > index; i--)
            timePressed[wordIndex][i] = timePressed[wordIndex][i - 1];
    }

    // Use when the user removes a character in between the word
    function ShiftValuesToLeft(index: number) {
        for (let i = index + 2; i < timePressed[wordIndex].length; i++) {
            timePressed[wordIndex][i - 1] = timePressed[wordIndex][i];
        }
    }

    function MoveToNextWord(userInput: String) {
        // Unformat the current word and format it again to highlight any mistakes the user made
        passageHandler.UnformatWordTag(wordIndex);
        passageHandler.ValidateAndFormatWord(wordIndex, userInput, true);

        // Reset the values of the textbox
        typeTextBox.value = "";
        lastInput = "";

        // Increment the wordIndex and do not execute the remaining code if the user has finished the test
        wordIndex++;
        if (wordIndex >= passageHandler.wordTags.length) return;

        // Format the current word tag
        passageHandler.FormatWordTagAsCurrent(wordIndex);
    }

    function UpdateWords(passageStats: PassageResult) {
        passageHandler.SendResult(username, passageStats, () => {
            passageHandler.GetWordsFromServer(function () {
                wordIndex = 0;
                lastInput = "";
                startingTime = -1;
                typeTextBox.value = "";
                ResetTimePressedArray();
            }, username);
        })
    }

}, username);