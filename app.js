const https = require("https");
const bodyParser = require("body-parser");
const express = require("express");
const { response } = require("express");

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

var port = 3000;

// Respond to GET requests
app.get("/", function(req, res) {
    res.sendFile(__dirname + "/signup.html");
});

// Respond to POST requests
app.post("/", function(req, res, next) {
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;
    console.log(firstName + " " + lastName + " " + email);

    const data = {
        members: [
            {
                email_address: email,
                status: "subscribed",
                merge_fields: {
                    FNAME: firstName,
                    LNAME: lastName,
                }
            }
        ]
    }
    const jsonData = JSON.stringify(data);

    const listID = "2a631b39d6";
    const dc = "us7";
    const url = "https://" + dc + ".api.mailchimp.com/3.0/lists/" + listID + "?";
    const apiKey = "b7561f9af9362f599bd41f596909f987-us7";
    const authValue = "anystring:" + apiKey;
    const options = {
        method: "POST",
        auth: authValue
    }

    const request = https.request(url, options, function(mailchimpRes) {
        var statusCode = mailchimpRes.statusCode;
        console.log("status code: " + statusCode);
        if (checkStatusCode(statusCode)) {
            // Note: res is the response to the user; mailchimRes is response to your server since it acts as the client in that scenario
            res.sendFile(__dirname + "/success.html");
        } else {
            res.sendFile(__dirname + "/failure.html");
        }

        mailchimpRes.on("data", function(data) {
            console.log(JSON.parse(data));
        });
    });
    request.write(jsonData);
    request.end();
});

app.post("/failure", function(req, res, next) {
    res.redirect("/");
});

// Setup server to listen to ports
app.listen(process.env.PORT || port, function() {
    console.log("Server listening on localhost:" + port);
});

// Functions
function checkStatusCode(code) {
    switch (String(code).charAt(0)) {
        case "2":
            return true
        case "4":
            return false;
        default:
            return false;
    }
}