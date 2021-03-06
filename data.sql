DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS applications;

CREATE TABLE companies (
    handle text PRIMARY KEY,
    name text NOT NULL UNIQUE,
    num_employees integer,
    description text,
    logo_url text
);

CREATE TABLE jobs (
    id SERIAL PRIMARY KEY,
    title text NOT NULL,
    salary FLOAT NOT NULL, 
    equity FLOAT NOT NULL CHECK (equity <= 1),
    company_handle text REFERENCES companies,
    date_posted timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    username text PRIMARY KEY,
    password text NOT NULL,
    first_name text NOT NULL,
    last_name  text NOT NULL,
    email text NOT NULL UNIQUE,
    photo_url text,
    is_admin boolean NOT NULL DEFAULT false
);


CREATE TYPE state AS ENUM ('interested', 'applied', 'accepted', 'rejected');
CREATE TABLE applications (
    username text REFERENCES users, 
    job_id INTEGER REFERENCES jobs,
    state state NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (username, job_id)
);