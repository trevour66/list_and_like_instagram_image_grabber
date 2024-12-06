const { MongoClient } = require("mongodb");
require("dotenv").config();

const connURI = process.env.MONGODB_URI;
const client = new MongoClient(connURI);

async function run() {
  try {
    const database = client.db("myappdb");
    const ig_profile_posts = database.collection("ig_profile_posts");

    const query = {
      $and: [
        {
          $or: [{ image_cdn: { $exists: false } }, { image_cdn: "" }],
        },
        {
          $or: [
            { error_current_count: { $exists: false } },
            { error_current_count: { $lt: 2 } },
          ],
        },
      ],
    };

    const post = ig_profile_posts.find(query).limit(250);

    return post;
  } catch (err) {
    return false;
  }
}

async function savePublicURL(post_id, imgURL) {
  try {
    // console.log(post_id)
    // console.log(imgURL)
    // return

    if (!post_id || !imgURL) {
      return;
    }

    const database = client.db("myappdb");
    const ig_profile_posts = database.collection("ig_profile_posts");

    const filter = { post_id: post_id };
    const updateDocument = {
      $set: {
        image_cdn: imgURL,
      },
    };

    const result = await ig_profile_posts.updateOne(filter, updateDocument);
    // console.log(result.modifiedCount)
  } catch (err) {
    console.log(err);
    return false;
  }
}

async function recordErrorFetchingImage(post_id, error_current_count) {
  try {
    // console.log(post_id)
    // console.log(error_current_count)
    // return

    if (!post_id || !error_current_count) {
      return;
    }

    const database = client.db("myappdb");
    const ig_profile_posts = database.collection("ig_profile_posts");

    const filter = { post_id: post_id };
    const updateDocument = {
      $set: {
        error_current_count: error_current_count,
      },
    };

    const result = await ig_profile_posts.updateOne(filter, updateDocument);
    console.log(result.modifiedCount);
  } catch (err) {
    console.log(err);
    return false;
  }
}

// run().catch(console.dir);

module.exports = { run, savePublicURL, recordErrorFetchingImage };
