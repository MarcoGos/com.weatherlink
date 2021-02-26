'use strict';

const Homey = require('homey');
const fetch = require('node-fetch');

class WeatherLinkDriver extends Homey.Driver {
    async onInit() {
        super.onInit();

        this._measureTemperatureDewpointChangedTrigger = new Homey.FlowCardTriggerDevice('measure_temperature.dewpoint.changed')
            .register();
        this._measureTemperatureWindchillChangedTrigger = new Homey.FlowCardTriggerDevice('measure_temperature.windchill.changed')
            .register();
    }

    async onPair(socket) {
        socket.on('validate', (data, callback) => {
            fetch(data.url).then((response) => {
                response.text().then((responseText) => {
                    const lines = responseText.split(/\r?\n/);
                    if (lines.length == 0 || lines[0] != 'BOF') {
                        callback(new Error('Incorrect file format'), null);
                    }
                    callback(null, '');
                })
            }).catch((err) => {
                callback(new Error('Incorrect URL'), null)
            });
        });
    }
}

module.exports = WeatherLinkDriver;