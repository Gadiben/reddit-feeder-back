const request = require("request");

const requestToPromise = (url, deep, verbose) => {
  return new Promise(function (resolve, reject) {
    request(encodeURI(url), {}, function (error, response, body) {
      if (verbose) {
        console.log(url);
        console.log(error);
        // console.log(response.body);
      }
      if (error) {
        return reject(error);
      }
      try {
        // JSON.parse() can throw an exception if not valid JSON
        if (deep) {
          resolve(JSON.parse(response.body));
        } else {
          resolve(JSON.parse(response.body).data);
        }
      } catch (e) {
        reject(e);
      }
    });
  });
};
exports.requestToPromise = requestToPromise;
