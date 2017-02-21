
const fp = require('fs-promise');

/**
 * A naive Proof of Concept data "model" backend for Container handling
 * charges, just using the data file as source.
 *
 * To be implemented are things like percistance and a lot of assertions and
 * integrity checks. In a production system the data would be imported to a
 * database backend.
 */
class PortRatesModel {
  constructor() {
    this.rates = '';
    this.ratesByCountry = {};
    this.countryList = [];

    fp.readFile('./lib/data/sample_data.json').then( (data) => {
      this.rates = JSON.parse(data);
      return this.rates;
    }).then( (data) => {
      this.ratesByCountry = this.parseData(data);
      return this.ratesByCountry;
    }).catch( (error) => {
      throw error;
    });
  }

  /**
   * Takes the raw sample data json and sorts it into an object with the
   * two letter country codes as key.
   *
   * @param {object} json The data structure read from file and parsed.
   * @return {object} The object contain the information organised by country
   */
  parseData(json) {
    // Integrity checking of data always in the beginning of a function.
    // More and better assertions and integrity checks should be done in
    // production code.
    if (!(json instanceof Array)) {
      throw new TypeError('Argument must be an array with objects');
    }

    let byCountry = {};
    for (let item of json) {
      let country = item.port.substr(0, 2);
      if (typeof byCountry[country] === 'undefined') {
        byCountry[country] = [];
      }

      byCountry[country].push(item);
    }

    return byCountry;
  }

  /**
   * Getter just returns the list of countries seen in the data as an array.
   *
   * @return {array} The list of countries
   */
  get countries() {
    return Object.keys(this.ratesByCountry);
  }

}

module.exports = PortRatesModel;
