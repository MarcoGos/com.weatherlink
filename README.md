# WeatherLink
This app displays information from you personal weather station by either using a data file url of by
using the WeatherLink cloud.

## Installation
There are two drivers. One for displaying information gotten from a url pointing to a Weatherlink
data file (old school). The second driver connects to the WeatherLink.com cloud via an API token v1.

## Devices
This app contains two device drivers.

## weatherlink
Driver Weatherlink is for data retrieval via a url pointing to a WeatherLink data file. The file format is plain text with on every line a single variable and it's value. The file start with the line "BOF" and ends with "EOF". The line format is '$\<var> = "\<value>";'. For example '$outsideTemp = "12.8";' is the variable for the outside temperature.

## weatherlink.v1.api
Driver Weatherlink.v1.api is for data retrieval via the Weaterlink.com cloud. You need to provide a Device ID (DID), Password (account owner) and API Token (see below).

## Where can I find the Device ID?
As I (developer) do not use the cloud solution I'm not sure where to find the Device ID. Most likely you'll find the Device ID when you login to the weatherlink.com website. The Device ID looks like "001D0A00DE6A".

## How to get an API v1 Token?
Log in to WeatherLink.com with your account. Go to [account information](https://www.weatherlink.com/account). There you will find a part about the API token v1. Press "Generate New v1 Token".