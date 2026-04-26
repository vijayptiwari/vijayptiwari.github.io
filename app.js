const express = require("express"),
    path = require("path"),
    bodyParser = require("body-parser"),
    app = express();

const port = process.env.PORT || 3000;

app.use(
    bodyParser.urlencoded({
        extended: false
    })
);
app.use(bodyParser.json());

app.use(express.static(path.resolve(__dirname)));

app.get("/", function(req, res) {
    res.sendFile(path.join(__dirname, "index.html"));
});

const server = app.listen(port, function () {
    console.log("The server is running on http://localhost:" + port);
});
