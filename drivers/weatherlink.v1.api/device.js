'use strict';

const Homey = require('homey');
const fetch = require('node-fetch');

class WeatherLinkV1API extends Homey.Device {

    timerElapsed(device) {
		device.timerID = setTimeout(function () { device.timerElapsed(device); }, device.getSetting('interval') * 1000);

        let measurements =
			[
				{ "capability": "measure_temperature", "field": "temp_c" },
                { "capability": "measure_temperature.dewpoint", "field": "dewpoint_c"},
                { "capability": "measure_temperature.windchill", "field": "windchill_c"},
                { "capability": "measure_humidity", "field": "relative_humidity" },
                { "capability": "measure_pressure", "field": "pressure_mb" },
                { "capability": "measure_wind_angle", "field": "wind_degrees" },
                { "capability": "measure_wind_strength", "factor": 1.61, "field": "wind_mph" },
	            { "capability": "measure_rain", "field": "rain_day_in", "group": "davis_current_observation" }
    		]

        fetch(device._getUrl(device)).then(function (response) {
            response.json().then(function (json) {
                measurements.forEach(measurement => {
                    let data = (!measurement.group) ? json : json[measurement.group];
                    device._updateProperty(measurement.capability, data[measurement.field] * (measurement.factor || 1));
                });
            });
        }).catch(function (err) {
            console.log(err)
        });
    }

    _getUrl(device) {
        let deviceid = device.getSetting('deviceid');
        let pass = device.getSetting('pass');
        let apitoken = device.getSetting('apitoken');
        return `https://api.weatherlink.com/v1/NoaaExt.json?user=${deviceid}&pass=${pass}&apiToken=${apitoken}`
    }

    _updateProperty(key, value) {
		if (this.hasCapability(key)) {
			let oldValue = this.getCapabilityValue(key);
			if (oldValue !== null && oldValue != value) {
				this.setCapabilityValue(key, value);

                if (key === 'measure_temperature.dewpoint') {
                    let tokens = {
						"measure_temperature.dewpoint": value || 'n/a'
					}
                    this.driver.triggerMeasureTemperatureDewpointChangedFlow(this, tokens);
                }
                if (key === 'measure_temperature.windchill') {
                    let tokens = {
						"measure_temperature.windchill": value || 'n/a'
					}
                    this.driver.triggerMeasureTemperatureWindchillChangedFlow(this, tokens);
                }
            } else {
                this.setCapabilityValue(key, value);
            }
        }
    }
    
	onInit() {
		this.log('WeatherLink v1 API init');
		this.log('Name:', this.getName());
		this.log('Class:', this.getClass());
		this.log('Interval:', this.getSetting('interval'));

        if (!this.hasCapability('measure_temperature.dewpoint')) {
            this.addCapability('measure_temperature.dewpoint');
        }
        if (!this.hasCapability('measure_temperature.windchill')) {
            this.addCapability('measure_temperature.windchill');
        }

		var device = this;
		device.timerID = setTimeout(function () { device.timerElapsed(device); }, 1000);
	}

    async onDeleted()
    {
        if (this.timerID) {
            clearTimeout(this.timerID);
        }
    }
}

module.exports = WeatherLinkV1API;