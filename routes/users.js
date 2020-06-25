const jwt = require("jsonwebtoken");
const Router = require("express").Router;
const User = require("../models/user");
const jsonschema = require("jsonschema");
const userSchema = require("../schemas/userSchema.json");
const patchUserSchema = require("../schemas/patchUserSchema.json");
const ExpressError = require("../helpers/expressError");
const { SECRET_KEY } = require("../config");
const { ensureLoggedIn, ensureCorrectUser, ensureAdmin } = require("../middleware/auth");

const router = new Router();

// get list of users
router.get("/", async function (req, res, next) {
  try {
    let user = await User.all(req.query);

    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

router.post("/", async function (req, res, next) {
  try {
    const result = jsonschema.validate(req.body, userSchema);
    if (!result.valid) {
      let listOfErrors = result.errors.map(err => err.stack);
      let error = new ExpressError(listOfErrors, 400);
      return next(error);
    }
    let { username, is_admin } = await User.create(req.body);
    let token = jwt.sign({username, is_admin}, SECRET_KEY);

    return res.status(201).json({ token });

  } catch (err) {
    return next(err);
  }
});

router.get("/:username", async function (req, res, next) {
  try {
    let user = await User.get(req.params.username);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

router.patch("/:username", ensureCorrectUser, async function (req, res, next) {
  try {
    const result = jsonschema.validate(req.body, patchUserSchema);
    if (!result.valid) {
      let listOfErrors = result.errors.map(err => err.stack);
      let error = new ExpressError(listOfErrors, 400);
      return next(error);
    }
    let user = await User.update(req.params.username, req.body);
    if (!user) {
      throw new ExpressError(`${req.params.username} does not exist`, 400);
    }

    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

router.delete("/:username", ensureCorrectUser, async function (req, res, next) {
  try {
    let message = await User.delete(req.params.username);

    return res.json({ message });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;