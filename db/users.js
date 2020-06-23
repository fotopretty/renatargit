var admin = require("firebase-admin");

var records = [
  {
    id: 1,
    username: "voravit",
    password: "canon50d",
    //displayName: "Jack",
    //emails: [{ value: "jack@example.com", age: 50 }],
    //permission: 1,
    //image: "0001.jpg",
  },
  {
    id: 2,
    username: "ton",
    password: "ton",
    displayName: "ชาติณัชสิทธิ์ วงษ์นาคเพ็ชร",
    emails: [{ value: "prettymcthailand@gmail.com" }],
    permission: 2,
    image: "0002.jpg",
  },
];

exports.findById = function (id, cb) {
  process.nextTick(function () {
    /*     var idx = id - 1;
    if (records[idx]) {
      cb(null, records[idx]);
    } else {
      cb(new Error("User " + id + " does not exist"));
    } */
    //console.log(id);
    var db = admin.firestore();
    let userRef = db.collection("users");
    userRef
      .where("id", "==", id)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          if (doc.data().id) {
            let users = doc.data();
            cb(null, users);
          } else {
            cb(new Error("User " + id + " does not exist"));
          }
        });
      });
  });
};

exports.findByUsername = function (username, cb) {
  process.nextTick(function () {
    var db = admin.firestore();
    //var user = {};
    let userRef = db.collection("users");
    return userRef
      .where("username", "==", username)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          if (!doc) {
            return cb(null, null);
          }
          //console.log(doc.data());
          let users = doc.data();
          //console.log(typeof users);
          //console.log(users.id);
          return cb(null, users);
        });
      });
  });
  /*   process.nextTick(function () {
    for (var i = 0, len = records.length; i < len; i++) {
      var record = records[i];
      if (record.username === username) {
        console.log(typeof record);
        console.log(record);
        return cb(null, record);
      }
    }
    return cb(null, null);
  }); */
};
