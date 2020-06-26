const pg = require("pg");
const pool = new pg.Pool({
  user: "postgres",
  host: "127.0.0.1",
  database: "redditdb",
  password: "123456",
  port: "5432",
});

pool.query("SELECT NOW()", (err, res) => {
  console.log(err, res);
  pool.end();
});
