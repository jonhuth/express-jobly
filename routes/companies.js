const Router = require("express").Router;
const Company = require("../models/company");
const jsonschema = require("jsonschema");
const companySchema = require("../schemas/companySchema.json");
const patchCompanySchema = require("../schemas/patchCompanySchema.json");
const ExpressError = require("../helpers/expressError");

const router = new Router();

// get list of companies
router.get("/", async function (req, res, next) {
  try {
    let companies = await Company.all(req.query);
    if (!companies) {
      throw new ExpressError("invalid min and max", 400);
    }
    return res.json({ companies });
  } catch (err) {
    return next(err);
  }
});

router.post("/", async function (req, res, next) {
  try {
    const result = jsonschema.validate(req.body, companySchema);
    if (!result.valid) {
      let listOfErrors = result.errors.map(err => err.stack);
      let error = new ExpressError(listOfErrors, 400);
      return next(error);
    }
    let company = await Company.create(req.body);

    return res.status(201).json({ company });

  } catch (err) {
    return next(err);
  }
});

router.get("/:handle", async function (req, res, next) {
  try {
    let company = await Company.get(req.params.handle);
    if (!company) {
      throw new ExpressError(`${req.params.handle} does not exist`, 400);
    }

    return res.json({ company });
  } catch (err) {
    return next(err);
  }
});

router.patch("/:handle", async function (req, res, next) {
  try {
    const result = jsonschema.validate(req.body, patchCompanySchema);
    if (!result.valid) {
      let listOfErrors = result.errors.map(err => err.stack);
      let error = new ExpressError(listOfErrors, 400);
      return next(error);
    }
    let company = await Company.update(req.params.handle, req.body);
    if (!company) {
      throw new ExpressError(`${req.params.handle} does not exist`, 400);
    }

    return res.json({ company });
  } catch (err) {
    return next(err);
  }
});

router.delete("/:handle", async function (req, res, next) {
  try {
    let message = await Company.delete(req.params.handle);

    return res.json({ message });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;