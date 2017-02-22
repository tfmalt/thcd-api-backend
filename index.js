const express         = require('express');
const winston         = require('winston');
const expressWinston  = require('express-winston');
const version         = (require('./package')).version;
const RatesController = require('./lib/RatesController');

const app      = express();
const PORT     = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'production';

const rates = new RatesController();

app.use(expressWinston.logger({
  transports: [
    new winston.transports.Console({
      json:     false,
      colorize: true
    })
  ]
}));

winston.info(`Starting THCD backend v${version}.`);

app.disable('x-powered-by');

app.get('/', (req, res) => {
  res.send(JSON.stringify({
    test: 'Hello World'
  }) + '\n');
});

app.get('/rates/:country/distribution', (req, res) => {
  let country = req.params.country.toUpperCase();
  if (!rates.countries.includes(country)) {
    res.status(404).send(JSON.stringify({
      status:  '404 Not Found',
      message: 'The request was valid, but no data was found for country ' +
        'code specified.'
    }) + '\n');

    return;
  }

  let distribution = rates.distribution(country);

  distribution.description = 'Distribution of handling charges for all ' +
    'ports in a country.';
  distribution.version = version;

  res.send(JSON.stringify(distribution) + '\n');
});

rates.loadModel().then( () => {
  winston.info('Loaded data model for port rates.');
  app.listen(PORT, () => {
    winston.info(`Running ${NODE_ENV} server on port ${PORT}.`);
  });
});
