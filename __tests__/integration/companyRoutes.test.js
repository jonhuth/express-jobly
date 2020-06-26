const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../../app");
const db = require("../../db");
const Company = require("../../models/company");
const { SECRET_KEY } = require("../../config");
const User = require("../../models/user");

describe("Company Routes Test", function () {
  let testUserToken;
  beforeEach(async function () {
    await db.query("DELETE FROM jobs");
    await db.query("DELETE FROM companies");
    await db.query("DELETE FROM users");

    let admin = await User.create({
      username: "admin",
      password: "password",
      first_name: "head",
      last_name: "honcho", 
      email: "safafg", 
      is_admin: "true"
  })

    let c1 = await Company.create({
      handle: "microsoft",
      name: "Microsoft",
      num_employees: 54,
      description: "We make software",
      logo_url: "this is optional"
      });

    let login = request(app)
    .post("/auth/login")
    .send({
      username: "admin",
      password: "password"
    });

    testUserToken = jwt.sign({username: admin.username}, SECRET_KEY)


  })

  test("Able to get list of companies", async function () {
    let response = await request(app)
      .get("/companies")
      .send({_token: testUserToken});


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
      .get("/companies/microsoft")
      .send({_token: testUserToken});

    expect(response.body).toEqual({
      "company": {
        "handle": "microsoft",
        "name": "Microsoft",
        "num_employees": 54,
        "description": "We make software",
        "logo_url": "this is optional",
        "jobs": []
      }
    });

    // sad path
    let badResponse = await request(app)
      .get("/companies/yahoo")
      .send({_token: testUserToken});

    expect(badResponse.body.error).toEqual({
      "status": 400,
      "message": "yahoo does not exist"
    })
  });

  test("POST new company", async function () {
    // happy path
    let response = await request(app)
      .post("/companies/")
      .send({
        _token: testUserToken,
        handle: "apple",
        name: "Apple Inc",
        num_employees: 27,
        description: "We make a lot of money",
        logo_url: "this is optional"
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
      .get("/companies/apple")
      .send({_token: testUserToken});

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
        _token: testUserToken,
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
        "_token": testUserToken,
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
      .get("/companies/microsoft")
      .send({_token: testUserToken});;

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
        _token: testUserToken,
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
      .delete("/companies/microsoft")
      .send({_token: testUserToken});

    expect(response.body).toEqual({
      "message": "Company deleted"
    });

    let dbResponse = await request(app)
      .get("/companies")
      .send({_token: testUserToken});

    expect(dbResponse.body).toEqual({
      "companies": []
    });

    // sad path
    let badResponse = await request(app)
      .delete("/companies/yahoo")
      .send({_token: testUserToken});

    expect(badResponse.body).toEqual({
      "status": 404,
      "message": "yahoo does not exist"
    })
  });
});

afterAll(async function () {
  await db.end();
});

