/**
 * Contains functions to handle the behavior of phase-3 of the project
 * to POST data to the server and GET data from the server.
 *
 * [server-side script]
 *
 * @author Sheikh Saad Abdullah (A00447871)
 */

// ----------------------- Express Setup --------------------------

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
    databaseName = `${user}`,
    collectionName = "blogDB",
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
    listenMsg("EXPRESS", PORT); // listen for incoming connections
});

// ----------------------- MongoDB Setup --------------------------

// Used within functions (which are not present in this file).
// The global scope simplifies the implementation of callbacks.
// That's why we are using a global variable here.
let db;

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
    const database = client.db(databaseName);
    db = database.collection(collectionName);

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
        listenMsg("MONGO", serverside.address().port);
    });
});

// ----------------------- Global data ----------------------------

const wordBank = { endpoint: "/wordbank" }, // words saved for convenience
    visitor = {
        endpoint: "/blog",
        defaultText: "Sorry. This blog is currently unavailable.",
    }, // for visitors to the blog site
    endpoints = ["/publish", "/content"]; // list of endpoints

// -------------------------- GET ---------------------------------

server.get(wordBank.endpoint, getAdmin);
server.get(endpoints[0], getAdmin);
server.get(endpoints[1] + "/:index", getAdmin);
server.get(visitor.endpoint + "/:index", getContent);

// send blog data to CMS admin panel
function getAdmin(req, res) {
    reqNotify("GET", req.url);
    const queryKey = getURL(req);
    db.findOne({ key: queryKey }, (err, record) => {
        if (!err) {
            if (queryKey === endpoints[1].substring(1)) {
                return res
                    .status(200)
                    .send({ data: record.value[getIndex(req)] });
            } else {
                return res.status(200).send({ data: record.value });
            }
        } else throw err;
    });
}

// send blog content for visitors (only if published)
function getContent(req, res) {
    reqNotify("GET", req.url);
    const index = getIndex(req);
    db.findOne({ key: endpoints[0].substring(1) }, (err, publishStates) => {
        if (!err && publishStates.value[index]) {
            db.findOne({ key: endpoints[1].substring(1) }, (err, content) => {
                if (!err) {
                    return res
                        .status(200)
                        .send({ data: toParagraphs(content.value[index]) });
                } else throw err;
            });
        } else throw err;
    });
}

// -------------------------- POST --------------------------------

// listen to POST requests to endpoints and save data to database
server.post(`${endpoints[0]}/:index`, postUpdate);
server.post(`${endpoints[1]}/:index`, postUpdate);
server.post(wordBank.endpoint, postWords);

// update word bank array
function postWords(req, res) {
    reqNotify("POST", req.url);
    const queryKey = getURL(req);
    db.updateOne(
        { key: queryKey },
        { $set: { value: req.body.data || [] } },
        (err, mods, status) => {
            if (err) throw err;
        }
    );
    return res.status(200).send("Data received by server.");
}

// update publish state or blog content
function postUpdate(req, res) {
    reqNotify("POST", req.url);
    const queryKey = getURL(req);
    db.updateOne(
        { key: queryKey },
        {
            $set: {
                [`value.${getIndex(req)}`]:
                    queryKey === endpoints[0].substring(1)
                        ? req.body.data === "true"
                        : req.body.data,
            },
        },
        (err, mods, status) => {
            if (err) throw err;
        }
    );
    return res.status(200).send("Data received by server.");
}

// ------------------------- Helpers ------------------------------

function toParagraphs(text) {
    return text
        ? `<p>${text.replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br />")}</p>`
        : "No content.";
}

function getIndex(req) {
    return parseInt(req.params.index) - 1;
}

function getURL(req) {
    return req.url.split("/").filter((x) => x)[0];
}

function reqNotify(type, url) {
    console.log(`${type} request received at ${url}`);
}

function listenMsg(initiator, port) {
    console.log(`${initiator}: Listening on port ${port}`);
}
