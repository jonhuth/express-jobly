const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../../app");
const db = require("../../db");
const Company = require("../../models/company");
const { SECRET_KEY } = require("../../config");

describe("Company Routes Test", function () {
  beforeEach(async function () {
    await db.query("DELETE FROM companies");

    let c1 = await Company.create({
      handle: "microsoft",
      name: "Microsoft",
      num_employees: 54,
      description: "We make software",
      logo_url: "this is optional"
    });
  })

  test("Able to get list of companies", async function () {
    let response = await request(app)
      .get("/companies");

    expect(response.body).toEqual({
      "companies": [
        {
          "handle": "microsoft",
          "name": "Microsoft"
        }]
    });
  })

  test("Able to get company", async function () {
    // happy path
    let response = await request(app)
      .get("/companies/microsoft");

    expect(response.body).toEqual({
      "company": {
        "handle": "microsoft",
        "name": "Microsoft",
        "num_employees": 54,
        "description": "We make software",
        "logo_url": "this is optional"
      }
    });

    // sad path
    let badResponse = await request(app)
      .get("/companies/yahoo");

    expect(badResponse.body).toEqual({
      "status": 400,
      "message": "yahoo does not exist"
    })
  });

  test("POST new company", async function () {
    // happy path
    let response = await request(app)
      .post("/companies")
      .send({
        "handle": "apple",
        "name": "Apple Inc",
        "num_employees": 27,
        "description": "We make a lot of money",
        "logo_url": "this is optional"
      }
      );

    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual({
      company: {
        handle: "apple",
        name: "Apple Inc",
        num_employees: 27,
        description: "We make a lot of money",
        logo_url: "this is optional"
      }
    });

    let dbResponse = await request(app)
      .get("/companies/apple");

    expect(dbResponse.body).toEqual({
      "company": {
        "handle": "apple",
        "name": "Apple Inc",
        "num_employees": 27,
        "description": "We make a lot of money",
        "logo_url": "this is optional"
      }
    });

    // sad path - remove required key value pair
    let badResponse = await request(app)
      .post("/companies")
      .send({
        "handle": "apple",
        "num_employees": 27,
        "description": "We make a lot of money",
        "logo_url": "this is optional"
      });

    expect(badResponse.body).toEqual({
      "status": 400,
      "message": [
        "instance requires property \"name\""
      ]
    });
  });

  test("PATCH company record", async function () {
    // happy path
    let response = await request(app)
      .patch("/companies/microsoft")
      .send({
        "num_employees": 56
      }
      );

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      company: {
        handle: "microsoft",
        name: "Microsoft",
        num_employees: 56,
        description: "We make software",
        logo_url: "this is optional"
      }
    });

    let dbResponse = await request(app)
      .get("/companies/microsoft");

    expect(dbResponse.body).toEqual({
      company: {
        handle: "microsoft",
        name: "Microsoft",
        num_employees: 56,
        description: "We make software",
        logo_url: "this is optional"
      }
    });

    // sad path - input incorrect type for field, caught by json schema
    let badResponse = await request(app)
      .patch("/companies/microsoft")
      .send({
        "num_employees": "54"
      });

    expect(badResponse.body).toEqual({
      "status": 400,
      "message": [
        "instance.num_employees is not of a type(s) integer"
      ]
    });
  });

  test("Able to delete a company", async function () {
    // happy path
    let response = await request(app)
      .delete("/companies/microsoft");

    expect(response.body).toEqual({
      "message": "Company deleted"
    });

    let dbResponse = await request(app)
      .get("/companies");

    expect(dbResponse.body).toEqual({
      "companies": []
    });

    // sad path
    let badResponse = await request(app)
      .delete("/companies/yahoo");

    expect(badResponse.body).toEqual({
      "status": 404,
      "message": "yahoo does not exist"
    })
  });
});

afterAll(async function () {
  await db.end();
});

