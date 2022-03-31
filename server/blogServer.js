/**
 * Contains functions to handle the behavior of A2.html
 * to POST data to the server and GET data from the server.
 *
 * [server-side script]
 *
 * @author Sheikh Saad Abdullah (A00447871)
 */

// ----------------------- Server Setup ---------------------------

const express = require("express"), // start express application
    server = express(), // define top level function
    PORT = 49149; // port to listen for connections on

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

// ---------------------- Global data -----------------------------

const NUM_BLOGS = 3,
    blogs = {
        publish: Array(NUM_BLOGS).fill(false),
        content: Array(NUM_BLOGS).fill(""),
    }, // list of blog posts being tracked
    endpoints = ["/publish", "/content"]; // list of endpoints

// -------------------------- GET ---------------------------------

// listen to GET requests to endpoint and invoke the callback function
server.get(endpoints[0], (req, res) => {
    console.log(`GET request received at ${req.url}`);
    return res.status(200).send({ data: blogs.publish });
});

for (let i = 0; i < NUM_BLOGS; i++) {
    server.get(`${endpoints[1]}-${i}`, (req, res) => {
        console.log(`GET request received at ${req.url}`);
        return res.status(200).send({ data: blogs.content[i] });
    });
}

// -------------------------- POST --------------------------------

// listen to POST requests to endpoint and invoke the callback function
endpoints.forEach((endpoint) => {
    for (let i = 0; i < NUM_BLOGS; i++) {
        server.post(`${endpoint}-${i}`, (req, res) => {
            console.log(`POST request received at ${req.url}`);
            blogs[endpoint.substring(1)][i] = req.body.data; // save data received array
            return res.status(200).send("Data received.");
        });
    }
});
