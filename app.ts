import sourceMapSupport from 'source-map-support';
sourceMapSupport.install();

import Homey from 'homey';

class WeatherLink extends Homey.App {
  async onInit(): Promise<void> {
    this.log('WeatherLink has been initialized');
  }
}

module.exports = WeatherLink;