
const fp = require('fs-promise');

class PortRatesModel {
  constructor() {
    this.rates = '';
    this.ratesByCountry = {};

    // constructing to be done here.
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
}

module.exports = PortRatesModel;
