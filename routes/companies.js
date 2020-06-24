const Router = require("express").Router;
const Company = require("../models/company");
const ExpressError = require("../helpers/expressError");

const router = new Router();

// get list of companies
router.get("/", async function (req, res, next) {
  try {
    let companies = await Company.all(req.query);
    if (!companies) {
      throw new ExpressError("invalid min and max", 400);
    }
    return res.json({companies});
  } catch (err) {
    return next(err);
  }
});

router.post("/", async function (req, res, next) {
  try {
    let company = await Company.create(req.body);

    return res.json({company});

  } catch(err) {
    return next(err);
  }
});

router.get("/:handle", async function (req, res, next) {
  try {
    let company = await Company.get(req.params.handle);
    if (!company) {
      throw new ExpressError(`${req.params.handle} does not exist`, 400);
    }

    return res.json({company});
  } catch (err) {
    return next(err);
  }
});


module.exports = router;