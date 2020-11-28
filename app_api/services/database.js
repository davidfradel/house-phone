const mongoose = require('mongoose');

const URI = process.env.MONGODB_URI || "";

mongoose.connect(URI, {useNewUrlParser: true});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log("we're connected !");
});