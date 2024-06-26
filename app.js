const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');

const app = express();

app.use(cors());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use(express.json());

// Temporary use
async function hashPassword(myPlaintextPassword) {
  const bcrypt = require('bcrypt');
  const saltRounds = 10;
  bcrypt.hash(myPlaintextPassword, saltRounds, function(err, hash) {
    console.log(hash);
  });
}

hashPassword('test');


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  return res.status(404).send({ error: 'Invalid endpoint', status: 404 });
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;