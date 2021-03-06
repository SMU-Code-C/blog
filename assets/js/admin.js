// @ts-nocheck
/**
 * Script to control the functionality of the Blog interface
 *
 * CSCI-2356 Project: Phase 3
 *
 * @author Mohak Shrivastava (A00445470)
 * @author Nayem Imtiaz (A00448982)
 * @author Naziya Tasnim (A00447506)
 * @author Sheikh Saad Abdullah (A00447871)
 */

/**
 * Global data (general-purpose)
 *
 * @author Sheikh Saad Abdullah (A00447871)
 */
const PORT = 49149, // port to connect to server on
    SERVER_IPA = "http://140.184.230.209", // ip address of the UGDEV server
    SERVER_URL = `${SERVER_IPA}:${PORT}`, // complete URL of the server
    endpoints = {
        publish: "/publish",
        content: "/content",
        wordBank: "/wordbank",
    }, // list of endpoints
    maxCharsWB = 120, // maximum number of characters in the word bank
    pausing_punctuation = ",;:.?!", // punctuation symbols to put spaces after
    NUM_BLOGS = 3; // number of blogs

/**
 * Object to hold convenient helper methods
 *
 * @author Sheikh Saad Abdullah (A00447871)
 */
const $ = {
    /**
     * Alias to create DOM objects from given selector
     *
     * @author Sheikh Saad Abdullah (A00447871)
     * @param {String} selector selector for the element
     * @returns DOM Object for specified element
     */
    el(selector) {
        let elements = document.querySelectorAll(selector);
        return elements.length === 1 ? elements[0] : elements;
    },

    /**
     * Wrapper around JQuery Ajax methods for GET request
     *
     * @author Sheikh Saad Abdullah (A00447871)
     * @param {String} endpoint target to request data from
     * @param {Function} callback function to process data received
     */
    get(endpoint, callback) {
        jQuery
            .get(SERVER_URL + endpoint, callback)
            .fail((err) => console.log(err));
    },

    //
    /**
     * Wrapper around JQuery Ajax methods for POST request
     *
     * @author Sheikh Saad Abdullah (A00447871)
     * @param {String} endpoint target to send request to
     * @param {Object} payload data to send
     */
    post(endpoint, payload) {
        jQuery
            .post(SERVER_URL + endpoint, payload, (res) => console.log(res))
            .fail((err) => console.log(err));
    },
};

// global data store for Alpine.js
const staticData = {
    /** ---------------------------- Blog List ----------------------------
     * Database to store the list of blogs and publication states
     *
     * @author Mohak Shrivastava (A00445470)
     * @author Nayem Imtiaz (A00448982)
     * @author Sheikh Saad Abdullah (A00447871)
     * -------------------------------------------------------------------- */

    publishStates: Array(NUM_BLOGS).fill(false), // publish states of the blogs

    /**
     * Get all blogs from the database and set the toggle states
     * of the Published column switches in the blog list
     *
     * @author Nayem Imtiaz (A00448982)
     * @author Sheikh Saad Abdullah (A00447871)
     * @returns string to populate text area with
     */
    load() {
        $.get(endpoints.publish, (res) => {
            // set values to each input field from data received
            res.data.forEach((el, i) => {
                this.publishStates[i] = el;
            });
        });
    },

    /**
     * Handle publish toggle and send the publish state to server
     *
     * @author Nayem Imtiaz (A00448982)
     * @author Sheikh Saad Abdullah (A00447871)
     * @param {Object} elem DOM Object of the caller element
     * @param {Number} index index of the caller element
     */
    publish(elem, index) {
        $.post(`${endpoints.publish}/${index + 1}`, {
            data: elem.checked,
        });
    },

    /**
     * Enable or disable the editing of a blog post
     *
     * @author Mohak Shrivastava (A00445470)
     * @author Sheikh Saad Abdullah (A00447871)
     * @param {Object} elem DOM object of the switched edit toggle
     * @param {Number} index index of the toggle switch
     */
    editText(elem, index) {
        $.el(".bl-name")[index].disabled = this.editOn;

        if (this.editOn) {
            this.kbdFocus = $.el("#editbox");
        }

        this.editOn = !this.editOn;
        this.currentlyEditing = index;

        this.cancel();

        $.el(".bl-edit").forEach((el) => {
            if (!el.checked) {
                el.style.visibility = elem.checked ? "hidden" : "visible";
            }
        });

        elem.checked = false;
    },

    /** ---------------------------- Edit Group ---------------------------
     * Variables and functions to control the behaviour
     * of the group of toggle switches and list of blog posts displayed
     *
     * @author Nayem Imtiaz (A00448982)
     * @author Naziya Tasnim (A00447506)
     * @author Sheikh Saad Abdullah (A00447871)
     * -------------------------------------------------------------------- */

    editOn: false, // whether a blog is being edited
    currentlyEditing: -1, // index of the blog being edited

    /**
     * Save the blog post content to the database
     *
     * @author Nayem Imtiaz (A00448982)
     * @author Sheikh Saad Abdullah (A00447871)
     * @returns string to populate text area with
     */
    save() {
        $.post(`${endpoints.content}/${this.currentlyEditing + 1}`, {
            data: $.el("#editbox").value,
        });
    },

    /**
     * Get the blog post content from the database
     *
     * @author Nayem Imtiaz (A00448982)
     * @author Sheikh Saad Abdullah (A00447871)
     * @returns string to populate text area with
     */
    cancel() {
        $.get(`${endpoints.content}/${this.currentlyEditing + 1}`, (res) => {
            // set values to each input field from data received
            $.el("#editbox").value = res.data;
        });
    },

    /**
     * Remove the last word from the text area
     *
     * @author Nayem Imtiaz (A00448982)
     * @author Naziya Tasnim (A00447506)
     * @author Sheikh Saad Abdullah (A00447871)
     */
    undo() {
        const editbox = $.el("#editbox");
        editbox.value = editbox.value.replace(/\S*\s*$/, "");
    },

    /**
     * Close the edit interface and drop back to the blog list
     *
     * @author Sheikh Saad Abdullah (A00447871)
     */
    closeEdit() {
        // Bootstrap Modal bug fix
        jQuery(".modal").modal("hide");
        // jQuery("body").removeClass("modal-open");
        jQuery(".modal-backdrop").remove();

        $.el(`#bl-edit-${this.currentlyEditing + 1}`).dispatchEvent(
            new Event("change")
        );
    },

    /** ----------------------------- Word Bank ---------------------------
     * Variables and functions to control behaviour of the Word Bank
     *
     * @author Mohak Shrivastava (A00445470)
     * @author Sheikh Saad Abdullah (A00447871)
     * -------------------------------------------------------------------- */
    deleteOn: false, // state of the delete key
    wordBank: [], // array to store saved words

    /**
     * Save a word to the word bank
     *
     * @author Mohak Shrivastava (A00445470)
     * @author Sheikh Saad Abdullah (A00447871)
     */
    saveWord() {
        let wb = $.el("#wb");
        const hasSpace =
            this.wordBank.join("").length + wb.value.length <= maxCharsWB;
        if (
            wb.value && // check if word is not empty
            !this.wordBank.includes(wb.value) && // check if word bank does not already contain the word
            hasSpace // check if word bank has space for the word
        ) {
            this.wordBank.push(wb.value);
            this.sendWB();
            wb.value = "";
        } else if (!hasSpace) {
            let toast = new bootstrap.Toast($.el("#add-word-toast"));
            toast.show();
        }
    },

    /**
     * Select word from the word bank
     * and if delete mode is toggled ON, remove word from word bank
     * else append the word to the text being edited
     *
     * @author Mohak Shrivastava (A00445470)
     * @author Sheikh Saad Abdullah (A00447871)
     * @param {String} word text from the word bank
     */
    putWord(word) {
        if (this.deleteOn) {
            // remove word from word bank
            this.wordBank.splice(this.wordBank.indexOf(word), 1);
        } else {
            // add text to text area
            this.kbdFocus = $.el("#editbox");
            this.addText(word);
        }
    },

    /**
     * Close the word bank modal
     *
     * @author Sheikh Saad Abdullah (A00447871)
     */
    closeWB() {
        this.deleteOn = false;
        this.sendWB();
    },

    /**
     * Retrieve word bank array from database via requesting the server
     *
     * @author Sheikh Saad Abdullah (A00447871)
     */
    loadWB() {
        $.get(endpoints.wordBank, (res) => {
            if (res.data) {
                this.wordBank = res.data;
            }
        });
    },

    /**
     * Send word bank array to server to be saved to the database
     *
     * @author Sheikh Saad Abdullah (A00447871)
     */
    sendWB() {
        $.post(endpoints.wordBank, { data: this.wordBank });
    },

    /** ----------------------------- Keyboard ----------------------------
     * Variables and functions to control behaviour of the Keyboard
     *
     * @author Naziya Tasnim (A00447506)
     * @author Sheikh Saad Abdullah (A00447871)
     * -------------------------------------------------------------------- */

    kbdFocus: null, // text field to focus
    capsOn: false, // state of the caps key
    shiftOn: false, // state of the shift key

    /**
     * Character of the key pressed
     *
     * @author Naziya Tasnim (A00447506)
     * @author Sheikh Saad Abdullah (A00447871)
     * @param {String} char character or string to convert
     * @returns uppercase of char if keyboard is in caps/shift mode
     */
    key(char) {
        // change to uppercase or alternate symbol in shift mode
        if (
            this.shiftOn ||
            this.capsOn /* && !(this.shiftOn && this.capsOn) */
        ) {
            char = Object.keys(this.symbols).includes(char)
                ? this.symbols[char]
                : char.toUpperCase();
        }
        return char;
    },

    /**
     * Adds a character to the text area
     *
     * @author Naziya Tasnim (A00447506)
     * @author Sheikh Saad Abdullah (A00447871)
     * @param {String} selection character to add to text area
     */
    addText(selection) {
        // DOM object of the text area
        let words = this.kbdFocus ? this.kbdFocus : $.el("#editbox");

        // Get the value from the id'ed field
        let currChars = words.value;

        if (selection === "del") {
            // Set the id'ed field to a shortened string
            words.value = currChars.substring(0, currChars.length - 1);
        } else {
            // Set the id'ed field to the longer string
            words.value = currChars.concat(
                pausing_punctuation.includes(selection) ||
                    this.wordBank.includes(selection)
                    ? selection + " "
                    : selection
            );

            // toggle shift key off if it's on
            if (this.shiftOn) {
                this.shiftOn = false;
            }
        }
    },

    // special keys
    sp: {
        caps: "caps",
        shift: "shift",
        delete: "delete",
        return: "return",
        space: "space",
    },

    // punctuation keys with alternative characters in shift mode
    symbols: {
        "'": '"',
        ",": ":",
        ".": "-",
        "?": "+",
        "&": "@",
        "!": "%",
        "(": "*",
        ")": "/",
    },

    // alphanumeric characters and symbols on the keyboard
    glyphs: [
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "0",
        "q",
        "w",
        "e",
        "r",
        "t",
        "y",
        "u",
        "i",
        "o",
        "p",
        "a",
        "s",
        "d",
        "f",
        "g",
        "h",
        "j",
        "k",
        "l",
        "'",
        "z",
        "x",
        "c",
        "v",
        "b",
        "n",
        "m",
        ",",
        ".",
        "?",
        "&",
        "!",
        "(",
        ")",
    ],
};
