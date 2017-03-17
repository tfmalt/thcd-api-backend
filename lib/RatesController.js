const PortRatesModel = require('./PortRatesModel');
const rp = require('request-promise-native');

/**
 * A controller object to abstract the logic away from the express app router
 */
class RatesController {
  constructor() {
    this.prm = new PortRatesModel();
    this.countryNames = {};
  }

  /**
   * Handler entrypoint for dealing with data.
   *
   * @param {object} data The json body from the post.
   * @return {Promise} the resolved promise
   */
  handlePostedRate(data) {
    return Promise.resolve(data)
      .then(this.verifyData)
      .then( (afterVerify) => {
        return this.getUSDForValue(afterVerify);
      })
      .then( (afterUSD) => (this.calculateOutlierForValue(afterUSD)))
      .then( (finish) => (this.createItem(finish)))
      .catch( (error, json) => {
        json.status = 500;
        return json;
      });
  }

  /**
   * Integrity checking of incoming data must always be done!
   *
   * This is just a proof of concept. In a production system much better
   * verification and error messages should be implemented
   *
   * @param {object} data The data to be verified.
   * @return {Promise} promise
   */
  verifyData(data) {
    const value = parseFloat(data.amount.value);
    if (isNaN(value)) {
      throw new TypeError('value is of incorrect data type');
    }

    const supplier_id = parseInt(data.supplier.value, 0);
    if (isNaN(supplier_id)) {
      throw new TypeError('supplier_id is not an integer');
    }

    const port = data.port.value.toUpperCase();
    if (typeof port !== 'string' || port.length !== 5 || !port.match(/[A-Z]/)) {
      throw new TypeError('port must be a 5 letter string with characters A-Z');
    }

    const currency = data.currency.value.toUpperCase();
    if (typeof currency !== 'string' || currency.length !== 3 || !currency.match(/[A-Z]/)) {
      throw new TypeError('currency must be a 3 letter string with characters A-Z');
    }

    return {
      status: 200,
      item:   {
        currency,
        value,
        port,
        supplier_id
      }
    };
  }

  /**
   * Add the usd value to the object
   *
   * @param {object} data the input object to fix.
   * @return {object} The updated data object.
   */
  getUSDForValue(data) {
    data.item.usd = this.prm.oxr.exchange(data.item);
    return data;
  }

  /**
   * Add the outlier to the object
   */
  calculateOutlierForValue(data) {
    const country = data.item.port.substr(0, 2);

    if (!this.countryNames.hasOwnProperty(country)) {
      throw new TypeError('port does not fit an actual country code');
    }

    data.country = country;

    let stats = this.getDataForCountry(country);
    data.item.outlier = this.prm.isOutlier(data.item.usd, stats.average);
    data.average = stats.average || data.item.usd;
    return data;
  }

  /**
   * Add an item to the model
   */
   createItem(data) {
     if (this.prm.addItem(data)) {
       data.status = 201;
     }
     return data;
   }

  /**
   * Using the Open Knowledge International (https://okfn.org/) dataset of
   * the ISO 3166-2 country codes as API.
   *  - https://en.wikipedia.org/wiki/Open_Knowledge_International
   *  - http://data.okfn.org/data/core/country-list
   *
   * @return {Promise} the promise of a list of country names
   */
  fetchCountryNames() {
    // In any real world scenario I would cache this data locally.
    let url = 'http://data.okfn.org/data/core/country-list/r/data.json';

    return rp(url).then( (data) => {
      let countries = JSON.parse(data);

      this.countryNames = countries.reduce( (a, c) => {
        a[c.Code] = c.Name;
        return a;
      }, {});

      return this.countryNames;
    }).catch( (error) => {
      console.error('OMG got error - handle properly', error);
    });
  }

  /**
   * Loads the model from the data model and returns the promise.
   *
   * @return {promise} The promise from the "data model"
   */
  loadModel() {
    return this.prm.loadModel();
  }

  /**
   * List of countries seen in data as an array
   *
   * @return {array} List of countries seen as two letter country codes.
   */
  get countries() {
    return this.prm.countries;
  }

  /**
   * Return the list of countries with their respective names in english
   *
   * @return {object} country codes with country names
   */
  countriesWithnames() {
    return this.prm.countries.reduce( (a, c) => {
      a[c] = this.countryNames[c];
      return a;
    }, {});
  }

  /**
   * returns an array of perentile data points in the given data
   * Naive algorithm assuming we can set create cut points based on some kind
   * of normal distribution.
   *
   * @param {array} data Data structure to parse.
   * @return {object} object of key percentile points
   */
  getPercentiles(data) {
    let percentiles = [];
    percentiles.push(data[0]);

    for (let i = 1; i < 100; i = i + 1) {
      percentiles.push(data[Math.round(data.length * i / 100)]);
    }
    percentiles.push(data[data.length - 1]);
    return percentiles;
  }

  /**
   * How large part of the data set that consist of outliers.
   *
   * @param {object} data The data to calculate the ratio on.
   * @return {float} the ratio as a float between 0.0 and 1.0
   */
  calculateOutlierRatio(data) {
    return (data.rates.reduce(
      (a, b) => (a + (b.outlier ? 1 : 0)), 0
    ) / data.rates.length);
  }

  /**
   * Fetches the data as parsed by the rates Model
   *
   * @param {string} country Two letter ISO 3166-1 alpha-2 country code.
   * @return {object} with calculated percentiles and statistics.
   */
  getDataForCountry(country) {
    let data = this.prm.ratesByCountry[country];
    if (typeof data === 'undefined') {
      return {};
    }
    return {
      percentiles:  this.getPercentiles(data.rates),
      outlierRatio: this.calculateOutlierRatio(data),
      average:      data.average,
      median:       data.median
    };
  }
}

module.exports = RatesController;
