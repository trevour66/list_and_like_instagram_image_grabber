const compress_images = require("compress-images");
const fs = require("fs");
const path = require("path");
const { Storage } = require("@google-cloud/storage");
const { savePublicURL } = require("./getPostData");
const { logger } = require("./config");

require("dotenv").config();

const COMPRESSED_FOLDER = process.env.COMPRESSED_FOLDER;
const RAW_FOLDER = process.env.RAW_FOLDER;
const SERVICE_ACCOUNT_PATH = process.env.SERVICE_ACCOUNT_PATH;

const storage = new Storage({
  keyFilename: SERVICE_ACCOUNT_PATH,
});
const bucketName = "like_and_share_ig_post_images";

function compressImagesPromise(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    compress_images(
      inputPath,
      outputPath,
      { compress_force: false, statistic: false, autoupdate: true },
      false,
      { jpg: { engine: "mozjpeg", command: ["-quality", "60"] } },
      { png: { engine: "pngquant", command: ["--quality=20-50", "-o"] } },
      { svg: { engine: "svgo", command: "--multipass" } },
      {
        gif: {
          engine: "gifsicle",
          command: ["--colors", "64", "--use-col=web"],
        },
      },
      (error, completed, statistic) => {
        if (error) {
          reject(error); // Reject the Promise if there's an error
        } else {
          resolve(true); // Resolve the Promise with the results
        }
      }
    );
  });
}

const imageProcessor = async () => {
  try {
    const INPUT_path_to_your_images = `${RAW_FOLDER}/*.{jpg,JPG,jpeg,JPEG,png,svg,gif}`;
    const OUTPUT_path = `${COMPRESSED_FOLDER}/`;

    let proceedToSaving = await compressImagesPromise(
      INPUT_path_to_your_images,
      OUTPUT_path
    );

    console.log(proceedToSaving);

    if (proceedToSaving) {
      await saveFiles();
    }

    const rawDirectoryPath = path.join(__dirname, "raw");
    const regex = /^img___(\d+)\.jpg$/;

    let files = fs.readdirSync(rawDirectoryPath) ?? [];

    if (files.length === 0) {
      logger.error("Unable to scan directory:", {
        timestamp: new Date().toLocaleString(),
      });
      return console.error("Unable to scan directory:");
    }

    for (let index = 0; index < files.length; index++) {
      const file = files[index];

      const match = file.match(regex);

      if (match) {
        // Extract the post_id from the matched filename
        const post_id = match[1]; // This is the captured group from the regex
        // console.log(`File: ${file}, Post ID: ${post_id}`);

        const filePath = path.join(rawDirectoryPath, file);

        fs.unlink(filePath, (err) => {
          if (err) {
            logger.error(`Error deleting file ${file}: ${err})`, {
              timestamp: new Date().toLocaleString(),
            });
            console.error(`Error deleting file ${file}:`, err);
          } else {
            // console.log(`Successfully deleted local file: ${file}`);
          }
        });
      }
    }
  } catch (error) {
    console.log(`Error | imageProcessor | ${error.message}`);
    logger.error(`Error | imageProcessor | ${error.message}`, {
      timestamp: new Date().toLocaleString(),
    });
  }
};

const saveFiles = async () => {
  const finalDirectoryPath = path.join(__dirname, "compressed");
  const regex = /^img___(\d+)\.jpg$/;

  let files = fs.readdirSync(finalDirectoryPath) ?? [];

  if (files.length === 0) {
    logger.error(`Unable to scan directory:`, {
      timestamp: new Date().toLocaleString(),
    });
    return console.error("Unable to scan directory:");
  }

  for (let index = 0; index < files.length; index++) {
    const file = files[index];

    const match = file.match(regex);

    if (match) {
      // Extract the post_id from the matched filename
      const post_id = match[1]; // This is the captured group from the regex

      const filePath = path.join(finalDirectoryPath, file);

      const destination = `${file}`;

      // Upload the file to Google Cloud Storage
      let publicURL = "";

      await uploadFileToGCS(filePath, destination)
        .then((res) => {
          fs.unlink(filePath, (err) => {
            if (err) {
              logger.error(`Error deleting file ${file}:, ${err}`, {
                timestamp: new Date().toLocaleString(),
              });
              console.error(`Error deleting file ${file}:`, err);
            } else {
              //   console.log(`Successfully deleted local file: ${file}`);
            }
          });

          publicURL = res ?? "";
        })
        .catch((err) => {
          logger.error(`Error uploading file: ${err}`, {
            timestamp: new Date().toLocaleString(),
          });
          console.error("Error uploading file:", err);
        });

      if (publicURL !== "") {
        await savePublicURL(post_id, publicURL);
      }
      // Further processing with the post_id can be done here
    } else {
      logger.error(`File: ${file} does not match the expected pattern.`, {
        timestamp: new Date().toLocaleString(),
      });
      console.log(`File: ${file} does not match the expected pattern.`);
    }
  }
};

// Function to upload a file to Google Cloud Storage
async function uploadFileToGCS(filePath, destination) {
  const res = await storage.bucket(bucketName).upload(filePath, {
    destination: destination, // Name of the file in the bucket
    gzip: true, // Compress the file before upload
    metadata: {
      cacheControl: "public, max-age=31536000",
    },
  });

  let publicURL = res[0].publicUrl() ?? false;

  // console.log(`${filePath} uploaded to ${bucketName} as ${destination}. ${publicURL}`);

  if (publicURL) {
    return publicURL;
  } else {
    return "";
  }
}

// imageProcessor()

module.exports = {
  imageProcessor,
};
