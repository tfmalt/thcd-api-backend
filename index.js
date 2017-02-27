/**
 * Express server implementing the API backend to serve data to the
 * thcd test application. Basically a prototype. A lot of shortcuts has
 * been taken.
 *
 * @author Thomas Malt <thomas@malt.no>
 * @license MIT
 */

const express         = require('express');
const bodyParser      = require('body-parser');
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

app.use(bodyParser.json());

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


/**
 * Root route - only returns a welcomming message.
 */
app.get('/', (req, res) => {
  res.set('Content-Type', 'application/json');
  res.send(JSON.stringify({
    status: 'OK',
    message: 'Everything is running',
    version: version
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

/**
 * POST Add a new rate to the model.
 */
app.post('/rates/add', (req, res) => {
  console.log('The request object with post:', req.body);
  console.log('object keys:', Object.keys(req.body));

  if (
    req.body &&
    req.body.hasOwnProperty('currency') &&
    req.body.hasOwnProperty('amount') &&
    req.body.hasOwnProperty('supplier') &&
    req.body.hasOwnProperty('port')
  ) {
    rates.handlePostedRate(req.body).then( (result) => {
      res.status(201)
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({
          status:  '201 Created',
          message: 'Added a new rate to the system',
          body:    result
        }) + '\n');
    }).catch( () => {
      res.status(500)
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({
          status:  '500 Internal Server Error',
          message: 'something unexpected happended. It will be fixed soon'
        }) + '\n');
    });
  } else {
    res.status(400);
    res.set('Content-Type', 'application/json');
    res.send(JSON.stringify({
      status:  '400 Bad Request',
      message: 'Invalid post. There must be a valid json body posted.'
    }) + '\n');
  }
});

/**
 * Return json with the statistical distribution of rates as percentiles
 * useful for graphing the data
 */
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
  data.version = version;
  data.description = 'Data on handling charges for all ports in a country.';

  res.send(JSON.stringify(data) + '\n');
});

//
// ... and load the model and start the server
// Loading the model is promise based to make sure all data is loaded and in
// memory before the server accepts connection. In a production server
// the model backend would of course be a database.
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
