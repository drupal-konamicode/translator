(function ($) {
  $.fn.konamiTranslator = function (options) {
    // The defaults options in case nothing is passed.
    let defaults = {
      translator: 'bork',
    };

    // Extend those options.
    options = $.extend(defaults, options);

    // Load the dictionary E.g. bork.js if it isn't loaded yet.
    if (typeof dictionary === 'undefined') {
      $.getScript('/libraries/translator/js/dictionaries/' + options.translator + '.js').done(function () {
        translatePage();
      });
    }
    else {
      // If it's loaded already, just execute the translation.
      translatePage();
    }

    /**
     * Function that will process all the content of the page and translate it.
     */
    function translatePage() {
      $.expr[':'].nochildren = function (elem) {
        return !elem.innerHTML.match(/<\w/);
      };

      // We check all nodes to see if they have children by looking for < in
      // their innerHTML for a more pure DOM approach looking for textNodes only.
      $('body').find('*').addBack().filter(':nochildren').each(function () {
        // Fetch the string.
        let text_string = this.innerText || this.textContent;

        let translated = translate(text_string);
        if (this.innerText) {
          this.innerText = translated;
        }
        else {
          this.textContent = translated;
        }
      });
      return this;
    }

    /**
     * Function to translate a peice of text.
     */
    function translate(text) {
      let translatedText = "";

      // Loop through the text, one character at a time.
      let word = "";
      for (let i = 0; i < text.length; i += 1) {
        let character = text[i];
        // If the char is a letter, then we are in the middle of a word, so we
        // should accumulate the letter into the word variable
        if (isLetter(character)) {
          word += character;
        }
        // If the char is not a letter, then we hit the end of a word, so we
        // should translate the current word and add it to the translation
        else {
          if (word !== "") {
            // If we've just finished a word, translate it
            let translatedWord = translateWord(word);
            translatedText += translatedWord;
            word = "";
          }
          translatedText += character; // Add the non-letter character
        }
      }

      // If we ended the loop before translating a word, then translate the final
      // word and add it to the translation.
      if (word !== "") translatedText += translateWord(word);

      return translatedText;
    }

    /**
     * Function to translate a word.
     */
    function translateWord(word) {
      let dictionary_word = dictionary[word.toLowerCase()];

      // If we got an array, let's randomly select an option.
      if ($.isArray(dictionary_word)) {
        dictionary_word = dictionary_word[Math.floor(Math.random() * dictionary_word.length)];
      }

      // If we don't have a translation, let's just return the word.
      if (dictionary_word === undefined) {
        return word;
      }
      else {
        return applyCase(word, dictionary_word);
      }
    }

    /**
     * Take the case from wordA and apply it to wordB.
     */
    function applyCase(wordA, wordB) {
      // Exception to avoid words like "I" being converted to "ME"
      if (wordA.length === 1 && wordB.length !== 1) return wordB;
      // Uppercase
      if (wordA === wordA.toUpperCase()) return wordB.toUpperCase();
      // Lowercase
      if (wordA === wordA.toLowerCase()) return wordB.toLowerCase();
      // Capitalized.
      let firstChar = wordA.slice(0, 1);
      let otherChars = wordA.slice(1);
      if (firstChar === firstChar.toUpperCase() && otherChars === otherChars.toLowerCase()) {
        return wordB.slice(0, 1).toUpperCase() + wordB.slice(1).toLowerCase();
      }
      // Other cases
      return wordB;
    }

    /**
     * Function to check if we just got a letter.
     */
    function isLetter(character) {
      if (character.search(/[a-zA-Z'-]/) === -1) return false;
      return true;
    }
  }
})(jQuery);
