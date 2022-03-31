/**
 * MongoDB server configuration
 *
 * @author Sheikh Saad Abdullah (A00447871)
 */

"use strict";
const express = require("express"), // load express framework
    mongodb = require("mongodb").MongoClient; // load mongodb DBMS

// credential string elements
const head = "mongodb://",
    user = "s_saad",
    password = encodeURIComponent("bookIDEAincrease10"),
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

//CORS Middleware, causes Express to
//allow Cross-Origin Resource Sharing requests
const server = express();
server.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
});

// Used within functions (which are not present in this file).
// The global scope simplifies the implementation of callbacks.
// That's why we are using a global variable here.
let globalDB;

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
