/**
 * Express server implementing the API backend to serve data to the
 * thcd test application. Basically a prototype. A lot of shortcuts has
 * been taken.
 *
 * @author Thomas Malt <thomas@malt.no>
 * @license MIT
 */

const express         = require('express');
const winston         = require('winston');
const expressWinston  = require('express-winston');
const version         = (require('./package')).version;
const RatesController = require('./lib/RatesController');

const app      = express();
const PORT     = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'production';

const rates = new RatesController();

app.disable('x-powered-by');
app.use(expressWinston.logger({
  transports: [
    new winston.transports.Console({
      json:      false,
      colorize:  true,
      timestamp: true
    })
  ]
}));

winston.info(`Starting THCD backend v${version}.`);

/**
 * Code to implement rudimentary CORS support.
 *
 * All requests are parsed through the cors validation.
 */
app.all('*', (req, res, next) => {
  let origin = req.header('Origin');
  let domains = {
    'http://localhost:3000': 1,
    'https://thcd.malt.no':  1
  };

  winston.info('DEBUG: Doing CORS check');
  winston.info(req.headers);

  if (domains.hasOwnProperty(origin)) {
    res.header(
      'Access-Control-Allow-Origin', origin
    );
    res.header(
      'Access-Control-Allow-Headers',
      'X-Requested-With, Content-Type'
    );
    res.header('Access-Control-Max-Age', 72000);
    res.header('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  }

  next();
});


app.get('/', (req, res) => {
  res.set('Content-Type', 'application/json');
  res.send(JSON.stringify({
    test: 'Hello World'
  }) + '\n');
});

app.get('/rates/countries', (req, res) => {
  res.set('Content-Type', 'application/json');
  let data = {
    description: 'Returns the list of countries with names seen in the data',
    version:     version,
    countries:   rates.countriesWithnames()
  };

  res.send(JSON.stringify(data) + '\n');
});

app.get('/rates/:country/distribution', (req, res) => {
  let country = req.params.country.toUpperCase();
  res.set('Content-Type', 'application/json');
  if (!rates.countries.includes(country)) {
    res.status(404).send(JSON.stringify({
      status:  '404 Not Found',
      message: 'The request was valid, but no data was found for country ' +
        'code specified.'
    }) + '\n');

    return;
  }

  let data = rates.getDataForCountry(country);
  let result = {
    percentiles:  data.percentiles,
    outlierRatio: data.outlierRatio,
    average:      data.average,
    median:       data.median,
    version:      version,
    description:  'Data on handling charges for all ports in a country.'
  };

  res.send(JSON.stringify(result) + '\n');
});

//
// ... and load the model and start the server
rates.loadModel()
.then( () => {
  winston.info('  Loaded data model for port rates.');
  return rates.fetchCountryNames();
})
.then( () => {
  winston.info('  Loaded list of country names from: ' +
    'http://data.okfn.org/data/core/country-list'
  );
})
.then( () => {
  app.listen(PORT, () => {
    winston.info(`Running ${NODE_ENV} server on port ${PORT}.`);
  });
});
