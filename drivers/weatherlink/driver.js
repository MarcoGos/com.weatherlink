'use strict';

const Homey = require('homey');
const fetch = require('node-fetch');

class WeatherLinkDriver extends Homey.Driver {
    async onInit() {
        super.onInit();

        this._measureTemperatureDewpointChangedTrigger = this.homey.flow.getDeviceTriggerCard('measure_temperature.dewpoint.changed')
        this._measureTemperatureFeelsLikeChangedTrigger = this.homey.flow.getDeviceTriggerCard('measure_temperature.feelslike.changed')
        this._measureRainRateChangedTrigger = this.homey.flow.getDeviceTriggerCard('measure_rain.rate.changed')
    }

    triggerMeasureTemperatureDewpointChangedFlow(device, tokens) {
        this._measureTemperatureDewpointChangedTrigger.trigger(device, tokens)
            .catch(this.error);
    }


    triggerMeasureTemperatureFeelsLikeChangedFlow(device, tokens) {
        this._measureTemperatureFeelsLikeChangedTrigger.trigger(device, tokens)
            .catch(this.error);
    }

    triggerMeasureRainRateChangedFlow(device, tokens) {
        this._measureRainRateChangedTrigger.trigger(device, tokens)
            .catch(this.error);
    }


    async onPair(session) {
        session.setHandler('validate', async (data) => {
            try {
                const response = await fetch(data.url)
                if (!response.ok) {
                    throw new Error('Incorrect URL')
                }
                const responseText = await response.text()
                const lines = responseText.split(/\r?\n/);
                if (lines.length == 0 || lines[0] != 'BOF') {
                    throw new Error('Incorrect file format')
                }
            } catch(error) {
                throw new Error(error.message)
            }
        });
    }
}

module.exports = WeatherLinkDriver;