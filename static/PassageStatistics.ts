export class PassageStatistics{
    wordTags : NodeListOf<HTMLElement>;
    spanTags: Array<NodeListOf<HTMLSpanElement>>;
        
    constructor(wordTags){
        this.wordTags = wordTags;
        // Get and set the span tags
        this.spanTags = Array<NodeListOf<HTMLSpanElement>>(this.wordTags.length);
        for (let i = 0; i < this.wordTags.length; i++)
            this.spanTags[i] = this.wordTags[i].querySelectorAll("span");
    }


    public GetNumberOfCorrectWords() : number{
        var correctWords : number = 0;

        for(let i =0; i < this.wordTags.length; i++){
            if(this.wordTags[i].classList.contains("correct")) correctWords++;
        }

        return correctWords;
    }

    public GetNumberOfWrongWords(): number{
        var wrongWords : number = 0;

        for(let i =0; i < this.wordTags.length; i++){
            if(this.wordTags[i].classList.contains("wrong")) wrongWords++;
        }

        return wrongWords;
    }

    public GetNumberOfCorrectChars(): number{
        var correctChars : number = 0;
        this.spanTags.forEach(word=>{
            word.forEach(char=>{
                if(char.classList.contains("correct")) correctChars++;
            });
        });

        return correctChars;
    }

    public GetNumberOfWrongChars(): number{
        var wrongChars : number = 0;
        this.spanTags.forEach(word=>{
            word.forEach(char=>{
                if(char.classList.contains("wrong")) wrongChars++;
            });
        });

        return wrongChars;
    }
}