import { Driver, FlowCardTrigger, FlowCardTriggerDevice } from 'homey';
const fetch = require('node-fetch');

class WeatherLinkDriver extends Driver {
    triggers: {[key: string]: FlowCardTriggerDevice} = {}

    async onInit() {
        super.onInit();

		this.triggers['measure_temperature.dewpoint'] = this.homey.flow.getDeviceTriggerCard('measure_temperature.dewpoint.changed')
        this.triggers['measure_temperature.feelslike'] = this.homey.flow.getDeviceTriggerCard('measure_temperature.feelslike.changed')
        this.triggers['measure_rain.rate'] = this.homey.flow.getDeviceTriggerCard('measure_rain.rate.changed')
    }

    async onPair(session: any) {
        session.setHandler('validate', async (data: any) => {
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