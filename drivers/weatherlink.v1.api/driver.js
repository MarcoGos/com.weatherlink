'use strict';

const Homey = require('homey');
const fetch = require('node-fetch');

class WeatherLinkV1APIDriver extends Homey.Driver {
    async onInit() {
        super.onInit();

        this._measureTemperatureDewpointChangedTrigger = this.homey.flow.getDeviceTriggerCard('measure_temperature.dewpoint.changed');
        this._measureTemperatureWindchillChangedTrigger = this.homey.flow.getDeviceTriggerCard('measure_temperature.windchill.changed');
    }

    triggerMeasureTemperatureDewpointChangedFlow(device, tokens) {
        this._measureTemperatureDewpointChangedTrigger.trigger(device, tokens)
            .catch(this.error);
    }

    triggerMeasureTemperatureWindchillChangedFlow(device, tokens) {
        this._measureTemperatureWindchillChangedTrigger.trigger(device, tokens)
            .catch(this.error);
    }

    async onPair(session) {
        session.setHandler('validate', async function (data) {
            var errorText = ''
            const url = `https://api.weatherlink.com/v1/NoaaExt.json?user=${data.deviceid}&pass=${data.pass}&apiToken=${data.apitoken}`
            await fetch(url)
            .then((response) => {
                console.log(response)
                if (response.ok) {
                    return response.json()
                } else {
                    errorText = response.errorText
                }
            })
            .catch((err) => {
                errorText = err
            });

            if (errorText != '') {
                throw new Error(errorText)
            }
        });
    }
}

module.exports = WeatherLinkV1APIDriver;