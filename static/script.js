class Utility {
    constructor(typeText) {
        this.longLength = 0;
        if (typeText == null || typeText == undefined)
            return;
        // Get words and the total length of the passage
        this.words = typeText.textContent.split(" ");
        this.longLength = this.GetLongLength();
        // Set HTML of words
        typeText.innerHTML = this.GetWordsHTML();
        // Get all word tags
        this.wordTags = typeText.querySelectorAll("word");
        // Get all span tags
        this.spanTags = Array(this.longLength);
        for (let i = 0; i < this.wordTags.length; i++)
            this.spanTags[i] = this.wordTags[i].querySelectorAll("span");
    }
    // Get Words Later for more sessions without reloading webpage
    GetWordsFromServer() {
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
            console.log(finalString);
            document.querySelector("#typeText").innerHTML = finalString;
        });
    }
    GetWordsHTML() {
        let finalHTML = "";
        this.words.forEach(word => {
            // Add span tags inside a word tag. Then add a word break tag and a space    
            finalHTML += "<word>";
            for (let i = 0; i < word.length; i++)
                finalHTML += "<span>" + word[i] + "</span>";
            finalHTML += "</word><wbr> ";
        });
        return finalHTML;
    }
    GetLongLength() {
        if (this.words == null || this.words == undefined)
            return;
        this.longLength = 0;
        // Get total length of a passage where every word is followed by a space
        for (let i = 0; i < this.words.length; i++)
            this.longLength += this.words[i].length + 1;
    }
    FormatWordTag(wordIndex) {
        const tag = this.wordTags[wordIndex];
        // Add current class to the tag and the first span of the tag
        tag.classList.add("current");
        this.spanTags[wordIndex][0].classList.add("current");
    }
    UnformatWordTag(wordIndex) {
        // Remove any classes from the word tag and its children span tags
        this.wordTags[wordIndex].classList.value = "";
        this.UnformatSpanTags(wordIndex);
    }
    UnformatSpanTags(wordIndex) {
        // Remove any known classes from the child span tags
        this.spanTags[wordIndex].forEach(spanTag => {
            spanTag.classList.value = "";
        });
    }
    NewLineStarting(wordIndex) {
        // If this is the last word, return true anyways
        if (wordIndex + 1 >= this.words.length)
            return true;
        // If  topoffset of next element more than the current one, means new line starting
        if (this.wordTags[wordIndex].offsetTop < this.wordTags[wordIndex + 1].offsetTop)
            return true;
        else
            return false;
    }
    HideWordTags(wordIndex) {
        for (let i = 0; i <= wordIndex; i++) {
            const element = this.wordTags[i];
            element.style.display = "none";
        }
    }
}
const typeText = document.querySelector("#typeText");
const typeSpace = document.querySelector("#typeSpace");
const myUtility = new Utility(typeText);
//Store time taken for each character
var timePressed = new Array(myUtility.words.length);
InitializeTimePressedArray();
var lastInput = "";
let wordIndex = 0;
myUtility.FormatWordTag(wordIndex);
// Add event when user types
document.querySelector("#typeSpace").addEventListener("input", OnInput);
// Handle user input
function OnInput(e) {
    const currentTime = Date.now();
    const target = e.target;
    var userInput = target.value;
    // Do not do anything if the user has already finished their exercise
    if (wordIndex >= myUtility.words.length) {
        target.value = "";
        return;
    }
    if (userInput == lastInput)
        return;
    else if (userInput == "") {
        myUtility.UnformatWordTag(wordIndex);
        myUtility.FormatWordTag(wordIndex);
        return;
    }
    //Get current cursor place
    const charIndex = target.selectionStart - 1;
    console.log("Word Index: " + wordIndex + " Character Index: " + charIndex);
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
    if (charIndex < myUtility.words[wordIndex].length && lastInput.length < userInput.length) {
        timePressed[wordIndex][charIndex] = currentTime;
    }
    // Remove time for any character that has not yet been typed
    for (let i = userInput.length; i < myUtility.words[wordIndex].length; i++) {
        timePressed[wordIndex][i] = undefined;
    }
    lastInput = userInput;
    if (userInput[userInput.length - 1] == " ") {
        if (wordIndex >= myUtility.words.length - 1 || myUtility.NewLineStarting(wordIndex)) {
            myUtility.HideWordTags(wordIndex);
            target.value = "";
        }
        userInput = userInput.trim();
        myUtility.UnformatWordTag(wordIndex);
        // Validate this word and move on to the next one
        if (userInput == myUtility.words[wordIndex]) {
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
        if (userInput.length < myUtility.words[wordIndex].length) {
            myUtility.spanTags[wordIndex][userInput.length].classList.add("current");
            console.log("This happened");
        }
        ValidateAndFormatWord(userInput);
    }
}
function InitializeTimePressedArray() {
    for (let i = 0; i < myUtility.words.length; i++) {
        timePressed[i] = new Array(myUtility.words[i].length);
    }
}
// Use when the user adds a character in between the word
function ShiftValuesToRight(index) {
    for (let i = myUtility.words[wordIndex].length - 1; i > index; i--)
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
    myUtility.FormatWordTag(wordIndex);
    typeSpace.value = "";
}
function ValidateAndFormatWord(userInput, wordCompleted = false) {
    const word = myUtility.words[wordIndex];
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
/*
   To Do:
   Format code
   Divide code into smaller chunks
*/ 
//# sourceMappingURL=script.js.map