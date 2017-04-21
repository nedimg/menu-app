const Express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const config = require('config');

const app = new Express();

// parse application/x-www-form-urlencoded and JSON
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// db connection
mongoose.Promise = global.Promise;
mongoose.connect(config.get('mongoDB'), {
    server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
    replset: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

// don't show the log when it is test
if (config.util.getEnv('NODE_ENV') !== 'test') {
    // use morgan to log at command line
    app.use(morgan('dev'));
}

app.use((req, res, next) => {
    // Website you wish to allow to connect
    const allowedOrigins = ['http://127.0.0.1:3000', 'http://localhost:3000'];
    const origin = req.headers.origin;
    if (allowedOrigins.indexOf(origin) > -1) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    if (req.method === 'OPTIONS') {
        res.status(200).end();
    } else {
        next();
    }
});

// Auth Middleware - This will check if the token is valid
// Only the requests that start with /api/v1/* will be checked for the token.
app.all('/api/v1/*', [require('./middlewares/validateRequest')]);

app.use('/', require('./routes'));

// If no route is matched by now, it must be a 404
app.use(function(req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

const server = http.createServer(app);
server.listen(config.port, config.url, () => {
    console.info(`listening on port ${config.url}:${config.port}`);
});

module.exports = app;
