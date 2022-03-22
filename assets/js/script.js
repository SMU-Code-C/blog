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
const PORT = 49151, // port to connect to server on
    SERVER_IPA = "http://140.184.230.209", // ip address of the UGDEV server
    SERVER_URL = `${SERVER_IPA}:${PORT}`, // complete URL of the server
    endpoints = { publish: "/publish", contentUpdate: "/blogPost" }, // list of endpoints
    stopping_punctuation = ",;:.?!"; // punctuation symbols to put spaces after

/**
 * Aliases to create DOM objects using $() like in JQuery
 *
 * @author Sheikh Saad Abdullah (A00447871)
 * @param {String} selector selector for the element
 * @returns DOM Object for specified element
 */
const $ = (selector) => {
    return selector[0] === "#"
        ? document.querySelector(selector)
        : document.querySelectorAll(selector);
};

/**
 * Wrapper function around the fetch API to make GET requests
 *
 * @author Sheikh Saad Abdullah (A00447871)
 * @param {String} endpoint address to send request to
 * @returns response from the server
 */
$.get = (endpoint) => {
    let response = null;
    fetch(endpoint, {
        method: "GET",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
    })
        .then((res) => {
            response = res.json();
        })
        .catch((err) => {
            console.log(err);
        });
    return response;
};

/**
 * Wrapper function around the fetch API to make POST requests
 *
 * @author Sheikh Saad Abdullah (A00447871)
 * @param {String} endpoint address to send request to
 * @param {Object} data data to send to the server
 * @returns response from the server
 */
$.post = (endpoint, data) => {
    let response = null;
    fetch(endpoint, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    })
        .then((res) => {
            response = res.json();
        })
        .catch((err) => {
            console.log(err);
        });
    return response;
};

// global data store for Alpine.js
const staticData = {
    /** ---------------------------- Blog List ----------------------------
     * Database to store the list of blogs and publication states
     *
     * @author Sheikh Saad Abdullah (A00447871)
     * -------------------------------------------------------------------- */

    blogList: [
        { name: "Blog 1", content: "", published: false },
        { name: "Blog 2", content: "", published: false },
        { name: "Blog 3", content: "", published: false },
    ],

    /** ---------------------------- Edit Group ---------------------------
     * Variables and functions to control the behaviour
     * of the group of toggle switches and list of blog posts displayed
     *
     * @author Mohak Shrivastava (A00445470)
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
        if (typeof Storage !== "undefined") {
            localStorage.setItem(
                `blog${this.currentlyEditing}`,
                $("#editbox").value
            );
        } else {
            console.error("Local storage unavailable.");
        }
    },

    /**
     * Get the blog post content from the database
     *
     * @author Nayem Imtiaz (A00448982)
     * @author Sheikh Saad Abdullah (A00447871)
     * @returns string to populate text area with
     */
    cancel() {
        $("#editbox").value = localStorage.getItem(
            `blog${this.currentlyEditing}`
        );
    },

    /**
     * Remove the last word from the text area
     *
     * @author Sheikh Saad Abdullah (A00447871)
     */
    undo() {
        const editbox = $("#editbox");
        editbox.value =
            editbox.value.substring(0, editbox.value.trim().lastIndexOf(" ")) +
            " ";
    },

    /**
     * Get all blogs from the database and populates a local list
     *
     * @author Sheikh Saad Abdullah (A00447871)
     * @returns string to populate text area with
     */
    load() {
        for (let i = 0; i < 3; i++) {
            this.blogList[i] = localStorage.getItem(
                `blog${this.currentlyEditing}`
            );
        }
    },

    /**
     * Populate the text area with the currently editing blog content
     *
     * @author Nayem Imtiaz (A00448982)
     * @returns string to populate text area with
     */
    getEditText() {
        return localStorage.getItem(`blog${this.currentlyEditing}`) || "";
    },

    /**
     * Enable or disable the editing of a blog post
     *
     * @author Mohak Shrivastava (A00445470)
     * @param {Object} elem DOM object of the switched edit toggle
     * @param {Integer} index index of the toggle switch
     */
    editText(elem, index) {
        $(".bl-name")[index].disabled = this.editOn;

        if (this.editOn) {
            this.kbdFocus = $("#editbox");
        }

        this.editOn = !this.editOn;
        this.currentlyEditing = index;

        $(".bl-edit").forEach((el) => {
            if (!el.checked) {
                el.style.visibility = elem.checked ? "hidden" : "visible";
            }
        });
    },

    /** ----------------------------- Keyboard ----------------------------
     * Variables and functions to control behaviour of the Keyboard
     *
     * @author Naziya Tasnim (A00447506)
     * -------------------------------------------------------------------- */

    kbdFocus: null, // text field to focus
    capsOn: false, // state of the caps key
    shiftOn: false, // state of the shift key

    /**
     * Checks whether the keyboard is currently in shift or caps mode
     *
     * @returns whether the caps or shift (but not both) keys are in effect
     */
    altKeys() {
        return (this.shiftOn || this.capsOn) && !(this.shiftOn && this.capsOn);
    },

    /**
     * Character of the key pressed
     *
     * @param {String} char character or string to convert
     * @returns uppercase of char if keyboard is in caps/shift mode
     */
    key(char) {
        return this.altKeys() ? char.toUpperCase() : char;
    },

    /**
     * Adds a character to the text area
     *
     * @author Naziya Tasnim (A00447506)
     * @param {String} selection character to add to text area
     */
    addChar(selection) {
        // DOM object of the text area
        let words = this.kbdFocus ? this.kbdFocus : $("#editbox");

        // Get the value from the id'ed field
        let currChars = words.value;

        if (selection === "del") {
            // Set the id'ed field to a shortened string
            words.value = currChars.substring(0, currChars.length - 1);
        } else {
            // Set the id'ed field to the longer string
            words.value = currChars.concat(
                stopping_punctuation.includes(selection)
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
        '"',
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
        "!",
        "(",
        ")",
    ],
};
