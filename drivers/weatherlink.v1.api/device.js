'use strict';

const Homey = require('homey');
const fetch = require('node-fetch');

class WeatherLinkV1API extends Homey.Device {

    timerElapsed(device) {
        device.timerID = setTimeout(() => { device.timerElapsed(device) }, device.getSetting('interval') * 1000);

        let measurements =
            [
                { "capability": "measure_temperature", "field": "temp_c" },
                { "capability": "measure_temperature.feelslike", "field": "windchill_c"},
                { "capability": "measure_temperature.dewpoint", "field": "dewpoint_c"},
                { "capability": "measure_humidity", "field": "relative_humidity" },
                { "capability": "measure_pressure", "field": "pressure_mb" },
                { "capability": "measure_wind_angle", "field": "wind_degrees" },
                { "capability": "measure_wind_strength", "factor": 1.61, "field": "wind_mph" },
                { "capability": "measure_gust_strength", "factor": 1.61, "field": "wind_ten_min_gust_mph", "group": "davis_current_observation" },
                { "capability": "measure_rain.rate", "factor": 25.4, "field": "rain_rate_in_per_hr", "group": "davis_current_observation" },
                { "capability": "measure_rain", "factor": 25.4, "field": "rain_day_in", "group": "davis_current_observation" }
            ]

        fetch(device._getUrl(device)).then((response) => {
            response.json().then((json) => {
                measurements.forEach(measurement => {
                    let data = (!measurement.group) ? json : json[measurement.group];
                    if (measurement.capability == "measure_temperature.feelslike") {
                        // if (Number(data.temp_c) <= 16.1) {
                        //     device._updateProperty(measurement.capability, Number(data.windchill_c));
                        // } else if (Number(data.temp_c) >= 21) {
                        //     device._updateProperty(measurement.capability, Number(data.heat_index_c));
                        // } else {
                        //     device._updateProperty(measurement.capability, Number(data.temp_c));
                        // }
                        let thw = device._calculateTHWIndex(Number(data.temp_c), Number(data.relative_humidity), Number(data.wind_mph) * 1.61 / 3.6);
                        device._updateProperty(measurement.capability, thw);
                    } else if (measurement.field in data) {
                        device._updateProperty(measurement.capability, data[measurement.field] * (measurement.factor || 1));
                    }
                });
            });
        }).catch((err) => {
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
                    this.getDriver()._measureTemperatureDewpointChangedTrigger.trigger(this, tokens);
                }
                if (key === 'measure_temperature.feelslike') {
                    let tokens = {
                        "measure_temperature.feelslike": value || 'n/a'
                    }
                    this.getDriver()._measureTemperatureFeelsLikeChangedTrigger.trigger(this, tokens);
                }
                if (key === 'measure_rain.rate') {
                    let tokens = {
                        "measure_rain.rate": value || 'n/a'
                    }
                    this.getDriver()._measureRainRateChangedTrigger.trigger(this, tokens);
                }
            } else {
                this.setCapabilityValue(key, value);
            }
        }
    }

    _calculateTHWIndex(temperature, humidity, windspeed_ms) {
        let e = (humidity / 100) * 6.105 * Math.exp(17.27 * temperature / (237.7 + temperature));
        let thw = temperature + 0.33 * e - 0.70 * windspeed_ms - 4.00;
        return Math.round(thw * 10) / 10;
    }
    
    onInit() {
        this.log('WeatherLink v1 API init');
        this.log('Name:', this.getName());
        this.log('Class:', this.getClass());
        this.log('Interval:', this.getSetting('interval'));

        if (this.hasCapability('measure_temperature.windchill')) {
            this.removeCapability('measure_temperature.windchill');
        }
        if (!this.hasCapability('measure_temperature.feelslike')) {
            this.addCapability('measure_temperature.feelslike');
        }
        if (!this.hasCapability('measure_rain.rate')) {
            this.addCapability('measure_rain.rate');
        }
        if (!this.hasCapability('measure_rain')) {
            this.addCapability('measure_rain');
        }
        if (!this.hasCapability('measure_wind_strength')) {
            this.addCapability('measure_wind_strength');
        }

        var device = this;
        device.timerID = setTimeout(() => { device.timerElapsed(device) }, 1000);
    }

    async onDeleted()
    {
        if (this.timerID) {
            clearTimeout(this.timerID);
        }
        console.log(`Deleted device ${this.getName()}`)
    }
}

module.exports = WeatherLinkV1API;