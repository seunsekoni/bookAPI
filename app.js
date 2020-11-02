const express = require('express');
const app = express();
const dotenv = require('dotenv');
const cors = require('cors')
const mongoose = require('mongoose');
const morgan = require('morgan');
const bodyparser = require('body-parser');
const authRoute = require('./routes/auth')
const bookRoute = require('./routes/book')


const port = process.env.PORT || 4000
dotenv.config();

// Connect to MongoDB
if(process.env.NODE_ENV === "test") {
  mongoose
    .connect(
      `${process.env.TEST_DATABASE_URL}`,
      { useNewUrlParser: true,
        useUnifiedTopology: true,
       }
    )
    .then(() => console.log('MongoDB Test DB Connected'))
    .catch(err => console.log(err));
  
  mongoose.connection.on('error', err => {
      console.log(`Test DB: Connection was not successful ${err.message}`)
  })

} else {
  mongoose
    .connect(
      `mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@${process.env.DATABASE_URL}`,
      { useNewUrlParser: true,
        useUnifiedTopology: true,
       }
    )
    .then(() => console.log('MongoDB Connected '+ process.env.NODE_ENV))
    .catch(err => console.log(err));
  
  mongoose.connection.on('error', err => {
      console.log(`DB: Connection was not successful ${err.message}`)
  })
}

// middlewares
app.use(morgan('dev'));
app.use(cors());
app.use(bodyparser.json())

app.use('/', authRoute);
app.use('/', bookRoute);





// handle error if an unauthorized error is returned
app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({
        error: "Unauthorized to perform this action"
    });
  }
});

app.listen(port, () => {
    console.log(`App listening to port ${port}`)
})

app.get('/',(req, res) => {
    res.send({
        msg: "hello"
    })
})

module.exports = app
