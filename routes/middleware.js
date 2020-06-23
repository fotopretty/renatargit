const checkUser = (req, res, next) => {
  if (req.headers.authorization === "boy") {
    next();
  } else {
    res.send("ไม่อนุญาติ");
  }
};

const login = (req, res, next) => {
  if (req.body.username === "voravit" && req.body.password === "canon50d") next();
  else res.send("ชื่อผู้ใช้ หรือ รหัสผ่าน ไม่ถูกต้อง");
  //ถ้า username password ไม่ตรงให้ส่งว่า Wrong username and password
};

module.exports.checkuser = checkUser;
module.exports.login = login;
