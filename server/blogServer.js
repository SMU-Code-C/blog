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

const blogs = { published: [false, false, false], contents: ["", "", ""] }, // list of blog posts being tracked
    endpoints = { publish: "/publish", content: "/blogPost" }; // list of endpoints

// -------------------------- GET ---------------------------------

// listen to GET requests to endpoint and invoke the callback function
server.get(endpoints.publish, (req, res) => {
    console.log(`Request received at ${req.url}`);
    return res.status(200).send({ data: blogs.published });
});

for (let i = 0; i < blogs.contents.length; i++) {
    server.get(`${endpoints.content}-${i + 1}`, (req, res) => {
        console.log(`Request received at ${req.url}`);
        return res.status(200).send({ data: blogs.contents[i] });
    });
}

// -------------------------- POST --------------------------------

// listen to POST requests to endpoint and invoke the callback function
for (const endpoint in Object.values(endpoints)) {
    server.post(endpoint, (req, res) => {
        blogs[req.body.data.key][req.body.id] = req.body.data.value; // save data received to contents array
        return res.status(200).send("Data received.");
    });
}
