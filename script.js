//write your code here
const key = '557ecd4b8c8bbba02f4a50afe884934b';
document.querySelector('body').style.fontFamily = 'arial';

/**
 * Grab all elements from the DOM
 */ 
const LOADER$ = document.getElementById('loader');
const LOCATION$ = document.getElementById('weather_location');
const TEMPERATURE$ = document.getElementById('weather_temp');
const DESCRIPTION$ = document.getElementById('weather_description');
const ERROR_TEXT$ = document.getElementById('error_text');
const TABS$ = document.querySelector('#tabs_wrapper');
const INFO_BOX$ = document.querySelector('#weather_infobox');
const SKYCONS$ = new Skycons({ color: "orange" });

let controller;

/** Perfix url with cors-anywhere to circumvent samesite CORS 
 *  Add lat & long as query-params
*/
const url = (lat, lon) => `https://cors-anywhere.herokuapp.com/https://api.darksky.net/forecast/${key}/${lat},${lon}`;

/**
 * Display loading spinner - Hide the res
 */
const showLoader = () => {
  LOADER$.style.display = 'inline-block';
  ERROR_TEXT$.style.display = 'none';
  INFO_BOX$.style.display = 'none';
  SKYCONS$.pause();
};

const hideLoader = () => LOADER$.style.display = 'none';

/**
 * The API returns farenheight so we convert it into celsius 
 */
const Farenheight2Celsius = temp => (((temp - 32) * 5) / 9).toFixed(2);

/**
 * Attaches the data from the API to the respective DOM elements
 */
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
  ERROR_TEXT$.style.padding = '2rem 5rem';
  ERROR_TEXT$.style.width = '60%';
  ERROR_TEXT$.style.marginLeft = '15%';
  ERROR_TEXT$.style.border = '2px red solid';
  ERROR_TEXT$.style.borderRadius = '5px';

  setTimeout(() => ERROR_TEXT$.style.display = 'none', 2000);
}

/**
 * Remove the css class of 'selected' from the last selected element & adds it to the current selected element
 */
const toggleSelectedTab = tab => {
  const selected = document.querySelector('.selected');
  selected.classList.remove('selected');
  selected.dataset.iscurrent = false;

  tab.classList.add('selected');
  tab.dataset.iscurrent = true;
}

/**
 * XHR implementation for fetching the data (with a GET request)
 */
const getWeatherData = (tabName, lat, lon) => {
  const xhr = new XMLHttpRequest();

  xhr.open('GET', url(lat, lon), true);
  
  xhr.responseType = 'json';

  xhr.onload = () => showWeather(xhr.response.currently.temperature, xhr.response.currently.summary, xhr.response.currently.icon, tabName);

  xhr.send();
}

const tabs$ = TABS$;
let tabs = [];

/**
 * a crude way of adding event listeners to the different tabs
 */
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

/**
 * get longitude and latitude wih browser geolocation API
 */
const getCoords = async () => {
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
				showError("Unable to retrieve your location.");
				reject("Unable to retrieve your location.");
			}
		);
	});
}

/**
 * feed the data to our XHR to get the weather at our current coordinates
 */
const getMyLocation = async () => {
  const data = await getCoords();
  getWeatherData(null, data.lat, data.long);
}

getMyLocation();