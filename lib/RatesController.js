
const fp = require('fs-promise');

class RatesController {
  constructor() {
    this.rates = '';
    // constructing to be done here.
    fp.readFile('./lib/data/sample_data.json').then( (data) => {
      this.rates = JSON.parse(data);
      return this.rates;
    }).then( (data) => {
      this.parseData(data);
    }).catch( (error) => {
      throw error;
    });
  }

  parseData(json) {
    if (!(json instanceof Array)) {
      throw new TypeError('Argument must be an array with objects');
    }

    const byCountry = json.map( (item) => {

    });
    return true;
  }
}

module.exports = RatesController;
