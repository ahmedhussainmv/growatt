require('dotenv').config({ path: './config.env' });
('use strict');
// const PLANT_ID = process.env.PLANT_ID;
const GROWATT_USERNAME = process.env.GROWATT_USERNAME;
const GROWATT_PASSWORD = process.env.GROWATT_PASSWORD;
const UPDATE_INTERVAL = process.env.UPDATE_INTERVAL;

const api = require('growatt');
const { stat } = require('fs');
const options = {};
const options2 = {
	totalData: false,
	plantData: true,
	weather: false,
	deviceData: false,
	historyLast: false,
};
const growatt = new api({});
let login = null;
const db = {
	plantInfo: {
		plantName: '',
		plantIsland: '',
		plantCountry: '',
		createdDate: '',
	},
	data: [],
};

//time ranges
function getLabels() {
	var x = 5; //minutes interval
	var times = []; // time array
	var tt = 6; // start time
	var ap = ['AM', 'PM']; // AM-PM
	mongod;
	//loop to increment the time and push results in array
	for (var i = 0; tt < 18 * 60 + 5; i++) {
		var hh = Math.floor(tt / 60); // getting hours of day in 0-24 format
		var mm = tt % 60; // getting minutes of the hour in 0-55 format
		// times[i] = ("0" + (hh % 12)).slice(-2) + ':' + ("0" + mm).slice(-2) + ap[Math.floor(hh/12)]; // pushing data in array in [00:00 - 12:00 AM/PM format]
		times[i] = hh + ':' + mm;
	}
	return times;
}

async function growattUpdate() {
	if (!login) {
		await getLogin();
	}
	let getAllPlantData = await growatt.getAllPlantData(options).catch((e) => {
		console.log('ERROR getAllPlantData:', e);
	});
	PLANT_ID = Object.keys(getAllPlantData)[0];

	try {
		const response = getAllPlantData[PLANT_ID]['plantData'];
		const plantData = await getAll();
		console.log(plantData)
		if (response) {
			let data = {
				dateTime: String(String(new Date()).split(' ')[4]).substr(0, 4),
				eToday: plantData['eToday'],
				mToday: Math.round(Number(plantData['mToday']) * 15.42),
				eTotal: plantData['eTotal'],
				mTotal: Math.round(Number(plantData['mTotal']) * 15.42),
			};
			db.data.push(data);
			db.plantInfo = {
				plantName: response.plantName,
				plantIsland: response.city,
				plantCountry: response.country,
				createdDate: response.creatDate,
			};
		}
	} catch (e) {
		console.log(e);
	}
}

async function getLogin() {
	console.log('--->getLogin');
	login = await growatt.login(GROWATT_USERNAME, GROWATT_PASSWORD).catch((e) => {
		console.log('LOGIN ERROR:', e);
	});
	console.log('LOGIN SUCCESS:', login);
	return login;
}
exports.getLogin = getLogin;

exports.getGrowattDb = function () {
	console.log('--->getGrowattDb');
	return {
		data: db.data.slice(-5),
		plantInfo: db.plantInfo,
	};
};

exports.growattInitialize = function () {
	growattUpdate();
	setTimeout(growattUpdate, UPDATE_INTERVAL);
};

async function getAll() {
	console.log('--->getAll');
	if (!login) {
		await getLogin();
	}
	let response = await growatt
		.getAllPlantData({
			totalData: true,
			plantData: false,
			weather: false,
			deviceData: false,
			historyLast: false,
		})
		.catch((e) => {
			console.log(e);
		});
	PLANT_ID = Object.keys(response)[0];
	DEVICE_ID = Object.keys(response[PLANT_ID]['devices'])[0];
	return response[PLANT_ID]['devices'][DEVICE_ID]['totalData']
}
exports.getAll = getAll;
