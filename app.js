const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const errorHandler = require('./middlewares/http_error_handler');
const logger = require('./utils/loggers/logger');
require('./services/mongodb_connection');
const NotFoundError = require('./errors/http_errors/resource_not_found_error');

const apiIndex = require('./routes/api');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', apiIndex);

app.use((req, res, next) => {
  if (!res.headersSent) {
    next(new NotFoundError(req.method, req.path, '没有找到您要的资源哦'));
  }
});

app.use(errorHandler());

process.on('uncaughtException', (err) => {
  logger.error('uncaught exception', { err });
});

process.on('unhandledReject', (reason, p) => {
  logger.error('unhandledRejection', { reason, p });
});

module.exports = app;
