'use strict';

const Homey = require('homey');
const fetch = require('node-fetch');

class WeatherLinkDriver extends Homey.Driver {
    async onInit() {
        super.onInit();

        this._measureTemperatureDewpointChangedTrigger = this.homey.flow.getDeviceTriggerCard('measure_temperature.dewpoint.changed');
        this._measureTemperatureWindchillChangedTrigger = this.homey.flow.getDeviceTriggerCard('measure_temperature.windchill.changed');
    }

    async onPair(session) {
        session.setHandler('validate', async function (data) {
            var errorText = ''

            await fetch(data.url)
            .then((response) => {
                if (response.ok) {
                    return response.text()
                } else {
                    errorText = 'Response not OK'
                }
            })
            .then((data) => {
                const lines = data.split(/\r?\n/);
                if (lines.length == 0 || lines[0] != 'BOF') {
                    errorText = 'Incorrect file format'
                }
            })
            .catch((err) => {
                errorText = 'Incorrect URL'
            });

            if (errorText != '') {
                throw new Error(errorText)
            }
        });
    }

    triggerMeasureTemperatureDewpointChangedFlow(device, tokens) {
        this._measureTemperatureDewpointChangedTrigger.trigger(device, tokens)
            .catch(this.error);
    }

    triggerMeasureTemperatureWindchillChangedFlow(device, tokens) {
        this._measureTemperatureWindchillChangedTrigger.trigger(device, tokens)
            .catch(this.error);
    }

    isCorrectWeatherLinkFile(lines) {
        return true
    }
}

module.exports = WeatherLinkDriver;