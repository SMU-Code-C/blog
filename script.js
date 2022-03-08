/**
 * Blog tool functionality
 *
 * @author Sheikh Saad Abdullah (A00447871)
 */

// aliases for convenience
const $ = (id) => document.querySelector(id);
const $_ = (id) => document.querySelectorAll(id);

// global data store for Alpine.js
const staticData = {
    /* ---------------------------- Blog List ---------------------------- */

    blogList: [
        { name: "Blog 1", content: "This is blog post 1", published: false },
        { name: "Blog 2", content: "This is blog post 2", published: false },
        { name: "Blog 3", content: "This is blog post 3", published: false },
    ],

    /* ---------------------------- Edit Group --------------------------- */

    editOn: false, // whether a blog is being edited
    currentlyEditing: -1, // index of the blog being edited

    /**
     * Gets the blog post content from the database
     *
     * @returns string to populate text area with
     */
    getEditText() {
        return this.currentlyEditing < 0
            ? ""
            : this.blogList[this.currentlyEditing].content;
    },

    /**
     * Enable or disable the editing of a blog post
     *
     * @param {Object} elem DOM object of the switched edit toggle
     * @param {Integer} index index of the toggle switch
     */
    editText(elem, index) {
        $_(".bl-name-text")[index].disabled = this.editOn;

        this.editOn = !this.editOn;
        this.currentlyEditing = elem.checked ? index : -1;

        $_(".bl-edit-toggle").forEach((el) => {
            if (!el.checked) {
                el.style.visibility = elem.checked ? "hidden" : "visible";
            }
        });

        this.kbdFocus = $("#editbox");
    },

    /* ----------------------------- Keyboard ---------------------------- */

    kbdFocus: null, // text field to focus
    shiftOn: false, // state of the shift key

    /**
     * Adds a character to the text area
     *
     * @param {String} selection character to add to text area
     */
    addChar(selection) {
        let words = this.kbdFocus ? this.kbdFocus : $("#editbox"); // DOM object of the text area

        // Get the value from the id'ed field
        let currChars = words.value;

        if (selection === "del") {
            // Set the id'ed field to a shortened string
            words.value = currChars.substring(0, currChars.length - 1);
        } else {
            // handle shift toggle
            if (this.shiftOn) {
                selection = selection.toUpperCase();
                this.shiftOn = !this.shiftOn;
            }
            // Set the id'ed field to the longer string
            words.value = currChars.concat(selection);
        }
    },

    // special keys
    sp: {
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
        ".",
        "?",
        ",",
    ],
};
