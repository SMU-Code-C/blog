// @ts-nocheck
/**
 * Script to control the functionality
 * of the Blog interface for viewers
 *
 * CSCI-2356 Project: Phase 3
 *
 * @author Nayem Imtiaz (A00448982)
 * @author Naziya Tasnim (A00447506)
 * @author Sheikh Saad Abdullah (A00447871)
 */

// global data (general-purpose)
const PORT = 49149, // port to connect to server on
    SERVER_IPA = "http://140.184.230.209", // ip address of the UGDEV server
    SERVER_URL = `${SERVER_IPA}:${PORT}`; // complete URL of the server

const staticData = {
    content: "Disconnected from server.",

    load(blogNum) {
        $.get(SERVER_URL + "/blog/" + blogNum, (res) => {
            this.content = res.data;
        }).fail((err) => {
            console.log(err);
        });
    },
};
