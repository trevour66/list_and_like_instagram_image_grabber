const { MongoClient } = require("mongodb");
require('dotenv').config();

const connURI = process.env.MONGODB_URI;
const client = new MongoClient(connURI);

async function run() {
  try {
    const database = client.db('myappdb');
    const ig_profile_posts = database.collection('ig_profile_posts');

    const query = {
        $or: [
            {
                image_cdn: {
                    $exists: false
                }
            },
            { image_cdn: '' }
        ]
    };
    const post = ig_profile_posts.find(query);

    return post

  }catch(err){
    return false
  } 
}

async function savePublicURL(post_id, imgURL) {
    try {
        console.log(post_id)
        console.log(imgURL)
        // return

        if(
            !post_id ||
            !imgURL
        ){
            return
        }

        const database = client.db('myappdb');
        const ig_profile_posts = database.collection('ig_profile_posts');
    
        const filter = { post_id: post_id };
        const updateDocument = {
            $set: {
                image_cdn: imgURL,
            },
        };

        const result = await ig_profile_posts.updateOne(filter, updateDocument);
        console.log(result.modifiedCount)
  
    }catch(err){
        console.log(err)
      return false
    } 
}

// run().catch(console.dir);

module.exports = { run, savePublicURL }

