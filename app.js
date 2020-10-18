const express = require('express');
const app = express();
const cors = require('cors')
const mongoose = require('mongoose');
const morgan = require('morgan');
const bodyparser = require('body-parser');
const dotenv = require('dotenv');
const authRoute = require('./routes/auth')
const bookRoute = require('./routes/book')


dotenv.config();
const port = 4000

// Connect to MongoDB
mongoose
  .connect(
    // `mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@mongo:27017/node-api`,
    // 'mongodb://root:root@mongo:27017/getdevproject',
    `mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@mongo:27017/?authSource=admin`,
    { useNewUrlParser: true,
      useUnifiedTopology: true,
     }
  )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

mongoose.connection.on('error', err => {
    console.log(`DB: Connection was not successful ${err.message}`)
})

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
        error: "Unauthorized"
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