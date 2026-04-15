const { Pool } = require("pg"); 
// so here its called destructuring, we dont need whole pg library just the Pool class, which is what we use to connect to the database

require("dotenv").config();
// to my understanding we use dotenv to load var from env file so we can use them in our code, like the database connection details
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});
//here we are making a databse connection object

module.exports = pool;
//here we make it so we can export pool and use it in other files, like server.js, so we can run queries against the database