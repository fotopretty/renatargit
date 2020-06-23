const express = require("express");
const router = express.Router();
//const bodyParser = require("body-parser");
const middleWare = require("./middleware");
const jwt = require("jwt-simple");
const passport = require("passport");
//ใช้ในการ decode jwt ออกมา
const ExtractJwt = require("passport-jwt").ExtractJwt;
//ใช้ในการประกาศ Strategy
const JwtStrategy = require("passport-jwt").Strategy;

const SECRET = "fotopretty";

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromHeader("authorization"),
  secretOrKey: SECRET, //SECRETเดียวกับตอนencodeในกรณีนี้คือ MY_SECRET_KEY
};

const jwtAuth = new JwtStrategy(jwtOptions, (payload, done) => {
  if (payload.sub === "voravit") done(null, true);
  else done(null, false);
});
passport.use(jwtAuth);

const requireJWTAuth = passport.authenticate("jwt", { session: false });

//router.use(bodyParser.urlencoded({extended: true}));
//router.use(bodyParser.json());

var sess = { user: "voravit" };
var title = "Easy Order by ชาติณัชสิทธิ์ วงษ์นาคเพ็ชร";

router.get("/", requireJWTAuth, (req, res, next) => {
  console.log("index");
  //res.redirect("/login", { user: req.session.user });
  res.render("index", { name: "who" });
});

router.get("/login", (req, res, next) => {
  res.render("login", { title: title, message: "*** โปรดกรอก" });
});

router.post("/login", middleWare.login, (req, res, next) => {
  const payload = {
    sub: req.body.username,
    name: "voravit euavatanakorn",
    iat: new Date().getTime(),
  };
  let auth = jwt.encode(payload, SECRET);
  //console.log(auth);
  //const SECRET = "fotopretty";
  res.header("Authorization", auth);
  res.redirect("/");
});

router.get("/register", (req, res) => {
  console.log("register");
  res.send("register");
});

router.get("/home", (req, res) => {
  sess = req.session;
  console.log(sess);

  res.send("home page");
});

router.get("/session", (req, res) => {
  sess = req.session;
  console.log(sess);
  res.send("ed");
});

module.exports = router;
