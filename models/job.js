const db = require("../db");
const bcrypt = require("bcrypt");
const ExpressError = require("../helpers/expressError");

const { BCRYPT_WORK_FACTOR } = require("../config");
const sqlForPartialUpdate = require("../helpers/partialUpdate");

// Job class used for records in jobs table in db
class Job {
  static async all({ search, min_salary, min_equity }) {
    let whereFilters = [];
    if (search) {
      whereFilters.push(`title INCLUDES "${search}"`);
    }

    if (min_salary) {
      whereFilters.push(`salary > ${min_salary}`);
    }

    if (min_equity) {
      whereFilters.push(`equity > ${min_equity}`)
    }
    let results;
    if (whereFilters.length > 0) {
      const whereQuery = 'WHERE ' + whereFilters.join(',');
      results = await db.query(`
      SELECT title, company_handle
        FROM jobs
        $1
        ORDER BY date_posted desc
      `, [whereQuery]);
    } else {
      results = await db.query(`
    SELECT title, company_handle 
      FROM jobs
      ORDER BY date_posted desc
    `);
    }

    // ex: title INCLUDES "search", min_salary > 2, min_equity < 1
    return results.rows;
  }

  static async create({ title, salary, equity, company_handle }) {
    const result = await db.query(`
    INSERT INTO jobs (title, salary, equity, company_handle, date_posted)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      RETURNING title, salary, equity, company_handle, date_posted
    `, [title, salary, equity, company_handle]);

    return result.rows[0];
  }

  static async get(id) {
    const result = await db.query(`
    SELECT id, title, salary, equity, company_handle, date_posted
    FROM jobs
    WHERE id=$1
    `, [id]);

    if (result.rows.length === 0) {
      throw new ExpressError(`${id} does not exist`, 404);
    }
    return result.rows[0];
  }

  static async update(id, body) {
    let { query, values } = sqlForPartialUpdate('jobs', body, 'id', id);
    let result = await db.query(query, values);
    if (result.rows.length === 0) {
      throw new ExpressError(`${id} does not exist`, 404);
    }
    return result.rows[0];
  }

  static async delete(id) {
    const result = await db.query(`
    DELETE FROM jobs
    WHERE id=$1
    RETURNING id
    `, [id]);

    if (result.rows.length === 0) {
      throw new ExpressError(`${id} does not exist`, 404);
    }
    return "Job deleted";
  }

  static async apply(username, job_id, state) {
    const result = await db.query(`
    INSERT INTO applications (username, job_id, state, created_at)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
      RETURNING username, job_id, state, created_at
    `, [username, job_id, state]);
    if (result.rows.length === 0) {
      throw new ExpressError(`${id} does not exist`, 404);
    }
    return result.rows[0].state;

  }
}

module.exports = Job;