import { PassageHandler } from './PassageHandler.js'
import { PassageStatistics } from './PassageStatistics.js';

const typeSpace = document.querySelector("#typeSpace") as HTMLInputElement;
const passageHandler = new PassageHandler();

// Get words from server
passageHandler.GetWordsFromServer(function () {


	//Store time taken for each character
	var timePressed: Array<Array<number>> = new Array<Array<number>>(passageHandler.wordArray.length);
	InitializeTimePressedArray();
	var lastInput = "";

	let wordIndex: number = 0
	passageHandler.MarkWordTagAsCurrent(wordIndex)

	// Add event when user types
	document.querySelector("#typeSpace").addEventListener("input", OnInput)

	// Handle user input
	function OnInput(e: Event) {
		const currentTime = Date.now();
		const target = e.target as HTMLInputElement;
		var userInput = target.value;

		// Do not do anything if the user has already finished their exercise
		if (wordIndex >= passageHandler.wordArray.length) {
			// Get Results and log them in the console for now
			var passageStats = new PassageStatistics(passageHandler.wordTags, passageHandler.spanTags, timePressed);
			console.log("WPM: " + passageStats.GetWordSpeed(true));
			target.value = "";
			return;
		}

		if (userInput == lastInput) return;
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
				passageHandler.HideWordTagsUntilIndex(wordIndex)
				target.value = "";
			}
			userInput = userInput.trim()
			passageHandler.UnformatWordTag(wordIndex)
			// Validate this word and move on to the next one
			if (userInput == passageHandler.wordArray[wordIndex]) {
				passageHandler.wordTags[wordIndex].classList.add("correct")
			}
			else {
				passageHandler.ValidateAndFormatWord(wordIndex, userInput, true);
			}

			MoveToNextWord();
		}
		else {
			userInput = userInput.trim()
			// Remove any classes from all span tags
			passageHandler.UnformatSpanTags(wordIndex)

			// Add "current" class to the current span tag
			if (userInput.length < passageHandler.wordArray[wordIndex].length) {
				passageHandler.spanTags[wordIndex][userInput.length].classList.add("current");
			}

			passageHandler.ValidateAndFormatWord(wordIndex, userInput, false);
		}
	}

	function InitializeTimePressedArray() {
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

	function MoveToNextWord() {
		wordIndex++;
		if (wordIndex >= passageHandler.wordTags.length) return;
		lastInput = "";
		passageHandler.MarkWordTagAsCurrent(wordIndex)
		typeSpace.value = "";
	}

	function UpdateWords() {
		passageHandler.GetWordsFromServer(function () {
			wordIndex = 0;
			lastInput = "";
			InitializeTimePressedArray();
		});
	}
});