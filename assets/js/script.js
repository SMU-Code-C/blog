/**
 * Script to control the functionality of the Blog tool
 *
 * CSCI-2356 Project: Phase 1
 *
 * @author Mohak Shrivastava (A00445470)
 * @author Nayem Imtiaz (A00448982)
 * @author Naziya Tasnim (A00447506)
 * @author Sheikh Saad Abdullah (A00447871)
 */

// global data (general-purpose)
const PORT = 49149, // port to connect to server on
    SERVER_IPA = "http://140.184.230.209", // ip address of the UGDEV server
    SERVER_URL = `${SERVER_IPA}:${PORT}`, // complete URL of the server
    endpoints = { publish: "/publish", content: "/blogPost" }, // list of endpoints
    pausing_punctuation = ",;:.?!"; // punctuation symbols to put spaces after

/**
 * Aliases to create DOM objects using $() like in JQuery
 *
 * @author Sheikh Saad Abdullah (A00447871)
 * @param {String} selector selector for the element
 * @returns DOM Object for specified element
 */
const $_ = (selector) => {
    return selector[0] === "#"
        ? document.querySelector(selector)
        : document.querySelectorAll(selector);
};

// global data store for Alpine.js
const staticData = {
    /** ---------------------------- Blog List ----------------------------
     * Database to store the list of blogs and publication states
     *
     * @author Mohak Shrivastava (A00445470)
     * @author Sheikh Saad Abdullah (A00447871)
     * -------------------------------------------------------------------- */

    blogList: [
        { id: 1, published: false },
        { id: 2, published: false },
        { id: 3, published: false },
    ],

    publish(elem, index) {
        $.post(
            SERVER_URL + `/publish-${index}`,
            { data: elem.checked },
            (res) => console.log(res)
        ).fail((err) => console.log(err));
    },

    /**
     * Enable or disable the editing of a blog post
     *
     * @author Mohak Shrivastava (A00445470)
     * @param {Object} elem DOM object of the switched edit toggle
     * @param {Integer} index index of the toggle switch
     */
    editText(elem, index) {
        $_(".bl-name")[index].disabled = this.editOn;

        if (this.editOn) {
            this.kbdFocus = $_("#editbox");
        }

        this.editOn = !this.editOn;
        this.currentlyEditing = index;

        this.cancel();

        $_(".bl-edit").forEach((el) => {
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
        $.post(
            SERVER_URL + `/content-${this.currentlyEditing}`,
            { data: $_("#editbox").value },
            (res) => console.log(res)
        ).fail((err) => console.log(err));
    },

    /**
     * Get the blog post content from the database
     *
     * @author Nayem Imtiaz (A00448982)
     * @author Sheikh Saad Abdullah (A00447871)
     * @returns string to populate text area with
     */
    cancel() {
        $.get(SERVER_URL + `/content-${this.currentlyEditing}`, (res) => {
            // set values to each input field from data received
            $_("#editbox").value = res.data;
        }).fail((err) => {
            console.log(err);
        });
    },

    /**
     * Remove the last word from the text area
     *
     * @author Sheikh Saad Abdullah (A00447871)
     */
    undo() {
        const editbox = $_("#editbox");
        editbox.value =
            editbox.value.substring(0, editbox.value.lastIndexOf(" ")) + " ";
    },

    /**
     * Get all blogs from the database and populates a local list
     *
     * @author Sheikh Saad Abdullah (A00447871)
     * @returns string to populate text area with
     */
    load() {
        $.get(SERVER_URL + "/publish", (res) => {
            // set values to each input field from data received
            res.data.forEach((el, i) => {
                this.blogList[i].published = el;
            });
        }).fail((err) => console.log(err));
    },

    closeEdit() {
        $_(`#bl-edit-${this.currentlyEditing + 1}`).dispatchEvent(
            new Event("change")
        );
    },

    /** ----------------------------- Keyboard ----------------------------
     * Variables and functions to control behaviour of the Keyboard
     *
     * @author Naziya Tasnim (A00447506)
     * -------------------------------------------------------------------- */

    kbdFocus: null, // text field to focus
    capsOn: false, // state of the caps key
    shiftOn: false, // state of the shift key
    deleteOn: false,
    wordBank: [], // array to store saved words

    saveWord() {
        let wb = $_("#wb");
        if (wb.value && !this.wordBank.includes(wb.value)) {
            this.wordBank.push(wb.value);
        }
        wb.value = "";
    },

    putWord(word) {
        if (this.deleteOn) {
            this.wordBank.splice(this.wordBank.indexOf(word), 1);
        } else {
            this.kbdFocus = $_("#editbox");
            this.addText(word);
        }
    },

    /**
     * Character of the key pressed
     *
     * @param {String} char character or string to convert
     * @returns uppercase of char if keyboard is in caps/shift mode
     */
    key(char) {
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
     * @param {String} selection character to add to text area
     */
    addText(selection) {
        // DOM object of the text area
        let words = this.kbdFocus ? this.kbdFocus : $_("#editbox");

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

    // alphanumeric and punctuation keys
    symbols: {
        "'": '"',
        ",": ":",
        ".": "-",
        "?": "+",
        "!": "%",
        "(": "*",
        ")": "/",
        "&": "@",
    },

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
