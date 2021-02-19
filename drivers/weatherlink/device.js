'use strict';

const Homey = require('homey');
const fetch = require('node-fetch');

class MyDevice extends Homey.Device {

    timerElapsed(device) {
		setTimeout(function () { device.timerElapsed(device); }, device.getSetting('interval') * 1000);

        let measurements =
			[
				{ "device": "measure_temperature", "field": "outsideTemp" },
                { "device": "measure_pressure", "field": "barometer" },
                { "device": "measure_humidity", "field": "outsideHumidity" },
	            { "device": "measure_rain", "field": "dailyRain" },
                { "device": "measure_wind_angle", "field": "windDir" },
                { "device": "measure_wind_strength", "field": "windSpeed" }
    		]

        fetch(device.getSetting('url')).then(function (response) {
            response.text().then(function (data) {
                const lines = data.split(/\r?\n/);
                const properties = {}
                lines.forEach((line) => {
                    let res = line.match(/^\$([^ ]*) = " ?(.*)";$/)
                    if (res) {
                        var [,property,value] = res
                        if (property && value && value != '---') {
                            if (isNaN(value))
                                properties[property] = value
                            else
                                properties[property] = Number(value)
                        }
                    }
                });

                measurements.forEach(measurement => {
                    device._updateProperty(measurement.device, properties[measurement.field]);
                });

            });
        }).catch(function (err) {
            console.log(err)
        });
    }

    _updateProperty(key, value) {
		if (this.hasCapability(key)) {
			let oldValue = this.getCapabilityValue(key);
			if (oldValue !== null && oldValue != value) {
				this.setCapabilityValue(key, value);
            } else {
                this.setCapabilityValue(key, value);
            }
        }
    }
    
	onInit() {
		this.log('WeatherLink init');
		this.log('Name:', this.getName());
		this.log('Class:', this.getClass());
		this.log('Url:', this.getSetting('url'));
		this.log('Interval:', this.getSetting('interval'));

        if (!this.hasCapability('measure_pressure')) {
            this.addCapability('measure_pressure');
        }

        if (!this.hasCapability('measure_rain')) {
            this.addCapability('measure_rain');
        }

        if (this.hasCapability('measure_gust_strength')) {
            this.removeCapability('measure_gust_strength');
        }

        if (this.hasCapability('measure_gust_angle')) {
            this.removeCapability('measure_gust_angle');
        }

		var device = this;
		setTimeout(function () { device.timerElapsed(device); }, 1000);
	}
}

module.exports = MyDevice;