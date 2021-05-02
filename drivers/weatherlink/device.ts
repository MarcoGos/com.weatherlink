import { Device } from 'homey';
const fetch = require('node-fetch');

class WeatherLink extends Device {
    timerID!: NodeJS.Timeout

    async onInit() {
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
        device.timerID = setTimeout(() => { device.timerElapsed(device); }, 1000);
    }

    async onDeleted() {
        if (this.timerID)
        {
            clearTimeout(this.timerID);
        }
        console.log(`Deleted device ${this.getName()}`)
    }

    async timerElapsed(device: WeatherLink) {
        device.timerID = setTimeout(() => { device.timerElapsed(device); }, device.getSetting('interval') * 1000);

        let measurements =
            [
                { "capability": "measure_temperature", "field": "outsideTemp" },
                { "capability": "measure_temperature.feelslike", "field": "windChill"},
                { "capability": "measure_temperature.dewpoint", "field": "outsideDewPt"},
                { "capability": "measure_humidity", "field": "outsideHumidity" },
                { "capability": "measure_pressure", "field": "barometer" },
                { "capability": "measure_wind_angle", "field": "windDir" },
                { "capability": "measure_wind_strength", "field": "wind10Avg" },
                { "capability": "measure_gust_strength", "field": "windSpeed" },
                { "capability": "measure_rain.rate", "field": "rainRate" },
                { "capability": "measure_rain", "field": "dailyRain" }
            ]

        fetch(device.getSetting('url'))
            .then((response: { text: () => any }) => response.text())
            .then((data: string) => {
                const properties = device._convertRawTextToProperties(data)
                measurements.forEach(measurement => {
                    if (measurement.capability == 'measure_temperature.feelslike') {
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
            })
            .catch((error: Error) => {
                console.log(error)
            })
    }

    _updateProperty(key: string, value: string|number) {
        if (this.hasCapability(key)) {
            this.setCapabilityValue(key, value);
            let oldValue = this.getCapabilityValue(key);
            if (oldValue !== null && oldValue != value) {
                let tokens: {[key: string]: string|number} = {}
                tokens[key] = value;
                let triggerCard = this.driver.triggers[key];
                if (triggerCard !== undefined) {
                    triggerCard.trigger(this, tokens)
                        .catch(this.error)
                }
            }
        }
    }

    _convertRawTextToProperties(data: string) {
        const lines = data.split(/\r?\n/);
        let properties: {[key: string]: string|number} = {}
        lines.forEach((line: string) => {
            let res = line.match(/^\$([^ ]*) = " ?(.*)";$/)
            if (res) {
                var [,property,value] = res
                if (property && value && value != '---') {
                    if (isNaN(value as any))
                        properties[property] = value
                    else
                        properties[property] = Number(value)
                }
            }
        });
        return properties
    }
}

module.exports = WeatherLink;
function res(res: any, arg1: any) {
    throw new Error('Function not implemented.');
}

