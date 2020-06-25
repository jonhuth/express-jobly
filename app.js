/** Express app for jobly. */

const express = require("express");
const cors = require("cors");
const ExpressError = require("./helpers/expressError");
const morgan = require("morgan");
const { authenticateJWT } = require("./middleware/auth");
const app = express();

app.use(cors());
// allow json body parsing
app.use(express.json());
//get auth token for all routes
app.use(authenticateJWT);
app.use(express.urlencoded({extended: true}));


// routes
const companyRoutes = require("./routes/companies");
const jobRoutes = require("./routes/jobs");
const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
app.use("/users", userRoutes);
app.use("/companies", companyRoutes);
app.use("/jobs", jobRoutes);
app.use("/auth", authRoutes);

// add logging system
app.use(morgan("tiny"));

/** 404 handler */

app.use(function(req, res, next) {
  const err = new ExpressError("Not Found", 404);

  // pass the error to the next piece of middleware
  return next(err);
});

/** general error handler */

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  if (process.env.NODE_ENV != "test") console.error(err.stack);

  return res.json({
    error: err
  });
});

module.exports = app;
