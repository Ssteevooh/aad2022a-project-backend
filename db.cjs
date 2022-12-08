const mongoose = require('mongoose');

/*
useNewUrlParser, useUnifiedTopology, useFindAndModify, and useCreateIndex
are no longer supported options. Mongoose 6 always behaves as
if useNewUrlParser, useUnifiedTopology, and useCreateIndex are true, and
useFindAndModify is false. Please remove these options from your code.
*/

module.exports = {
  connect: DB_HOST => {
    mongoose.connect(DB_HOST);
    mongoose.connection.on('error', err => {
      console.error(err);
      console.log(
        'MongoDB connection error. Please make sure MongoDB is running.'
      );
      process.exit();
    });
    console.log('Database connected');
  },

  close: () => {
    mongoose.connection.close();
  }
};
