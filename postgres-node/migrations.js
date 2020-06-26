const db = require("./index").db;
db.query(
  "CREATE TABLE users(id SERIAL PRIMARY KEY, name VARCHAR(40) NOT NULL)",
  (err, res) => {
    console.log(err, res);
  }
);

db.query(
  "CREATE TABLE bookmarks (id SERIAL NOT NULL PRIMARY KEY, subreddit VARCHAR(100) NOT NULL, user_id INT, FOREIGN KEY (user_id) REFERENCES users(id));",
  (err, res) => {
    console.log(err, res);
  }
);
db.end();
