/**
 * Contains functions to handle the behavior of phase-2 of the project
 * to POST data to the server and GET data from the server.
 *
 * [server-side script]
 *
 * @author Sheikh Saad Abdullah (A00447871)
 */

// ----------------------- Server Setup ---------------------------

"use strict";
const express = require("express"), // start express application
    server = express(), // define top level function
    PORT = 49149, // port to listen for connections on
    mongodb = require("mongodb").MongoClient; // load mongodb DBMS

// credential string elements
const head = "mongodb://",
    user = "s_saad",
    password = encodeURIComponent("A00447871"),
    localHost = "127.0.0.1",
    localPort = 27017,
    extPort = 49151, // external port
    database = user.toString(),
    connectionString =
        head +
        user +
        ":" +
        password +
        "@" +
        localHost +
        ":" +
        localPort +
        "/" +
        user;

server.use(express.json()); // implement JSON recognition
server.use(express.urlencoded({ extended: true })); // implement incoming key:value pairs to be any type
server.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); // allow any origin
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE"); // allow any method
    res.header("Access-Control-Allow-Headers", "Content-Type"); // accept only headers with this type
    next(); // middleware callback function required for processing
}); // implement allowable domain characteristics
server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`); // listen for incoming connections
});

// Used within functions (which are not present in this file).
// The global scope simplifies the implementation of callbacks.
// That's why we are using a global variable here.
let globalDB;

// ---------------------- Global data -----------------------------

const NUM_BLOGS = 3,
    blogs = {
        publish: Array(NUM_BLOGS).fill(false),
        content: Array(NUM_BLOGS).fill(""),
    }, // list of blog posts being tracked
    wordBank = { endpoint: "/wordbank", words: [] }, // words saved for convenience
    endpoints = ["/publish", "/content"]; // list of endpoints

// -------------------------- GET ---------------------------------

// send published states for the blogs
server.get(endpoints[0], (req, res) => {
    console.log(`GET request received at ${req.url}`);
    return res.status(200).send({ data: blogs.publish });
});

// send blog content
for (let i = 0; i < NUM_BLOGS; i++) {
    // admin access
    server.get(`${endpoints[1]}${i + 1}`, (req, res) => {
        console.log(`GET request received at ${req.url}`);
        return res.status(200).send({ data: blogs.content[i] });
    });

    // visitor access (only if blog is published)
    server.get(`/blog${i + 1}`, (req, res) => {
        console.log(`GET request received at ${req.url}`);
        return res.status(200).send({
            data:
                blogs.publish[i] === "true"
                    ? toParagraphs(blogs.content[i])
                    : "Sorry. This blog is currently not available.",
        });
    });
}

// send word bank words to client
server.get(wordBank.endpoint, (req, res) => {
    console.log(`GET request received at ${req.url}`);
    return res.status(200).send({ data: wordBank.words });
});

// -------------------------- POST --------------------------------

// listen to POST requests to endpoints and save data to database
endpoints.forEach((endpoint) => {
    for (let i = 0; i < NUM_BLOGS; i++) {
        server.post(`${endpoint}${i + 1}`, (req, res) => {
            console.log(`POST request received at ${req.url}`);
            blogs[endpoint.substring(1)][i] = req.body.data; // save data received array
            return res.status(200).send("Data received by server.");
        });
    }
});

// save word bank words received via POST request
server.post(wordBank.endpoint, (req, res) => {
    console.log(`POST request received at ${req.url}`);
    wordBank.words = req.body.data;
    return res.status(200).send("Data received by server.");
});

// ------------------------- Helpers ------------------------------

function toParagraphs(text) {
    let paragraphs = text.split("\n\n");
    paragraphs.forEach((elem, index) => {
        if (elem) {
            paragraphs[index] = `<p>${elem}</p>`;
        }
    });
    return paragraphs.join("");
}

// ------------------------ DATABASE ------------------------------

// Create the connection to a mongoDB database instance
//
// Parameter 1: see connectionString above
// Parameter 2: Anonymous callback function that either:
//                (1) throws an error, or
//                (2) continues regular processing
mongodb.connect(connectionString, (error, client) => {
    if (error) {
        throw error;
    }

    // This version of mongodb returns a client object
    // which contains the database object
    globalDB = client.db(database);

    // "process" is an already available global variable with information
    // about this particular Node.js application.
    //
    // If the SIGTERM event occurs, use the anonymous function to
    // close the database and server in a controlled way.
    process.on("SIGTERM", () => {
        console.log("Shutting server down.");
        client.close();
        server.close();
    });

    // Start server listening on specified port
    let serverside = server.listen(extPort, () => {
        console.log(`Listening on port ${serverside.address().port}`);
    });
});
