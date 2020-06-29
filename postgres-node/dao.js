const db = require("./index").db;
const dbQueryToPromise = require("./utils").dbQueryToPromise;
const dao = {
  addUser: (name) => {
    const query = `INSERT INTO users(name) VALUES('${name}')`;
    return dbQueryToPromise(query);
  },
  findUserByName: (name) => {
    const query = `SELECT id,name from users u where u.name='${name}'`;
    return dbQueryToPromise(query);
  },
  findBookmars: (userId) => {
    const query = `SELECT user_id,subreddit from bookmarks b where b.user_id=${userId}`;
    return dbQueryToPromise(query);
  },
  addBookmark: (userId, subreddit) => {
    const query = `INSERT INTO bookmarks(subreddit, user_id) VALUES('${subreddit}',${userId})`;
    return dbQueryToPromise(query);
  },
  removeBookmark: (userId, subreddit) => {
    const query = `DELETE FROM bookmarks WHERE subreddit='${subreddit}' AND user_id = ${userId}`;
    return dbQueryToPromise(query);
  },
};

exports.dao = dao;
