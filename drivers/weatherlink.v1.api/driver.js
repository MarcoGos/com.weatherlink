'use strict';

const Homey = require('homey');
const fetch = require('node-fetch');

class WeatherLinkV1APIDriver extends Homey.Driver {
    async onInit() {
        super.onInit();

        this._measureTemperatureDewpointChangedTrigger = new Homey.FlowCardTriggerDevice('measure_temperature.dewpoint.changed')
            .register();
        this._measureTemperatureFeelsLikeChangedTrigger = new Homey.FlowCardTriggerDevice('measure_temperature.feelslike.changed')
            .register();
        this._measureRainRateChangedTrigger = new Homey.FlowCardTriggerDevice('measure_rain.rate.changed')
            .register();
    }

    async onPair(socket) {
        socket.on('validate', (data, callback) => {
            const url = `https://api.weatherlink.com/v1/NoaaExt.json?user=${data.deviceid}&pass=${data.pass}&apiToken=${data.apitoken}`
            fetch(url).then((response) => {
                response.json().then((json) => {
                    if ('temp_c' in json) {
                        callback(null, '');
                    } else {
                        callback(new Error('Incorrect file format'), null);
                    }
                }).catch((err) => {
                    callback(new Error(err), null);
                });
            }).catch((err) => {
                console.log(err);
                callback(new Error(err), null)
            });
        });
    }
}

module.exports = WeatherLinkV1APIDriver;