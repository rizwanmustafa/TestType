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
		console.log(this.wordTags)

		// Get all span tags
		this.spanTags = Array<NodeListOf<HTMLSpanElement>>(this.longLength);
		for (let i = 0; i < this.wordTags.length; i++)
			this.spanTags[i] = this.wordTags[i].querySelectorAll("span");
		console.log(this.spanTags)


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
const myUtility = new Utility(typeText);

let wordIndex: number = 0
myUtility.FormatWordTag(wordIndex)
console.log("we formatted the word")

// Add event when user types
document.querySelector("#typeSpace").addEventListener("input", OnInput)

// Handle user input
function OnInput(e: Event) {

	const target = e.target as HTMLInputElement;
	var targetValue = target.value;

	if (wordIndex >= myUtility.words.length) {
		target.value = "";
		return;
	}

	if (targetValue != " ") {
		if (targetValue.includes(" ")) {

			if (wordIndex >= myUtility.words.length - 1 || myUtility.NewLineStarting(wordIndex)) {
				myUtility.HideWordTags(wordIndex)
				target.value = "";
			}
			targetValue = targetValue.trim()
			myUtility.UnformatWordTag(wordIndex)
			// Validate this word and move on to the next one
			if (targetValue == myUtility.words[wordIndex]) {
				myUtility.wordTags[wordIndex].classList.add("correct")
			}
			else {
				// Check where the user made mistakes and add them to span elements
				for (let i = 0; i < myUtility.words[wordIndex].length; i++) {
					const char = myUtility.words[wordIndex][i];
					if (char != targetValue[i]) {
						myUtility.wordTags[wordIndex].classList.add("wrong")
						myUtility.spanTags[wordIndex][i].classList.add("wrong")
					}
				}
				if (targetValue.length > myUtility.words[wordIndex].length)
					myUtility.wordTags[wordIndex].classList.add('wrong');
			}

			// Increment word index, get span tags for new word, format it and reset textbox value
			wordIndex++;
			myUtility.FormatWordTag(wordIndex)
			target.value = "";
		}
		else {
			targetValue = targetValue.trim()
			// Remove current class from all span tags and add it to the current one
			myUtility.UnformatSpanTags(wordIndex)

			if (targetValue.length < myUtility.words[wordIndex].length)
				myUtility.spanTags[wordIndex][targetValue.length].classList.add("current")

			// Validate the existing word
			let wordWrong: boolean = false;
			for (let i = 0; i < targetValue.length; i++) {
				const char = targetValue[i];
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


/* To Do: To store the starting time of a character:
 * get the position of cursor and store the starting time.
 * To process the time difference:
 * Take next next time and find the time that is larger than that
 * and get the difference. We will get time taken for the key
 * corresponding to the starting time index */
