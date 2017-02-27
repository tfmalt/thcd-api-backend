
const fp = require('fs-promise');
const OXRController  = require('./OXRController');

const oxr = new OXRController();

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
    this.oxr = oxr;
    this.rates = [];
    this.ratesByCountry = {};
    this.countryList = [];
    this.percentiles = {};
  }

  /**
   * Called before the server is run.
   * Loads the data from file and calculates the initial outliers.
   *
   * @return {promise} The promise with the complete model data structure
   */
  loadModel() {
    return this.loadDataFromFile()
    .then(this.calculateUSDValues)
    .then(this.organizeDataByCountry)
    .then( (dataByCountry) => {
      let ordered = {};

      for (let key in dataByCountry) {
        if (dataByCountry.hasOwnProperty(key)) {
          let data = dataByCountry[key].rates;
          ordered[key] = this.calculateOutliersInSet(data);
        }
      }

      this.ratesByCountry = ordered;
      return this.ratesByCountry;
    });
  }

  /**
   * Parses through the data set and adds the handling charge as USD to
   * the object
   *
   * @param {array} data The rates data
   * @return {array} The data with usd amount added to each object.
   */
  calculateUSDValues(data) {
    return oxr.getLatest().then( () => {
      return data.map( (item) => {
        item.usd = oxr.exchange({
          currency: item.currency,
          value:   item.value
        });
        return item;
      });
    });
  }

  addItem(data) {
    if (!data.hasOwnProperty('item') || !data.hasOwnProperty('country')) {
      throw new TypeError('argument must be an object with keys for item and country');
    }

    this.rates.push(data.item);

    if (typeof this.ratesByCountry[data.country] === 'undefined') {
      this.ratesByCountry[data.country] = {rates: []};
    }

    this.ratesByCountry[data.country].rates.push(data.item);

    return true;
  }

  /**
   * Since this is a simplified proof of comcept we keep the data in the
   * sample file and only manipulate the model in memory.
   *
   * We could implement serialising the data back to file, and in that way
   * keep the data persistent. Using file based data would scale quite a while.
   *
   * In a production system we would use a database as backend, and have the
   * initial analysis and detection of outliers done on import of the raw
   * data into the backend.
   *
   * @return {Promise} This function retuns a promise.
   */
  loadDataFromFile() {
    return fp.readFile('./lib/data/sample_data.json').then( (data) => {
      this.rates = JSON.parse(data);
      return this.rates;
    }).catch( (error) => {
      throw error;
    });
  }

  /**
   * Takes the raw sample data json and sorts it into an object with the
   * two letter country codes as key.
   *
   * @param {array} data The data structure read from file and parsed.
   * @return {object} The object contain the information organised by country
   */
  organizeDataByCountry(data) {
    // Integrity checking of data always in the beginning of a function.
    // More and better assertions and integrity checks should be done in
    // production code.
    if (!(data instanceof Array)) {
      throw new TypeError('Argument must be an array with objects');
    }

    let byCountry = {};

    for (let item of data) {
      let country = item.port.substr(0, 2);

      if (typeof byCountry[country] === 'undefined') {
        byCountry[country] = {rates: []};
      }

      byCountry[country].rates.push(item);
    }

    return byCountry;
  }

  /**
   * Two straight forward approaches to calculate the outliers come to mind:
   * - Assume some normal distribution in the rates and decide on some
   *   arbritary cut of point in the sorted set of data based on percentiles.
   *   Say remove the 10-20 percent of data that is on either end of the
   *   spectrum.
   * - Base the cut of point on deviation from the median or average value
   *   in the set, say +/- 20% of the average value. And mark values outside
   *   this as outliers.
   *
   * Either way we should have a set sorted by value (USD amount) and calculate
   * the average with the most extreme values removed.
   *
   * Also correlation between the median and average value would give us an
   * indicator of the consitency and potential quality of the data.
   *
   * @param {array} data The set to calcuate outliers on
   * @return {array} The set after sorting and calculation of outliers.
   */
  calculateOutliersInSet(data) {
    let sorted = data.sort( (a, b) => (a.usd - b.usd) );

    let median  = data[Math.round(data.length * 0.5)].usd;
    let average = this.getAverageOfSet(sorted);

    let rates = sorted.map( (item) => {
      item.outlier = this.isOutlier(item.usd, average);
      return item;
    });

    return {rates, average, median};
  }

  /**
   * Boolean returns if value is considered outlier or not
   *
   * @param {float} value Value to be concidered.
   * @param {float} average Value to be measured against.
   * @return {boolean} Is it an outlier.
   */
  isOutlier(value, average) {
    if (value > (average * 1.2) || value < (average * 0.8)) {
      return true;
    }

    return false;
  }

  /**
   * calcuate average USD rate of the 70% most consistant data points
   *
   * @param {array} data List of items to calculate average from
   * @return {float} The average as a float with four decimals
   */
  getAverageOfSet(data) {
    let start = Math.round(data.length * 0.15);
    let end   = Math.round(data.length * 0.85);
    let slice = data.slice(start, end);

    // Limit ourselves to an accuracy of four cecimals to match what is returned
    // from the currency exchange function
    let sum = slice.reduce( (a, b) => (a + b.usd), 0);
    return parseFloat((sum / slice.length).toFixed(4));
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
