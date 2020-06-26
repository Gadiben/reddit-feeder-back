const db = require("./index").db;
const dbQueryToPromise = (query) => {
  return new Promise((resolve, reject) => {
    db.query(query, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res.rows);
      }
    });
  });
};

exports.dbQueryToPromise = dbQueryToPromise;
