export class PassageHandler {
    // Get Words Later for more sessions without reloading webpage
    GetWordsFromServer(successiveFunction, username) {
        var finalURL = "";
        if (username == "")
            finalURL = "/GetWords";
        else
            finalURL = "/API/GetPassage/" + username + "/50";
        console.log(finalURL);
        fetch(finalURL).then(response => {
            if (response.status == 200) {
                console.log(response);
                return response.json();
            }
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
            this.FormatWordTagAsCurrent(0);
            if (successiveFunction != undefined || successiveFunction != null)
                successiveFunction();
        });
    }
    ValidateAndFormatWord(wordIndex, userInput, wordCompleted) {
        if (wordIndex >= this.wordTags.length)
            return;
        const word = this.wordArray[wordIndex];
        const wordTag = this.wordTags[wordIndex];
        // Remove any previous formatting on the word tag
        this.UnformatWordTag(wordIndex);
        if (userInput == word) {
            wordTag.classList.add("correct");
            return;
        }
        else if (userInput.length < word.length && !wordCompleted) {
            this.wordTags[wordIndex].classList.add("current");
            this.spanTags[wordIndex][userInput.length].classList.add("current");
        }
        // If the user's input length is greater than the length of the word
        // Or if the user's input is not the same as the word and the user moves to next word
        // Mark the word as wrong
        if (userInput.length > word.length || (userInput != word && wordCompleted)) {
            wordTag.classList.add("wrong");
        }
        for (var i = 0; i < word.length; i++) {
            if (i >= userInput.length && !wordCompleted)
                break;
            if (userInput[i] != word[i]) {
                // If user did not input the current character and the word was supposed to be completed
                // Or the user input was wrong
                // Mark the word and the character as wrong
                this.wordTags[wordIndex].classList.add("wrong");
                this.spanTags[wordIndex][i].classList.add("wrong");
            }
            else {
                this.spanTags[wordIndex][i].classList.add("correct");
            }
        }
    }
    FormatWordTagAsCurrent(wordIndex) {
        // Add current class to the tag and the first span of the tag
        this.wordTags[wordIndex].classList.add("current");
        this.spanTags[wordIndex][0].classList.add("current");
    }
    UnformatWordTag(wordIndex) {
        // Remove any classes from the word tag and its children span tags
        this.wordTags[wordIndex].classList.value = "";
        this.spanTags[wordIndex].forEach(spanTag => {
            spanTag.classList.value = "";
        });
    }
    HideWordTagsUntilIndex(wordIndex) {
        // Hide all word tags until index by changing their display value
        for (let i = 0; i <= wordIndex; i++) {
            this.wordTags[i].style.display = "none";
        }
    }
    IsNewLineStarting(wordIndex) {
        // If this is the last word, return true anyways
        if (wordIndex + 1 >= this.wordArray.length)
            return true;
        // If  topoffset of next element more than the current one, means new line starting
        if (this.wordTags[wordIndex].offsetTop < this.wordTags[wordIndex + 1].offsetTop)
            return true;
        else
            return false;
    }
    SendResult(username, passageResult, successiveFunction) {
        // Send user Result data to server
        if (username != "") {
            fetch("/API/AddResult/" + username, {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify([
                    passageResult.correctChars,
                    passageResult.wrongChars,
                    passageResult.charAccuracies,
                    passageResult.charSpeeds,
                ])
            });
        }
        if (successiveFunction != undefined || successiveFunction != null)
            successiveFunction();
    }
}
//# sourceMappingURL=PassageHandler.js.map