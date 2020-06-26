const db = require("../db");
const bcrypt = require("bcrypt");
const ExpressError = require("../helpers/expressError");

const { BCRYPT_WORK_FACTOR } = require("../config");
const sqlForPartialUpdate = require("../helpers/partialUpdate");

// User class
class User {
  static async all() {

    const results = await db.query(`
    SELECT username, first_name, last_name, email 
      FROM users
    `);

    return results.rows;
  }

  static async authenticate(username, password) {
    const result = await db.query(
        "SELECT password FROM users WHERE username = $1",
        [username]);
    let user = result.rows[0];

    return user && await bcrypt.compare(password, user.password);
  }

  static async create({ username, password, first_name, last_name, email, photo_url, is_admin }) {
    let hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    const result = await db.query(`
    INSERT INTO users (username, password, first_name, last_name, email, photo_url, is_admin)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING username, first_name, last_name, email, is_admin
    `, [username, hashedPassword, first_name, last_name, email, photo_url, is_admin || false]);

    return result.rows[0];
  }

  static async get(username) {
    let user = await db.query(`
    SELECT username, first_name, last_name, email, photo_url, is_admin
    FROM users
    WHERE username=$1
    `, [username]);

    const result = await db.query(`
    SELECT a.job_id, a.state, a.created_at
    FROM users AS u LEFT JOIN applications AS a 
      ON a.username = u.username
    LEFT JOIN jobs AS j
      ON a.job_id = j.id
    WHERE u.username = $1
    `, [username]);

    console.log('related jobs...', result.rows);
    // if user has not engaged any jobs; jobs : []
    if (!result.rows[0].job_id) {
      result.rows.pop();
    }

    user.rows[0].jobs = result.rows;


    if (user.rows.length === 0) {
      throw new ExpressError(`${username} does not exist`, 400);
    }

    return user.rows[0];
  }

  static async update(username, body) {
    let { query, values } = sqlForPartialUpdate('users', body, 'username', username);

    let result = await db.query(query, values);

    return result.rows[0];
  }

  static async delete(username) {
    const result = await db.query(`
    DELETE FROM users
    WHERE username=$1
    RETURNING username
    `, [username]);

    if (result.rows.length === 0) {
      throw new ExpressError(`${username} does not exist`, 404);
    }

    return "User deleted";
  }

}




module.exports = User;