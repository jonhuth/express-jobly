const jwt = require("jsonwebtoken");
const Router = require("express").Router;
const router = new Router();

const User = require("../models/user");
const ExpressError = require("../helpers/expressError");

const { SECRET_KEY } = require("../config");

router.post("/login", async function (req, res, next) {
  try {
    let { username, password } = req.body;
    // check if username is admin
    if (await User.authenticate(username, password)) {
      let is_admin = (await User.get(username)).is_admin;
      let token = jwt.sign({ username, is_admin }, SECRET_KEY);
      return res.json({ token });
    } else {
      throw new ExpressError("invalid username/password", 400);
    }

  } catch (err) {
    return next(err);
  }
})

module.exports = router;