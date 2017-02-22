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

  data.description = 'Data on handling charges for all ' +
    'ports in a country.';
  data.version = version;

  res.send(JSON.stringify(data) + '\n');
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
