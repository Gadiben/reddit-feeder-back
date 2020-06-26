const db = require("./index").db;
const dbQueryToPromise = require("./utils").dbQueryToPromise;
const dao = {
  findUserByName: (name) => {
    const query = `SELECT id,name from users u where u.name='${name}'`;
    return dbQueryToPromise(query);
  },
  findBookmars: (userId) => {
    const query = `SELECT user_id,subreddit from bookmarks b where b.user_id=${userId}`;
    return dbQueryToPromise(query);
  },
};

exports.dao = dao;
