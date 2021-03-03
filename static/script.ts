class Utility {
	// Public variables
	words: Array<String>;
	wordTags: NodeListOf<HTMLElement>;
	spanTags: Array<NodeListOf<HTMLSpanElement>>;
	longLength: number = 0;

	constructor(typeText: HTMLElement) {
		if (typeText == null || typeText == undefined)
			return;

		// Get words and the total length of the passage
		this.words = typeText.textContent.split(" ")
		this.longLength = this.GetLongLength()

		// Set HTML of words
		typeText.innerHTML = this.GetWordsHTML();

		// Get all word tags
		this.wordTags = typeText.querySelectorAll("word")

		// Get all span tags
		this.spanTags = Array<NodeListOf<HTMLSpanElement>>(this.longLength);
		for (let i = 0; i < this.wordTags.length; i++)
			this.spanTags[i] = this.wordTags[i].querySelectorAll("span");


	}

	// Get Words Later for more sessions without reloading webpage
	private GetWordsFromServer() {
		fetch("/GetWords").then(response => {
			if (response.status == 200)
				return response.json();
			else
				alert("Could not connect to server!");
		}).then(wordsJSON => {
			var finalString = "";
			wordsJSON.forEach(word => {
				finalString += word + " ";
			});
			finalString = finalString.substr(0, finalString.length - 1);
			console.log(finalString)
			document.querySelector("#typeText").innerHTML = finalString;
		})
	}

	private GetWordsHTML(): string {
		let finalHTML = "";

		this.words.forEach(word => {
			// Add span tags inside a word tag. Then add a word break tag and a space    
			finalHTML += "<word>";

			for (let i = 0; i < word.length; i++)
				finalHTML += "<span>" + word[i] + "</span>";

			finalHTML += "</word><wbr> ";
		})

		return finalHTML;
	}

	private GetLongLength(): number {
		if (this.words == null || this.words == undefined)
			return;

		this.longLength = 0;

		// Get total length of a passage where every word is followed by a space
		for (let i = 0; i < this.words.length; i++)
			this.longLength += this.words[i].length + 1;
	}

	public FormatWordTag(wordIndex: number) {
		const tag = this.wordTags[wordIndex];
		// Add current class to the tag and the first span of the tag
		tag.classList.add("current")
		this.spanTags[wordIndex][0].classList.add("current")
	}

	public UnformatWordTag(wordIndex: number) {
		// Remove any known classes from the word tag itself
		this.wordTags[wordIndex].classList.remove("current")
		this.wordTags[wordIndex].classList.remove("correct")
		this.wordTags[wordIndex].classList.remove("wrong")

		this.UnformatSpanTags(wordIndex);
	}

	public UnformatSpanTags(wordIndex: number) {
		// Remove any known classes from the child span tags
		this.spanTags[wordIndex].forEach(spanTag => {
			spanTag.classList.remove("current")
			spanTag.classList.remove("correct")
			spanTag.classList.remove("wrong")
		})
	}

	public NewLineStarting(wordIndex: number): boolean {
		// If this is the last word, return true anyways
		if (wordIndex + 1 >= this.words.length)
			return true;

		// If  topoffset of next element more than the current one, means new line starting
		if (this.wordTags[wordIndex].offsetTop < this.wordTags[wordIndex + 1].offsetTop)
			return true;
		else
			return false;
	}

	public HideWordTags(wordIndex: number) {
		for (let i = 0; i <= wordIndex; i++) {
			const element = this.wordTags[i] as HTMLElement;
			element.style.display = "none";
		}
	}

}
const typeText = document.querySelector("#typeText") as HTMLElement;
const typeSpace = document.querySelector("#typeSpace") as HTMLInputElement;
const myUtility = new Utility(typeText);


//Store time taken for each character
var timeTaken = new Array(myUtility.words.length);
InitializeTimePressedArray();
var lastInput = "";

let wordIndex: number = 0
myUtility.FormatWordTag(wordIndex)

// Add event when user types
document.querySelector("#typeSpace").addEventListener("input", OnInput)

// Handle user input
function OnInput(e: Event) {
	console.log(typeSpace.selectionStart);
	
	const currentTime = Date.now();
	
	const target = e.target as HTMLInputElement;
	var currentInput = target.value;
	
	if (currentInput == lastInput) return;

	if (wordIndex >= myUtility.words.length) {
		target.value = "";
		return;
	}


	//Get current cursor place
	const charIndex = target.selectionStart - 1;
	console.log("Word Index: " + wordIndex + " Character Index: " + charIndex);
	//Store time for current char


	// Get place where the input changed and shift the values accordingly
	if (typeSpace.selectionStart != currentInput.length) {

		// Check if the user has removed the character or added one
		if (currentInput.length < lastInput.length) {
			ShiftValuesToLeft(charIndex);
		}
		else if (currentInput.length > lastInput.length) {
			ShiftValuesToRight(charIndex);
		}
	}
	
	if (charIndex != -1 && lastInput.length < currentInput.length) {
		// A char was added so set the timeTaken
		timeTaken[wordIndex][charIndex] = currentTime;
	}


	//Remove time for any char that has not yet been typed
	for (let i = currentInput.length; i < myUtility.words[wordIndex].length; i++) {
		timeTaken[wordIndex][i] = undefined;
	}

	lastInput = currentInput;


	if (currentInput != " ") {
		if (currentInput[currentInput.length - 1] == " ") {

			if (wordIndex >= myUtility.words.length - 1 || myUtility.NewLineStarting(wordIndex)) {
				myUtility.HideWordTags(wordIndex)
				target.value = "";
			}
			currentInput = currentInput.trim()
			myUtility.UnformatWordTag(wordIndex)
			// Validate this word and move on to the next one
			if (currentInput == myUtility.words[wordIndex]) {
				myUtility.wordTags[wordIndex].classList.add("correct")
			}
			else {
				// Check where the user made mistakes and add them to span elements
				for (let i = 0; i < myUtility.words[wordIndex].length; i++) {
					const char = myUtility.words[wordIndex][i];
					if (char != currentInput[i]) {
						myUtility.wordTags[wordIndex].classList.add("wrong")
						myUtility.spanTags[wordIndex][i].classList.add("wrong")
					}
				}
				if (currentInput.length > myUtility.words[wordIndex].length)
					myUtility.wordTags[wordIndex].classList.add('wrong');
			}

			// Increment word index, get span tags for new word, format it and reset textbox value
			wordIndex++;
			lastInput = "";
			myUtility.FormatWordTag(wordIndex)
			target.value = "";
		}
		else {
			currentInput = currentInput.trim()
			// Remove current class from all span tags and add it to the current one
			myUtility.UnformatSpanTags(wordIndex)

			if (currentInput.length < myUtility.words[wordIndex].length)
				myUtility.spanTags[wordIndex][currentInput.length].classList.add("current")

			// Validate the existing word
			let wordWrong: boolean = false;
			for (let i = 0; i < currentInput.length; i++) {
				const char = currentInput[i];
				if (i >= myUtility.words[wordIndex].length) {
					myUtility.wordTags[wordIndex].classList.add("wrong")
					wordWrong = true;
					break;
				}

				if (char != myUtility.words[wordIndex][i]) {
					wordWrong = true;
					myUtility.wordTags[wordIndex].classList.add("wrong")
					myUtility.spanTags[wordIndex][i].classList.add("wrong")
				}
			}
			if (!wordWrong) {
				myUtility.wordTags[wordIndex].classList.remove("wrong");
				myUtility.spanTags[wordIndex].forEach(spanTag => {
					spanTag.classList.remove("wrong")
				});
			}
		}
	}
	else target.value = ""
}

function InitializeTimePressedArray() {
	for (let i = 0; i < myUtility.words.length; i++) {
		timeTaken[i] = new Array<number>(myUtility.words[i].length);
	}
}

// Use when the user adds a character in between the word
function ShiftValuesToRight(index: number) {
	for (let i = myUtility.words[wordIndex].length - 1; i > index; i--)
		timeTaken[wordIndex][i] = timeTaken[wordIndex][i - 1];
}

// Use when the user removes a character in between the word
function ShiftValuesToLeft(index: number) {
	for (let i = index + 2; i < timeTaken[wordIndex].length; i++) {
		timeTaken[wordIndex][i - 1] = timeTaken[wordIndex][i];
	}
}

// Returns the index where the last input differs from the current input
function GetDifferentCharIndex(lastInput: String, currentInput: String) {
	var maxLength = Math.max(lastInput.length, currentInput.length);
	// Check where the new input has changed
	for (let i = 0; i < maxLength; i++) {
		if (lastInput[i] == undefined || currentInput[i] == undefined) return i;

		if (lastInput[i] != currentInput[i]) return i;
	}
}

/* 
   To Do:
   Format code
   Divide code into smaller chunks
*/