const express = require("express");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;
const root = __dirname;

app.use(
  express.static(root, {
    index: "index.html",
    extensions: ["html"],
    etag: true,
    fallthrough: true,
  })
);

app.get("/", (_req, res) => {
  res.sendFile(path.join(root, "index.html"));
});

app.listen(port, () => {
  console.log(`The server is running on http://localhost:${port}`);
});
