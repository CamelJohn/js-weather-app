//write your code here
"use strict";
document.querySelector('body').style.fontFamily = 'arial';

const testLat = '32.085300';
const testLon = '34.781769';
const testCityName = 'Tel Aviv';
const testCelcius = `30 &#8451;`;
const testWeather = 'Sunny';

const farenheight = '&#8457;';
const celsius = '&#8451;';

const LOADER$ = document.getElementById('loader');
const LOCATION$ = document.getElementById('weather_location');
const TEMPERATURE$ = document.getElementById('weather_temp');
const DESCRIPTION$ = document.getElementById('weather_description');
const ERROR_TEXT$ = document.getElementById('error_text');
const TABS$ = document.querySelector('#tabs_wrapper');
const INFO_BOX$ = document.querySelector('#weather_infobox');
const SKYCONS$ = new Skycons({ color: "orange" });

let controller;

const url = (lat, lon) => `https://cors-anywhere.herokuapp.com/https://api.darksky.net/forecast/557ecd4b8c8bbba02f4a50afe884934b/${lat},${lon}`;

const showLoader = () => {
  LOADER$.style.display = 'inline-block';
  ERROR_TEXT$.style.display = 'none';
  INFO_BOX$.style.display = 'none';
  SKYCONS$.pause();
};

const hideLoader = () => LOADER$.style.display = 'none';

const Farenheight2Celsius = temp => (((temp - 32) * 5) / 9).toFixed(2);

const showWeather = (temp, desc, icon, location) => {
  LOCATION$.textContent = location || 'My Location';
  TEMPERATURE$.textContent = Farenheight2Celsius(temp);
  DESCRIPTION$.textContent = desc;
  SKYCONS$.set("weather_icon", icon);
  SKYCONS$.play();

  hideLoader();
  INFO_BOX$.style.display = 'block';
}

const showError = error => {
  hideLoader();
  ERROR_TEXT$.textContent = error;
  ERROR_TEXT$.style.display = "block";
  ERROR_TEXT$.style.color = 'red';
  ERROR_TEXT$.style.backgroundColor = 'lightsalmon';
  ERROR_TEXT$.style.padding = '2rem 20rem';
  ERROR_TEXT$.style.border = '2px red solid';
  ERROR_TEXT$.style.borderRadius = '5px';
}

const changeWeatherDescription = description => DESCRIPTION$.textContent = description;

const toggleSelectedTab = tab => {
  const selected = document.querySelector('.selected');
  selected.classList.remove('selected');
  selected.dataset.iscurrent = false;

  tab.classList.add('selected');
  tab.dataset.iscurrent = true;
}

const toggleErrorText = error => {
  ERROR_TEXT$.style.display = 'inline-block';
  ERROR_TEXT$.style.color = 'red';
  ERROR_TEXT$.style.fontFamily = 'arial';
  ERROR_TEXT$.style.backgroundColor = 'lightsalmon';
  ERROR_TEXT$.style.padding = '2rem 0';
  ERROR_TEXT$.style.border = '2px red solid';
  ERROR_TEXT$.style.borderRadius = '5px';
  ERROR_TEXT$.innerText = error;
}

const getWeatherData = (tabName, lat, lon) => {
  const xhr = new XMLHttpRequest();

  xhr.open('GET', url(lat, lon), true);
  
  xhr.responseType = 'json';

  xhr.onload = () => {

    const { summary, temperature, icon } = xhr.response.currently;
    showWeather(temperature, summary, icon, tabName);
  }

  xhr.send();
}

const tabs$ = TABS$;
let tabs = [];

tabs$.childNodes.forEach(tab => tab.nodeType != Node.TEXT_NODE ? tabs = [...tabs, tab] : null );
tabs.forEach(tab => tab.addEventListener('click', async () => {
  if (tab === document.querySelector('.selected')) return;

  showLoader();
  toggleSelectedTab(tab);
  if (controller) {
    controller.abort();
  }
  controller = new AbortController();

  let lat = tab.dataset.lat;
  let long = tab.dataset.long;
  if (!tab.dataset.lat) {
    const location = await getCoords();
    lat = location.lat;
    long = location.long;
  }

  getWeatherData(tab.innerText, lat, long);
}));


async function getCoords() {
	if (!navigator.geolocation) {
		throw new Error("Current location disabled due to browser limitation");
	}
	return new Promise((resolve, reject) => {
		navigator.geolocation.getCurrentPosition(
			async (position) => {
				const lat = position.coords.latitude.toFixed(6);
				const long = position.coords.longitude.toFixed(6);
				resolve({ lat, long });
			},
			() => {
				showError("Unable to retrieve your location");
				reject("Unable to retrieve your location");
			}
		);
	});
}

const handleFetch = (lat, long, signal) => {
  getWeatherData(null, lat, long);
}

// controller = new AbortController();

const getMyLocation = async () => {
  const data = await getCoords();
  getWeatherData(null, data.lat, data.long);
}

getMyLocation();