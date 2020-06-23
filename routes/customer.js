const express = require("express");
const router = express.Router();
//const session = require("express-session");
//const cookieParser = require("cookie-parser");
//const bodyParser = require("body-parser");
const passport = require("passport"),
  Strategy = require("passport-local").Strategy;
const dbx = require("../db");
var admin = require("firebase-admin");
const { ref } = require("firebase-functions/lib/providers/database");

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
router.use(passport.initialize());
router.use(passport.session());

router.get(
  "/",
  require("connect-ensure-login").ensureLoggedIn(),
  (req, res, next) => {
    console.log(req.user);
    console.log("customer");

    res.render("cusform");
  }
);

router.post(
  "/",
  require("connect-ensure-login").ensureLoggedIn(),
  (req, res, next) => {
    console.log(req.user);
    console.log(req.body);
    console.log("customer post");

    let data = {
      name: req.body.name,
      surname: req.body.surname,
      addr1: req.body.addr1,
      addr2: req.body.addr2,
      subdist: req.body.subdistrict,
      district: req.body.district,
      province: req.body.province,
      postal: req.body.postal,
      mobile: req.body.mobile,
      tel: req.body.telephone,
      email: req.body.email,
      dealerid: req.body.dealerid,
      id: req.user.id,
      created: new Date(),
    };
    //console.log(data);
    try {
      var db = admin.firestore();
      var query = db.collection("customer");
      var result = query.add(data).then((ref) => {
        console.log("added customer : ", ref.id);
        //data.docid = ref.id;
        //console.log(data);
        res.redirect("/customer");
      });
    } catch (err) {
      console.log(err);
    }
  }
);

router.get(
  "/cuslist",
  require("connect-ensure-login").ensureLoggedIn(),
  (req, res, next) => {
    console.log(req.user);
    try {
      var db = admin.firestore();
      var orderRef = db.collection("customer").where("id", "==", req.user.id);
      var getDoc = orderRef
        .get()
        .then((snapshot) => {
          if (snapshot.empty) {
            console.log("ไม่มีข้อมูล");
            res.redirect("/customer");
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
            var createddate = formattedDate;
            console.log(doc.id, "=>", createddate);
            //console.log(doc.data().name);
          });
          var tagline = "yahoo";
          res.render("custlist", { datalist: snapshot });
        })
        .catch((err) => {
          console.log("ผิดพลาด ", err);
        });
    } catch (err) {
      console.log(err);
    }
  }
);

router.get(
  "/detail/:docid",
  require("connect-ensure-login").ensureLoggedIn(),
  (req, res, next) => {
    console.log(req.user);
    try {
      var db = admin.firestore();
      var orderRef = db.collection("customer").doc(req.params.docid);
      var getDoc = orderRef.get().then((doc) => {
        if (!doc.exists) {
          console.log("no document");
        } else {
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
          var datac = doc.data();
          var createddate = formattedDate;
          console.log(doc.id, "=>", createddate);
          console.log(datac);
          res.render("custdetail", { detailist: datac , date: createddate, docid: doc.id });
          //res.send("customer detail");
        }
      });
    } catch (err) {
      console.log(err);
    }
  }
);

module.exports = router;
