export class PassageHandler {
    // Get Words Later for more sessions without reloading webpage
    GetWordsFromServer(successiveFunction) {
        fetch("/GetWords").then(response => {
            if (response.status == 200)
                return response.json();
            else
                alert("Could not connect to server!");
        }).then(wordsJSON => {
            var finalHTML = "";
            // Set the word array and get the long length of it
            this.wordArray = wordsJSON;
            // Calculate the final HTML and set it
            wordsJSON.forEach(word => {
                finalHTML += "<word>";
                for (let i = 0; i < word.length; i++)
                    finalHTML += "<span>" + word[i] + "</span>";
                finalHTML += "</word><wbr> ";
            });
            finalHTML = finalHTML.substr(0, finalHTML.length - 1);
            const typeText = document.querySelector("#typeText");
            typeText.innerHTML = finalHTML;
            // Get word and span tags
            this.wordTags = typeText.querySelectorAll("word");
            this.spanTags = Array(this.wordTags.length);
            for (let i = 0; i < this.wordTags.length; i++)
                this.spanTags[i] = this.wordTags[i].querySelectorAll("span");
            this.MarkWordTagAsCurrent(0);
            if (successiveFunction != undefined || successiveFunction != null)
                successiveFunction();
        });
    }
    ValidateAndFormatWord(wordIndex, userInput, wordCompleted = false) {
        if (wordIndex >= this.wordTags.length)
            return;
        const word = this.wordArray[wordIndex];
        const wordTag = this.wordTags[wordIndex];
        wordTag.classList.remove("wrong");
        if (userInput.length > word.length || (userInput != word && wordCompleted)) {
            wordTag.classList.add("wrong");
        }
        else if (userInput.length < word.length && wordCompleted) {
            // Add wrong class to span tags that have not been typed if user moved to next word
            for (let i = userInput.length; i < word.length; i++) {
                this.spanTags[wordIndex][i].classList.add("wrong");
            }
        }
        for (let i = 0; i < userInput.length; i++) {
            const char = userInput[i];
            const spanTag = this.spanTags[wordIndex][i];
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
    MarkWordTagAsCurrent(wordIndex) {
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
    GetIndexOfNewLine(wordIndex) {
        // If this is the last word, return true anyways
        if (wordIndex + 1 >= this.wordArray.length)
            return true;
        // If  topoffset of next element more than the current one, means new line starting
        if (this.wordTags[wordIndex].offsetTop < this.wordTags[wordIndex + 1].offsetTop)
            return true;
        else
            return false;
    }
    HideWordTagsUntilIndex(wordIndex) {
        for (let i = 0; i <= wordIndex; i++) {
            const element = this.wordTags[i];
            element.style.display = "none";
        }
    }
}
//# sourceMappingURL=PassageHandler.js.map