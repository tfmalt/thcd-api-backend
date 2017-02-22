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
    // base our cut of points on deviation from the median based on percentiles
    return {
      first:  data[0],
      10:     data[Math.round(data.length * 0.1)],
      20:     data[Math.round(data.length * 0.2)],
      median: data[Math.round(data.length * 0.5)],
      80:     data[Math.round(data.length * 0.8)],
      90:     data[Math.round(data.length * 0.9)],
      last:   data[data.length - 1]
    };
  }

  /**
   * Fetches the data as parsed by the rates Model
   *
   * @param {string} country Two letter ISO 3166-1 alpha-2 country code.
   * @return {object} the data structure sorted by default array sort.
   */
  getDataForCountry(country) {
    return this.prm.ratesByCountry[country];
  }
}

module.exports = RatesController;
