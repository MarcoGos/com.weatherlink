import { Driver, FlowCardTrigger, FlowCardTriggerDevice } from 'homey';
const fetch = require('node-fetch');

class WeatherLinkV1APIDriver extends Driver {
  triggers: {[key: string]: FlowCardTriggerDevice} = {}

  async onInit() {
    super.onInit();

    this.triggers['measure_temperature.dewpoint'] = this.homey.flow.getDeviceTriggerCard('measure_temperature.dewpoint.changed')
    this.triggers['measure_temperature.feelslike'] = this.homey.flow.getDeviceTriggerCard('measure_temperature.feelslike.changed')
    this.triggers['measure_rain.rate'] = this.homey.flow.getDeviceTriggerCard('measure_rain.rate.changed')
  }

  async onPair(session: any) {
    session.setHandler('validate', async (data: {deviceid: string, pass: string, apitoken: string}) => {
        var errorText = ''
        const url = `https://api.weatherlink.com/v1/NoaaExt.json?user=${data.deviceid}&pass=${data.pass}&apiToken=${data.apitoken}`
        try {
            const response = await fetch(url)
            if (!response.ok) {
                throw new Error('Incorrect URL')
            }
            const json = await response.json();
            // console.log(json)
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