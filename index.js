const express        = require('express');
const winston        = require('winston');
const expressWinston = require('express-winston');

const app      = express();
const PORT     = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'production';

app.use(expressWinston.logger({
  transports: [
    new winston.transports.Console({
      json:     true,
      colorize: true
    })
  ]
}));

app.disable('x-powered-by');

app.get('/', (req, res) => {
  res.send(JSON.stringify({
    test: 'Hello World'
  }) + '\n');
});

app.listen(PORT, () => {
  winston.info(`Running ${NODE_ENV} server on port ${PORT}.`);
});
