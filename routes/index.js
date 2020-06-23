const express = require("express");
const router = express.Router();
//const session = require("express-session");
//const bodyParser = require("body-parser");
const passport = require("passport"),
  Strategy = require("passport-local").Strategy;
const dbx = require("../db");
var admin = require("firebase-admin");
const { ref } = require("firebase-functions/lib/providers/database");

//router.use(bodyParser.urlencoded({ extended: true }));
//router.use(bodyParser.json());

passport.use(
  new Strategy(function (username, password, cb) {
    dbx.users.findByUsername(username, function (err, user) {
      if (err) {
        return cb(err);
      }
      if (!user) {
        return cb(null, false);
      }
      if (user.password != password) {
        return cb(null, false);
      }
      return cb(null, user);
    });
  })
);
//router.use(session({ secret: "mySecret" }));
router.use(passport.initialize());
router.use(passport.session());

passport.serializeUser(function (user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function (id, cb) {
  dbx.users.findById(id, function (err, user) {
    if (err) {
      return cb(err);
    }
    cb(null, user);
  });
});

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
  }),
  function (req, res) {
    res.redirect("/");
  }
);

router.get(
  "/",
  require("connect-ensure-login").ensureLoggedIn(),
  (req, res, next) => {
    //console.log("home");
    //console.log(req.user.permission);
    //res.redirect("/login", { user: req.session.user });

    try {
      var db = admin.firestore();
      var orderRef = db.collection("order").where("id", "==", req.user.id);
      var getDoc = orderRef
        .get()
        .then((snapshot) => {
          if (snapshot.empty) {
            console.log("ไม่มีข้อมูล");
            res.redirect("profile");
            return;
          }

          snapshot.forEach((doc) => {
            var dt = new Date(doc.data().created * 1000);
            var formattedDate =
              ("0" + dt.getDate()).slice(-2) +
              "/" +
              ("0" + (dt.getMonth() + 1)).slice(-2) +
              "/" +
              dt.getFullYear() +
              " " +
              ("0" + dt.getHours()).slice(-2) +
              ":" +
              ("0" + dt.getMinutes()).slice(-2);
            doc.date = formattedDate;
            console.log(doc.id, "=>", doc.date);
          });
          res.render("index", { data: snapshot });
        })
        .catch((err) => {
          console.log("ผิดพลาด ", err);
        });
    } catch (err) {
      console.log(err);
    }
  }
);

router.get("/login", (req, res, next) => {
  res.render("login");
});

router.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});

router.get(
  "/profile",
  require("connect-ensure-login").ensureLoggedIn(),
  function (req, res) {
    res.render("profile", { user: req.user });
  }
);

router.get(
  "/order",
  require("connect-ensure-login").ensureLoggedIn(),
  function (req, res) {
    try {
      var db = admin.firestore();
      var orderRef = db.collection("customer").where("id", "==", req.user.id);
      var getDoc = orderRef.get().then((snapshot) => {
        if (snapshot.empty) {
          console.log("ไม่มีข้อมูล");
          res.redirect("/");
          return;
        }
        snapshot.forEach((doc) => {
          //console.log(doc.data());
        });

        res.render("order", { user: req.user, cuslist: snapshot });
      });
    } catch (err) {
      console.log(err);
    }
  }
);

//var data;
router.post(
  "/order",
  require("connect-ensure-login").ensureLoggedIn(),
  async function (req, res) {
    let date = new Date();
    data = {
      boostburn: req.body.boostburn,
      fiberx: req.body.fiberx,
      plus: req.body.plus,
      id: req.user.id,
      customer: req.body.customer,
      created: date,
    };
    try {
      var db = admin.firestore();
      var cusid = req.body.customer;
      var customers = await db
        .collection("customer")
        .doc(cusid)
        .get()
        .then((doc) => {
          return doc;
        });
      console.log(customers.data());

      var query = db.collection("order");
      var result = query.add(data).then((ref) => {
        console.log("added Order : ", ref.id);
        refid = ref.id;

        //console.log(cusid);
        //data.docid = 100;
        //return req;

        //var datac = ref.data();
        res.render("orderlist", {
          datas: data,
          custname: customers,
          docref: refid,
        });
      });
    } catch (err) {
      console.log(err);
    }
  }
  //res.send("post order");
);

/* async function orderAdd(req) {
  try {
    var db = admin.firestore();
    var query = db.collection("order");
    var result = await query.add(req).then((ref) => {
      console.log("added Order : ", ref.id);
      req.docid = ref.id;
      //console.log(docid);
      req.docid = 100;
      //return req;
    });
  } catch (err) {
    console.log(err);
  }

  return result;
}
 */
function customerFind(cusid) {
  console.log(cusid);
  var db = admin.firestore();
  var orderRef = db.collection("customer").doc(cusid);
  //var result = orderRef.get().then((doc) => {
  return orderRef.get().then((doc) => {
    if (!doc.exists) {
      console.log("no document");
    } else {
      var datac = doc.data();
      //console.log(datac);
      //return datac;
    }
  });
}

module.exports = router;
