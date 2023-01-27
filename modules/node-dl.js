const https = require("https");
const fs = require("fs");
exports.download = (uri, filename) => {
  return new Promise((resolve, reject) =>
    https
      .request(uri, (res) => {
        res
          .pipe(fs.createWriteStream(filename))
          .on("close", resolve)
          .on("error", reject);
      })
      .end()
  );
};