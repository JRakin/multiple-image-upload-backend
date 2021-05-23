const cloudinary = require("cloudinary");
// const { resolve, reject } = require("q");
const Q = require("q");

function upload(file) {
  cloudinary.v2.config({
    cloud_name: "juaid",
    api_key: "827986347323519",
    api_secret: "-li-rDbSyAnNqWp8Yyo1WthqN0A",
  });

  return new Q.Promise((resolve, reject) => {
    cloudinary.v2.uploader.upload(
      file,
      { width: 100, height: 100 },
      (err, res) => {
        if (err) {
          reject(err);
        } else {
          return resolve(res.url);
        }
      }
    );
  });
}

module.exports = upload;
