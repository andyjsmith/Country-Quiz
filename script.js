// Globals
var gameData = {
	gamemode: "normal",
	timeTrialDuration: 300,
	showElapsedTime: false,
	hardMode: {
		hideHoverHighlight: false,
		hideFoundCountryHighlights: false,
		hideCountryBorders: false,
	},
};

let score = 0;
let randomCountryName;
let gameOver = false;
let numCountries = 0;
let completedCountries = [];
let timeStarted;
let timeInterval;

// Get a reference to elements
const gameModeNormal = document.getElementById("gamemode-normal");
const gameModeLearning = document.getElementById("gamemode-learning");
const gameModeTimeTrial = document.getElementById("gamemode-timetrial");
const gameModeExploration = document.getElementById("gamemode-exploration");
const gameModeDescription = document.getElementById("gamemode-description");
const scoreLine = document.getElementById("score-line");
const scoreBox = document.getElementById("score-box");
const timeLine = document.getElementById("time");
const gameOverDialog = document.getElementById("game-over");
const gameOverText = document.getElementById("game-over-text");

// Get a cookie's value
function getCookie(name) {
	var c = document.cookie.match("(^|;)\\s*" + name + "\\s*=\\s*([^;]+)");
	return c ? c.pop() : undefined;
}

// Load the gameData object from a cookie
function loadGameData() {
	const cookie = getCookie("gamedata");
	if (cookie == undefined) {
		return;
	}
	const decoded = atob(cookie);
	gameData = JSON.parse(decoded);
}

// Save the gameData object to a cookie
function saveGameData() {
	const json = JSON.stringify(gameData);
	const encoded = btoa(json);
	document.cookie = `gamedata=${encoded}`;
}

// Delete the gamedata cookie
function deleteGameData() {
	if (confirm("All game data and settings will be deleted. Continue?")) {
		document.cookie = "gamedata=; Max-Age=-99999999;";
		location.reload();
	}
}

// Populate the settings dialog from gameData
function populateSettingsDialog() {
	// Game mode
	if (gameData.gamemode == "normal") {
		gameModeNormal.checked = true;
	} else if (gameData.gamemode == "learning") {
		gameModeLearning.checked = true;
	} else if (gameData.gamemode == "timetrial") {
		gameModeTimeTrial.checked = true;
	} else if (gameData.gamemode == "exploration") {
		gameModeExploration.checked = true;
	}

	// Time trial
	document.getElementById("timetrial-duration-minutes").value = Math.floor(
		gameData.timeTrialDuration / 60
	);
	document.getElementById("timetrial-duration-seconds").value =
		gameData.timeTrialDuration % 60;

	// Options
	document.getElementById("show-time-checkbox").checked =
		gameData.showElapsedTime;

	// Hard mode
	document.getElementById("hide-hovered-country-highlights").checked =
		gameData.hardMode.hideHoverHighlight;
	document.getElementById("hide-found-country-highlights").checked =
		gameData.hardMode.hideFoundCountryHighlights;
	document.getElementById("hide-country-borders").checked =
		gameData.hardMode.hideCountryBorders;
}

// Save the settings dialog to gameData
function saveSettingsDialog() {
	// Game mode
	let gamemodeEl = document.querySelector('input[name="gamemode"]:checked');
	if (gamemodeEl) {
		gameData.gamemode = gamemodeEl.value;
	}

	// Time trial
	let timeTrialDurationMinutes = parseInt(
		document.getElementById("timetrial-duration-minutes").value
	);
	let timeTrialDurationSeconds = parseInt(
		document.getElementById("timetrial-duration-seconds").value
	);
	gameData.timeTrialDuration =
		timeTrialDurationMinutes * 60 + timeTrialDurationSeconds;

	// Options
	gameData.showElapsedTime =
		document.getElementById("show-time-checkbox").checked;

	// Hard mode
	gameData.hardMode.hideHoverHighlight = document.getElementById(
		"hide-hovered-country-highlights"
	).checked;
	gameData.hardMode.hideFoundCountryHighlights = document.getElementById(
		"hide-found-country-highlights"
	).checked;
	gameData.hardMode.hideCountryBorders = document.getElementById(
		"hide-country-borders"
	).checked;
}

// Set the score variable and score display to a new score
function updateScore(newScore) {
	score = newScore;
	document.getElementById("score").innerText = score + " / " + numCountries;
}

function nextCountry() {
	if (shuffledCountries.length === 0) {
		currentCountryName = "";
	} else {
		currentCountryName = shuffledCountries.pop();
	}
	setCountryDisplay(currentCountryName);
}

// Set the country display
function setCountryDisplay(country) {
	if (country === null) {
		scoreBox.style.opacity = "0";
	} else {
		scoreBox.style.opacity = "1";
		document.getElementById("country-name").innerHTML = country;
	}
}

// Settings dialog
var settingsBox = document.getElementById("settings");

var settingsBtn = document.getElementById("settings-btn");
settingsBtn.addEventListener("click", function () {
	settingsBox.classList.add("show");
});

var settingsCloseBtn = document.getElementById("settings-close-btn");
settingsCloseBtn.addEventListener("click", function () {
	settingsBox.classList.remove("show");
});

var settingsSaveBtn = document.getElementById("settings-save-btn");
settingsSaveBtn.addEventListener("click", function () {
	settingsBox.classList.remove("show");

	// Save the game settings
	saveSettingsDialog();
	saveGameData();
	location.reload();
});

// About dialog
var aboutBox = document.getElementById("about");

var aboutBtn = document.getElementById("about-btn");
aboutBtn.addEventListener("click", function () {
	aboutBox.classList.add("show");
});

var aboutCloseBtn = document.getElementById("about-close-btn");
aboutCloseBtn.addEventListener("click", function (e) {
	aboutBox.classList.remove("show");
});

// Function to update the description based on the selected game mode
function gameModeChanged() {
	if (gameModeNormal.checked) {
		gameModeDescription.innerHTML =
			"An incorrect guess results in a game over.";
	} else if (gameModeLearning.checked) {
		gameModeDescription.innerHTML = "There is no punishment for failures.";
	} else if (gameModeTimeTrial.checked) {
		gameModeDescription.innerHTML =
			"A timer is added. You must find all countries before the time runs out.";
	} else if (gameModeExploration.checked) {
		gameModeDescription.innerHTML =
			"There is no game or score, just explore the world.";
	}
}

// Listen for changes in the game mode input elements and update the description accordingly
gameModeNormal.addEventListener("change", gameModeChanged);
gameModeLearning.addEventListener("change", gameModeChanged);
gameModeTimeTrial.addEventListener("change", gameModeChanged);
gameModeExploration.addEventListener("change", gameModeChanged);

function updateTime() {
	let timeDifference;

	// Get the game time
	if (gameData.gamemode === "timetrial") {
		timeDifference = Math.floor(
			(gameData.timeTrialDuration * 1000 - (new Date() - timeStarted)) /
				1000
		);
	} else {
		timeDifference = Math.floor((new Date() - timeStarted) / 1000);
	}

	if (timeDifference <= 0 && gameData.gamemode === "timetrial") {
		// Game over
		gameOver = true;
		clearInterval(timeInterval);
		gameOverDialog.classList.add("show");
		gameOverText.innerText = "You ran out of time.";
	}

	// calculate the current time in hours, minutes, and seconds
	let hours = Math.floor(timeDifference / 3600);
	let minutes = Math.floor(timeDifference / 60) % 60;
	let seconds = timeDifference % 60;

	// format the time as a string in the HH:MM:SS format
	let timeString =
		hours.toString().padStart(2, "0") +
		":" +
		minutes.toString().padStart(2, "0") +
		":" +
		seconds.toString().padStart(2, "0");

	// set the text of the element on the page to the current time
	timeLine.innerText = timeString;
}

// Main
loadGameData();
populateSettingsDialog();
gameModeChanged();

timeStarted = new Date();
updateTime();

// Start the stopwatch
timeInterval = setInterval(updateTime, 200);

// Score line is not needed in exploration mode
if (gameData.gamemode == "exploration") {
	scoreLine.style.display = "none";
}

// Time line is not needed if we're not in time trial mode and showElapsedTime is not set, or game mode is exploration
if (
	(!gameData.showElapsedTime && gameData.gamemode !== "timetrial") ||
	gameData.gamemode === "exploration"
) {
	timeLine.style.display = "none";
}

// create a new Leaflet map and set its view to the coordinates of the world
const map = L.map("map", {
	zoomControl: false,
	worldCopyJump: true,
	minZoom: 2,
	attributionControl: false,
}).setView([30, 0], 3);
// add the zoom control with a dark theme
L.control
	.zoom({
		position: "bottomleft",
	})
	.addTo(map);

// load the GeoJSON data for the world
fetch("countries.geojson")
	.then((response) => response.json())
	.then((data) => {
		// add the GeoJSON data as a layer to the map
		var exteriorStyle = {
			// "color": "#ffffff",
			// "weight": 0,
			fillOpacity: 0.35,
		};
		const geojson = L.geoJSON(data, {
			style: exteriorStyle,
			// when a country is clicked, check if it matches the random country name
			onEachFeature: function (feature, layer) {
				layer.on("click", function () {
					// Ignore clicks if game is over
					if (gameOver) {
						return;
					}
					// Ignore clicks if in exploration game mode
					if (gameData.gamemode == "exploration") {
						return;
					}
					// Ignore clicks to already completed countries (if not hideFoundCountryHighlights)
					if (
						completedCountries.indexOf(feature.properties.name) >=
							0 &&
						!gameData.hardMode.hideFoundCountryHighlights
					) {
						return;
					}
					completedCountries.push(currentCountryName);
					if (feature.properties.name === currentCountryName) {
						// Correct country clicked
						if (!gameData.hardMode.hideFoundCountryHighlights) {
							layer.setStyle({
								fillColor: "green",
								color: "green",
							});
						}

						if (shuffledCountries.length === 0) {
							document
								.getElementById("you-win")
								.classList.add("show");
							gameOver = true;
							clearInterval(timeInterval);
						}

						updateScore(score + 1);
						nextCountry();
					} else {
						// Incorrect country clicked
						if (gameData.gamemode != "learning") {
							gameOver = true;
							clearInterval(timeInterval);
							// Show the game over dialog
							gameOverDialog.classList.add("show");
						}

						// retrieve the correct country layer
						const correctCountry = geojson
							.getLayers()
							.find(
								(l) =>
									l.feature.properties.name ===
									currentCountryName
							);

						// highlight the correct country in red
						correctCountry.setStyle({
							fillColor: "red",
							color: "red",
						});

						// Zoom to correct country
						map.fitBounds(correctCountry.getBounds(), {
							maxZoom: 5,
						});

						document.getElementById("incorrect-country").innerText =
							feature.properties.name;
						document.getElementById("correct-country").innerText =
							currentCountryName;

						nextCountry();
					}
				});

				layer.on("mouseover", function () {
					if (gameData.gamemode == "exploration") {
						setCountryDisplay(feature.properties.name);
					}

					// Don't highlight if hideHoverHighlight is set
					if (gameData.hardMode.hideHoverHighlight) {
						return;
					}
					// Don't highlight if a country is completed and not hideFoundCountryHighlights
					if (
						completedCountries.indexOf(feature.properties.name) >=
							0 &&
						!gameData.hardMode.hideFoundCountryHighlights
					) {
						return;
					}
					// Don't highlight if game is over and correct country is hovered
					if (
						gameOver &&
						feature.properties.name == currentCountryName
					) {
						return;
					}

					layer.setStyle({ fillColor: "gray", color: "gray" });
				});

				layer.on("mouseout", function () {
					if (gameData.gamemode == "exploration") {
						setCountryDisplay(null);
					}
					// Don't highlight if hideHoverHighlight is set
					if (gameData.hardMode.hideHoverHighlight) {
						return;
					}
					// Don't highlight if a country is completed and not hideFoundCountryHighlights
					if (
						completedCountries.indexOf(feature.properties.name) >=
							0 &&
						!gameData.hardMode.hideFoundCountryHighlights
					) {
						return;
					}
					// Don't highlight if game is over and correct country is hovered
					if (
						gameOver &&
						feature.properties.name == currentCountryName
					) {
						return;
					}

					layer.setStyle({ fillColor: "#3388ff", color: "#3388ff" });
				});
			},
		}).addTo(map);

		// get a list of all the country names from the GeoJSON data
		const countryNames = data.features.map(
			(feature) => feature.properties.name
		);
		shuffledCountries = countryNames.sort(() => Math.random() - 0.5);
		numCountries = shuffledCountries.length;

		// pick a random country name from the list
		currentCountryName = shuffledCountries.pop();
		updateScore(score);

		// display the random country name in the floating box
		if (gameData.gamemode == "exploration") {
			setCountryDisplay(null);
		} else {
			setCountryDisplay(currentCountryName);
		}
	});
