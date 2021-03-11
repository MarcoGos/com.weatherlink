'use strict';

const Homey = require('homey');
const fetch = require('node-fetch');

class WeatherLinkV1APIDriver extends Homey.Driver {
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
            var errorText = ''
            const url = `https://api.weatherlink.com/v1/NoaaExt.json?user=${data.deviceid}&pass=${data.pass}&apiToken=${data.apitoken}`
            try {
                const response = await fetch(url)
                if (!response.ok) {
                    throw new Error('Incorrect URL')
                }
                const json = await response.json();
                console.log(json)
                if (!('temp_c' in json)) {
                    throw new Error('Incorrect file format')
                }
            } catch(error) {
                throw new Error(error.message)
            }
    });
    }
}

module.exports = WeatherLinkV1APIDriver;