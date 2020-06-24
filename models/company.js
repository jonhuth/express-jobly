const db = require("../db");
const bcrypt = require("bcrypt");
const ExpressError = require("../helpers/expressError");

const { BCRYPT_WORK_FACTOR } = require("../config");

// Company class used for records in companies table in db
class Company {
  static async all({nameSearch, minEmployees, maxEmployees}) {
    
    if (minEmployees > maxEmployees) {
      return;
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
      const where = 'WHERE ' + whereFilters.join(',');
      const results = await db.query(`
      SELECT handle, name 
      FROM companies 
      $1
      ORDER BY handle
      `, [where]);
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

  static async create({handle, name, num_employees, description, logo_url}) {
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

    console.log(result);

    return result.rows[0];
  }
}


module.exports = Company;