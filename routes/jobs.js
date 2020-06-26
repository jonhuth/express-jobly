const Router = require("express").Router;
const Job = require("../models/job");
const jsonschema = require("jsonschema");
const jobSchema = require("../schemas/jobSchema.json");
const patchJobSchema = require("../schemas/patchJobSchema.json");
const ExpressError = require("../helpers/expressError");
const { ensureLoggedIn, ensureCorrectUser, ensureAdmin } = require("../middleware/auth");

const router = new Router();

// get list of jobs
router.get("/", ensureLoggedIn, async function (req, res, next) {
  try {
    let jobs = await Job.all(req.query);
    // console.log('req.user ...', req);

    return res.json({ jobs });
  } catch (err) {
    return next(err);
  }
});

router.post("/", ensureAdmin, async function (req, res, next) {
  try {
    const result = jsonschema.validate(req.body, jobSchema);
    if (!result.valid) {
      let listOfErrors = result.errors.map(err => err.stack);
      let error = new ExpressError(listOfErrors, 400);
      return next(error);
    }
    let job = await Job.create(req.body);

    return res.status(201).json({ job });

  } catch (err) {
    return next(err);
  }
});

router.get("/:id", ensureLoggedIn, async function (req, res, next) {
  try {
    let job = await Job.get(req.params.id);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

router.post("/:id/apply", ensureLoggedIn, async function (req, res, next) {
  try {
    let { state } = req.body;
    console.log('inputs...', req.user.username, req.params.id, state);
    let message = await Job.apply(req.user.username, req.params.id, state);
    return res.json({ message });

  } catch (err) {
    return next(err);
  }
});

router.patch("/:id", ensureAdmin, async function (req, res, next) {
  try {
    const result = jsonschema.validate(req.body, patchjobSchema);
    if (!result.valid) {
      let listOfErrors = result.errors.map(err => err.stack);
      let error = new ExpressError(listOfErrors, 400);
      return next(error);
    }
    let job = await Job.update(req.params.id, req.body);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

router.delete("/:id", ensureAdmin, async function (req, res, next) {
  try {
    let message = await Job.delete(req.params.id);
    return res.json({ message });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;