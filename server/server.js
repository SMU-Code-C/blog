// @ts-nocheck
/**
 * Contains functions to handle the behavior of phase-3 of the project
 * to POST data to the server and GET data from the server.
 *
 * Data is stored to and retrieved from MongoDB.
 *
 * [server-side script]
 *
 * @author Mohak Shrivastava (A00445470)
 * @author Sheikh Saad Abdullah (A00447871)
 */

// ----------------------- Express Setup --------------------------

"use strict";
const express = require("express"), // start express application
    server = express(), // define top level function
    PORT = 49149, // port to listen for connections on
    mongodb = require("mongodb").MongoClient; // load mongodb DBMS

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

const endpoints = ["/wordbank", "/publish", "/content", "/blog"]; // list of endpoints

// -------------------------- GET ---------------------------------

// listen to GET requests to endpoints and send data to client
server.get(endpoints[0], getAdmin);
server.get(endpoints[1], getAdmin);
server.get(endpoints[2] + "/:index", getAdmin);
server.get(endpoints[3] + "/:index", getVisitor);

/**
 * Send blog data to CMS admin panel
 *
 * @author Mohak Shrivastava (A00445470)
 * @author Sheikh Saad Abdullah (A00447871)
 * @param {Request} req request received
 * @param {Response} res response to send
 * @returns response status and data
 */
function getAdmin(req, res) {
    reqNotify("GET", req.url);
    const queryKey = baseURL(req.url);
    db.findOne({ key: queryKey }, (err, record) => {
        if (!err) {
            if (queryKey === baseURL(endpoints[2])) {
                return res
                    .status(200)
                    .send({ data: record.value[getIndex(req)] });
            } else {
                return res.status(200).send({ data: record.value });
            }
        } else throw err;
    });
}

/**
 * Send blog content for visitors (only if published)
 *
 * @author Mohak Shrivastava (A00445470)
 * @author Sheikh Saad Abdullah (A00447871)
 * @param {Request} req request received
 * @param {Response} res response to send
 * @returns response status and data
 */
function getVisitor(req, res) {
    reqNotify("GET", req.url);
    const index = getIndex(req);
    db.findOne({ key: baseURL(endpoints[1]) }, (err, publishStates) => {
        if (!err) {
            if (publishStates.value[index]) {
                db.findOne({ key: baseURL(endpoints[2]) }, (err, record) => {
                    if (!err) {
                        return res.status(200).send({
                            data: toParagraphs(record.value[index]),
                        });
                    } else throw err;
                });
            } else {
                return res.status(200).send({
                    data: toParagraphs(
                        "Sorry. This blog is currently unavailable."
                    ),
                });
            }
        } else throw err;
    });
}

// -------------------------- POST --------------------------------

// listen to POST requests to endpoints and save received data to database
server.post(endpoints[0], postUpdate);
server.post(endpoints[1] + "/:index", postUpdate);
server.post(endpoints[2] + "/:index", postUpdate);

/**
 * Update database records with data received
 *
 * @author Mohak Shrivastava (A00445470)
 * @author Sheikh Saad Abdullah (A00447871)
 * @param {Request} req request received
 * @param {Response} res response to send
 * @returns response status and data
 */
function postUpdate(req, res) {
    reqNotify("POST", req.url);
    const queryKey = baseURL(req.url);
    db.updateOne(
        { key: queryKey },
        {
            $set:
                queryKey === baseURL(endpoints[0])
                    ? { value: req.body.data ?? [] }
                    : {
                          [`value.${getIndex(req)}`]:
                              queryKey === baseURL(endpoints[1])
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

/**
 * Split given text into paragraphs with line breaks
 *
 * @author Sheikh Saad Abdullah (A00447871)
 * @param {String} text text to convert
 * @returns text split into HTML paragraphs
 */
function toParagraphs(text) {
    return text
        ? `<p>${text.replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br />")}</p>`
        : "No content.";
}

/**
 * Get index of endpoint where request was received
 *
 * @author Sheikh Saad Abdullah (A00447871)
 * @param {Request} req request object received
 * @returns index of endpoint
 */
function getIndex(req) {
    return parseInt(req.params.index) - 1;
}

/**
 * Get base of endpoint from given request
 *
 * @author Sheikh Saad Abdullah (A00447871)
 * @param {String} url endpoint where request was received
 * @returns base of endpoint where request was received
 */
function baseURL(url) {
    return url.split("/").filter((x) => x)[0];
}

/**
 * Log the handling of requests
 *
 * @author Sheikh Saad Abdullah (A00447871)
 * @param {String} type request being handled
 * @param {String} url URL where request was received
 */
function reqNotify(type, url) {
    console.log(`${type} request received at ${url}`);
}

/**
 * Log the ports being connected to and by which modules
 *
 * @author Sheikh Saad Abdullah (A00447871)
 * @param {String} initiator the caller
 * @param {Number} port connection port
 */
function listenMsg(initiator, port) {
    console.log(`${initiator}: Listening on port ${port}`);
}
