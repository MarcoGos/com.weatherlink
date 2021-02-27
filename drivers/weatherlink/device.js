'use strict';

const Homey = require('homey');
const fetch = require('node-fetch');

class WeatherLink extends Homey.Device {

    timerElapsed(device) {
        device.timerID = setTimeout(() => { device.timerElapsed(device); }, device.getSetting('interval') * 1000);

        let measurements =
            [
                { "capability": "measure_temperature", "field": "outsideTemp" },
                { "capability": "measure_temperature.dewpoint", "field": "outsideDewPt"},
                { "capability": "measure_temperature.feelslike", "field": "windChill"},
                { "capability": "measure_pressure", "field": "barometer" },
                { "capability": "measure_humidity", "field": "outsideHumidity" },
                { "capability": "measure_rain", "field": "dailyRain" },
                { "capability": "measure_wind_angle", "field": "windDir" },
                { "capability": "measure_wind_strength", "field": "windSpeed" }
            ]

        fetch(device.getSetting('url')).then((response) => {
            response.text().then((data) => {
                const properties = device._convertRawTextToProperties(data);
                measurements.forEach(measurement => {
                    if (measurement.field == 'windChill') {
                        if (properties.outsideTemp <= 16.1) {
                            device._updateProperty(measurement.capability, properties.windChill);
                        } else if (properties.outsideTemp >= 21) {
                            device._updateProperty(measurement.capability, properties.outsideHeatIndex);
                        } else {
                            device._updateProperty(measurement.capability, properties.outsideTemp);
                        }
                    } else if (measurement.field in properties) {
                        device._updateProperty(measurement.capability, properties[measurement.field]);
                    }
                });
            });
        }).catch((err) => {
            console.log(err)
        });
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
            } else {
                this.setCapabilityValue(key, value);
            }
        }
    }

    _convertRawTextToProperties(data) {
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
        return properties
    }
        
    onInit() {
        this.log('WeatherLink init');
        this.log('Name:', this.getName());
        this.log('Class:', this.getClass());
        this.log('Url:', this.getSetting('url'));
        this.log('Interval:', this.getSetting('interval'));

        if (this.hasCapability('measure_temperature.windchill')) {
            this.removeCapability('measure_temperature.windchill');
        }
        if (!this.hasCapability('measure_temperature.feelslike')) {
            this.addCapability('measure_temperature.feelslike');
        }

        var device = this;
        device.timerID = setTimeout(() => { device.timerElapsed(device); }, 1000);
    }

    async onDeleted()
    {
        if (this.timerID)
        {
            clearTimeout(this.timerID);
        }
        console.log(`Deleted device ${this.getName()}`)
    }
}

module.exports = WeatherLink;