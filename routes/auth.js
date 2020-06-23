var express = require("express");
var router = express.Router();
var admin = require("firebase-admin");
const session = require("express-session");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
var users = [];

router.post("/register",  (req, res) => {
  console.log(req.body);
  res.redirect("/");
});

router.post("/logins", async (req, res) => {
  const user = users.find((user) => (user.name = req.body.username));
  console.log(user);
  if (user == null) {
    return res.status(400).send("ผู้ใช้ไม่ถูกต้อง");
  }
  try {
    if (await bcrypt.compare(req.body.password, user.password)) {
      res.send("เข้าระบบสำเร็จ");
    } else {
      res.send("ไม่อนุญาติให้เข้าระบบ");
    }
  } catch {
    res.status(500).send();
  }
});

router.post("/login", async (req, res) => {
  try {
    //const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    //console.log(salt);
    console.log(hashedPassword);

    var db = admin.firestore();
    //console.log(req.body);
    console.log("LOGIN POST");
    let { username, password } = req.body;
    //console.log(username);
    //console.log(password);
    if (username && password) {
      let userRef = db.collection("users");
      userRef
        .where("username", "==", username)
        .where("password", "==", password)
        .get()
        .then((snapshot) => {
          if (snapshot.empty) {
            console.log("No user macth.");
            res.render("login", {
              title: "Login",
              message: "ชื่อผู้ใช้ หรือ รหัสผ่าน ไม่ถูกต้อง",
            });
          }
          snapshot.forEach((doc) => {
            //console.log(doc.id, "=>", doc.data());
            //let username = doc.data().username;
            //let password = doc.data().password;
            const user = { name: username, password: hashedPassword };
            users.push(user);
            console.log(user);
            res.send("หน้า authen");
            //hash('userid')
          });
        })
        .catch((err) => {
          console.log("Error getting document", err);
        });
    } else {
      res.render("login", {
        title: "Login",
        message: "ชื่อผู้ใช้ หรือ รหัสผ่าน ไม่ถูกต้อง",
      });
    }
  } catch {
    res.status(500).send();
  }
  //res.redirect("/");
});

module.exports = router;
