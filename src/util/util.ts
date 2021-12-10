import axios from "axios";
import fs from "fs";
import Jimp = require("jimp");

// checkValidUrl
// helper function to help to check if the url provided is in the right format
// returns a boolean
// INPUTS
//      inputURL: string - a publicly accesible url
// RETURNS
//      a boolean of TRUE or FALSE which confirms if URL is valid
export function checkValidUrl(inputURL: string): Boolean {
  let url;

  try {
    url = new URL(inputURL);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
}

// filterImageFromURL
// helper function to download, filter, and save the filtered image locally
// returns the absolute path to the local image
// INPUTS
//    inputURL: string - a publicly accessible url to an image file
// RETURNS
//    an absolute path to a filtered image locally saved file
export async function filterImageFromURL(inputURL: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const photo = await axios({
        method: "get",
        url: inputURL,
        responseType: "arraybuffer",
      }).then(function ({ data: imageBuffer }) {
        return Jimp.read(imageBuffer);
      });

      const outpath =
        "/tmp/filtered." + Math.floor(Math.random() * 2000) + ".jpg";
      await photo
        .resize(256, 256) // resize
        .quality(60) // set JPEG quality
        .greyscale() // set greyscale
        .write(__dirname + outpath, (img) => {
          resolve(__dirname + outpath);
        });
    } catch (error) {
      console.error(error);
      reject("Could not read image.");
    }
  });
}

// deleteLocalFiles
// helper function to delete files on the local disk
// useful to cleanup after tasks
// INPUTS
//    files: Array<string> an array of absolute paths to files
export async function deleteLocalFiles(files: Array<string>) {
  for (let file of files) {
    fs.unlinkSync(file);
  }
}
