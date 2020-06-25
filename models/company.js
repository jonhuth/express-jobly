const db = require("../db");
const bcrypt = require("bcrypt");
const ExpressError = require("../helpers/expressError");

const { BCRYPT_WORK_FACTOR } = require("../config");
const sqlForPartialUpdate = require("../helpers/partialUpdate");

// Company class used for records in companies table in db
class Company {
  static async all({ nameSearch, minEmployees, maxEmployees }) {

    if (minEmployees > maxEmployees) {
      throw new ExpressError("invalid min and max", 400);
    }

    let whereFilters = [];
    if (nameSearch) {
      whereFilters.push(`name INCLUDES "${nameSearch}"`);
    }

    if (minEmployees) {
      whereFilters.push(`num_employees > ${minEmployees}`);
    }

    if (maxEmployees) {
      whereFilters.push(`num_employees < ${maxEmployees}`)
    }

    if (whereFilters.length > 0) {
      const whereQuery = 'WHERE ' + whereFilters.join(',');
      const results = await db.query(`
      SELECT handle, name 
        FROM companies 
        $1
        ORDER BY handle
      `, [whereQuery]);
      return results.rows;
    }
    const results = await db.query(`
    SELECT handle, name 
      FROM companies
      ORDER BY handle
    `);

    // ex: name INCLUDES "nameSearch",num_employees > 2,num_employees < 5
    return results.rows;
  }

  static async create({ handle, name, num_employees, description, logo_url }) {
    const result = await db.query(`
    INSERT INTO companies (handle, name, num_employees, 
      description, logo_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING handle, name, num_employees, description, logo_url
    `, [handle, name, num_employees, description, logo_url]);

    return result.rows[0];
  }

  static async get(handle) {
    const result = await db.query(`
    SELECT handle, name, num_employees, description, logo_url
    FROM companies
    WHERE handle=$1 
    `, [handle]);

    const jobs = await db.query(`
    SELECT title, company_handle from jobs
    WHERE company_handle = $1`, [handle])
    if (result.rows.length === 0) {
      throw new ExpressError(`${handle} does not exist`, 400);
    }
    result.rows[0].jobs = jobs.rows;
    return result.rows[0];
  }

  static async update(handle, body) {
    let { query, values } = sqlForPartialUpdate('companies', body, 'handle', handle);

    let result = await db.query(query, values);

    return result.rows[0];
  }

  static async delete(handle) {
    const result = await db.query(`
    DELETE FROM companies
    WHERE handle=$1
    RETURNING handle
    `, [handle]);

    if (result.rows.length === 0) {
      throw new ExpressError(`${handle} does not exist`, 404);
    }

    return "Company deleted";
  }
}




module.exports = Company;