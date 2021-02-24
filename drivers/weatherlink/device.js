'use strict';

const Homey = require('homey');
const fetch = require('node-fetch');

class WeatherLink extends Homey.Device {

    timerElapsed(device) {
        device.timerID = setTimeout(function () { device.timerElapsed(device); }, device.getSetting('interval') * 1000);

        let measurements =
            [
                { "capability": "measure_temperature", "field": "outsideTemp" },
                { "capability": "measure_temperature.dewpoint", "field": "outsideDewPt"},
                { "capability": "measure_temperature.windchill", "field": "windChill"},
                { "capability": "measure_pressure", "field": "barometer" },
                { "capability": "measure_humidity", "field": "outsideHumidity" },
                { "capability": "measure_rain", "field": "dailyRain" },
                { "capability": "measure_wind_angle", "field": "windDir" },
                { "capability": "measure_wind_strength", "field": "windSpeed" }
            ]

        fetch(device.getSetting('url')).then(function (response) {
            response.text().then(function (data) {
                const properties = device._convertRawTextToProperties(data);
                measurements.forEach(measurement => {
                    if (properties[measurement.field]) {
                        device._updateProperty(measurement.capability, properties[measurement.field]);
                    }
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

        if (!this.hasCapability('measure_pressure')) {
            this.addCapability('measure_pressure');
        }

        if (!this.hasCapability('measure_rain')) {
            this.addCapability('measure_rain');
        }
        
        if (!this.hasCapability('measure_temperature.dewpoint')) {
            this.addCapability('measure_temperature.dewpoint');
        }
        if (!this.hasCapability('measure_temperature.windchill')) {
            this.addCapability('measure_temperature.windchill');
        }

        if (this.hasCapability('measure_gust_strength')) {
            this.removeCapability('measure_gust_strength');
        }

        if (this.hasCapability('measure_gust_angle')) {
            this.removeCapability('measure_gust_angle');
        }

        var device = this;
        device.timerID = setTimeout(function () { device.timerElapsed(device); }, 1000);
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