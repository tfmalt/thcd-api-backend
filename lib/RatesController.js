const OXRController  = require('./OXRController');
const PortRatesModel = require('./PortRatesModel');

class RatesController {
  constructor() {
    this.oxr = new OXRController();
    this.prm = new PortRatesModel();
  }

  get countries() {
    return this.prm.countries;
  }

  distribution(country) {
    let data = this.prm.ratesByCountry[country];

    data = data.map( (item) => {
      item.usd_amount = this.oxr.exchange({
        currency: item.currency,
        amount:   item.value
      });

      return item;
    });

    data = data.sort( (a, b) => {
      return a.usd_amount - b.usd_amount;
    });

    // base our cut of points on deviation from the median based on percentiles
    let percentiles = {
      first:  data[0],
      10:     data[Math.round(data.length * 0.1)],
      20:     data[Math.round(data.length * 0.2)],
      median: data[Math.round(data.length * 0.5)],
      80:     data[Math.round(data.length * 0.8)],
      90:     data[Math.round(data.length * 0.9)],
      last:   data[data.length - 1]
    };

    let average = parseFloat(
      (data.reduce(
        (acc, value) => (acc + value.usd_amount), 0
      ) / data.length).toFixed(4)
    );

    return {percentiles, data, average};
  }
}

module.exports = RatesController;
