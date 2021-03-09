export class PassageHandler {
    constructor() {
        this.longLength = 0;
    }
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
            this.GetLongLength();
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
            this.spanTags = Array(this.longLength);
            for (let i = 0; i < this.wordTags.length; i++)
                this.spanTags[i] = this.wordTags[i].querySelectorAll("span");
            this.MarkWordTagAsCurrent(0);
            successiveFunction();
        });
    }
    GetLongLength() {
        if (this.wordArray == null || this.wordArray == undefined)
            return;
        this.longLength = 0;
        // Get total length of a passage where every word is followed by a space
        for (let i = 0; i < this.wordArray.length; i++)
            this.longLength += this.wordArray[i].length + 1;
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