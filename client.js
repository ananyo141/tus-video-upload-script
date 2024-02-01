const tus = require("tus-js-client");
const fs = require("fs");
const path = require("path");

// Check if the filename is provided as a command-line argument
const args = process.argv.slice(2);

if (args.length !== 1) {
  console.error("Usage: node script.js <filename>");
  process.exit(1); // Exit with an error code
}

const FILENAME = args[0];
const FILE_PATH = path.resolve(__dirname, FILENAME);

const file = fs.createReadStream(FILE_PATH);
const size = fs.statSync(FILE_PATH).size;

const upload = new tus.Upload(file, {
  endpoint: "http://localhost:8001/video/uploads/",
  retryDelays: [0, 1000, 3000, 5000],
  headers: {
    Authorization: "token",
  },
  metadata: {
    filename: FILENAME,
    filetype: "video/mp4",
  },
  onError: function (error) {
    console.log("Failed because: " + error);
  },
  onProgress: function (bytesUploaded, bytesTotal) {
    let percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
    console.log(bytesUploaded, bytesTotal, percentage + "%");
  },
  onSuccess: function () {
    console.log("Download %s from %s", upload.file.name, upload.url);
  },
});

upload.start();
