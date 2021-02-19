'use strict';

const Homey = require('homey');

class WeatherLink extends Homey.App {
  /**
   * onInit is called when the app is initialized.
   */
  async onInit() {
    this.log('WeatherLink has been initialized');
  }
}

module.exports = WeatherLink;