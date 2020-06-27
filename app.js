"use strict";
const express = require("express");
const app = express();
const session = require("express-session");
const cookieParser = require("cookie-parser");
const routes = require("./routes/index");
const customer = require("./routes/customer");
const bodyParser = require("body-parser");
const favicon = require("serve-favicon");
const admin = require("firebase-admin");



//const { Firestore } = require("@google-cloud/firestore");
//const { FirestoreStore } = require("@google-cloud/connect-firestore");
//const session = require("express-session");

/* admin.initializeApp({
  credential: admin.credential.applicationDefault(),
}); */

var serviceAccount = require("./smtp-272606-firebase-adminsdk-8875v-8952f9132a.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://smtp-272606.firebaseio.com",
});

var db = admin.firestore();

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use(bodyParser.urlencoded({ extended: true }));
// Set Parses JSON
app.use(express.json());
app.use(cookieParser());

app.use(session({ secret: "mySecret" }));
app.use(favicon(__dirname + "/favicon.ico"));
app.use("/js", express.static("js"));
app.use("/json", express.static("json"));
app.use("/image", express.static("image"));
app.use("/css", express.static("css"));
app.use("/scss", express.static("scss"));
app.use("/profile", express.static("profile"));

//app.use(cookieParser());
app.use("/customer", customer);
app.use("/", routes);
//app.use(router);

// Error Handler
app.use((err, req, res, next) => {
  let statusCode = err.status || 500;
  res.status(statusCode);
  res.json({
    error: {
      status: statusCode,
      message: err.message,
    },
  });
});

app.use(require("morgan")("combined"));




const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}...`);
});
module.exports = app;
//module.exports.middleware = middleware;
