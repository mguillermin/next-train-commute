// Digitrafic API endpoint for trains departing from Helsinki (HKI)
// Fetch the next 50 departing commuter trains, excluding others.
const scheduleDiv = document.getElementById('train-list');
const switchButton = document.getElementById('switch-direction-btn'); // Target the new emoji button
const directionText = document.getElementById('direction-text'); // Target the text span in H1
const settingsButton = document.getElementById('settings-btn');
const settingsPanel = document.getElementById('settings-panel');
const depStationInput = document.getElementById('dep-station');
const arrStationInput = document.getElementById('arr-station');
const saveSettingsButton = document.getElementById('save-settings-btn');
const closeSettingsButton = document.getElementById('close-settings-btn');
const depSuggestions = document.getElementById('dep-suggestions');
const arrSuggestions = document.getElementById('arr-suggestions');

// Load stations from localStorage or use defaults
let departureStation = localStorage.getItem('departureStation') || 'HKI';
let arrivalStation = localStorage.getItem('arrivalStation') || 'LPV';
let stationData = []; // To store fetched station metadata

// Fetch all station metadata
async function fetchStationData() {
    const url = 'https://rata.digitraffic.fi/api/v1/metadata/stations';
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Filter for passenger stations and store
        stationData = data.filter(station => station.passengerTraffic);
        updateDirectionDisplay(); // Update display now that we might have names
        console.log('Station data loaded');
    } catch (error) {
        console.error('Error fetching station data:', error);
        // Handle error - maybe show a message to the user
    }
}

// Helper to get station name from code
function getStationName(code) {
    const station = stationData.find(s => s.stationShortCode === code);
    return station ? station.stationName : code; // Fallback to code if not found
}

// Helper to get station code from name (or code)
function getStationCode(input) {
    if (!input) return null;
    const upperInput = input.toUpperCase();
    // First check if input is already a valid code
    const isCode = stationData.some(s => s.stationShortCode === upperInput);
    if (isCode) return upperInput;

    // Otherwise, find by name
    const station = stationData.find(s => s.stationName.toUpperCase() === upperInput);
    return station ? station.stationShortCode : null; // Return null if not found
}

// Function to show suggestions
function showSuggestions(inputValue, inputElement, suggestionsElement) {
    // Add check: Only proceed if station data is loaded
    if (stationData.length === 0) {
        suggestionsElement.style.display = 'none';
        return;
    }

    suggestionsElement.innerHTML = ''; // Clear previous suggestions
    if (!inputValue) {
        suggestionsElement.style.display = 'none';
        return;
    }

    const lowerInputValue = inputValue.toLowerCase();
    const filteredStations = stationData.filter(station =>
        station.stationName.toLowerCase().includes(lowerInputValue) ||
        station.stationShortCode.toLowerCase().includes(lowerInputValue)
    ).slice(0, 10); // Limit suggestions

    if (filteredStations.length > 0) {
        filteredStations.forEach(station => {
            const item = document.createElement('div');
            item.classList.add('suggestion-item');
            item.textContent = `${station.stationName} (${station.stationShortCode})`;
            item.addEventListener('click', () => {
                inputElement.value = station.stationName; // Use full name for display
                suggestionsElement.style.display = 'none';
                suggestionsElement.innerHTML = ''; // Clear after selection
            });
            suggestionsElement.appendChild(item);
        });
        suggestionsElement.style.display = 'block';
    } else {
        suggestionsElement.style.display = 'none';
    }
}

// Function to hide suggestions
function hideSuggestions(suggestionsElement) {
    // Delay hiding slightly to allow click event on suggestion item to register
    setTimeout(() => {
        suggestionsElement.style.display = 'none';
    }, 150);
}

// Function to update the main direction display
function updateDirectionDisplay() {
    // Use names if possible, fallback to codes
    const depName = getStationName(departureStation);
    const arrName = getStationName(arrivalStation);
    directionText.textContent = `${depName} → ${arrName}`;
}

async function fetchTrainSchedule() {
    // Construct API URL based on the current departure station
    const apiUrl = `https://rata.digitraffic.fi/api/v1/live-trains/station/${departureStation}?departing_trains=50&departed_trains=0&arriving_trains=0&arrived_trains=0&train_categories=Commuter`;
    scheduleDiv.innerHTML = 'Loading...'; // Show loading message during fetch

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const trains = await response.json();
        displaySchedule(trains);
    } catch (error) {
        console.error('Error fetching train data:', error);
        scheduleDiv.innerHTML = `Failed to load train schedule for ${departureStation}. Please try again later.`;
    }
}

function displaySchedule(trains) {
    scheduleDiv.innerHTML = ''; // Clear loading message

    if (trains.length === 0) {
        scheduleDiv.innerHTML = `No upcoming commuter trains found departing from ${departureStation}.`;
        return;
    }

    // Filter trains that have a stop at the current arrivalStation
    const relevantTrains = trains
        .filter(train => {
            return train.timeTableRows.some(row => row.stationShortCode === arrivalStation && row.type === 'ARRIVAL' && row.trainStopping);
        })
        .sort((a, b) => {
            // Sort by scheduled departure time from the current departureStation
            const depA = a.timeTableRows.find(row => row.stationShortCode === departureStation && row.type === 'DEPARTURE').scheduledTime;
            const depB = b.timeTableRows.find(row => row.stationShortCode === departureStation && row.type === 'DEPARTURE').scheduledTime;
            return new Date(depA) - new Date(depB);
        });

    if (relevantTrains.length === 0) {
        scheduleDiv.innerHTML = `No upcoming commuter trains found from ${departureStation} stopping at ${arrivalStation}.`;
        return;
    }

    relevantTrains.slice(0, 10).forEach(train => {
        // Find the departure row for the current departureStation
        const departureRow = train.timeTableRows.find(row => row.stationShortCode === departureStation && row.type === 'DEPARTURE');

        if (!departureRow) return;

        const scheduledDeparture = new Date(departureRow.scheduledTime);
        const now = new Date();
        const diffMinutes = Math.round((scheduledDeparture - now) / (1000 * 60));

        let departureDisplay;
        if (diffMinutes < 0) {
            departureDisplay = "Departed";
        } else if (diffMinutes === 0) {
            departureDisplay = "Now";
        } else {
            departureDisplay = `in ${diffMinutes} min`;
        }

        const trainType = train.commuterLineID || train.trainType + train.trainNumber;

        const trainDiv = document.createElement('div');
        trainDiv.classList.add('train');
        trainDiv.classList.add('train-info');
        trainDiv.innerHTML = `
            <span>${departureDisplay}</span>
            <span>${departureRow.commercialTrack || '-'}</span>
            <span><strong>${trainType}</strong></span>
        `;

        scheduleDiv.appendChild(trainDiv);
    });
}

// Function to show the settings panel
function openSettings() {
    // Pre-fill with current station names
    depStationInput.value = getStationName(departureStation);
    arrStationInput.value = getStationName(arrivalStation);
    settingsPanel.hidden = false;
}

// Function to hide the settings panel
function closeSettings() {
    settingsPanel.hidden = true;
}

// Function to save settings
function saveSettings() {
    const depInput = depStationInput.value.trim();
    const arrInput = arrStationInput.value.trim();

    const newDepCode = getStationCode(depInput);
    const newArrCode = getStationCode(arrInput);

    if (newDepCode && newArrCode) {
        departureStation = newDepCode;
        arrivalStation = newArrCode;

        localStorage.setItem('departureStation', departureStation);
        localStorage.setItem('arrivalStation', arrivalStation);

        updateDirectionDisplay();
        closeSettings();
        fetchTrainSchedule(); // Fetch data for new stations
    } else {
        alert('Invalid station name or code entered. Please select from the list or enter a valid 3-letter code.');
    }
}

// Event listener for the switch direction button
switchButton.addEventListener('click', () => {
    // Swap stations
    [departureStation, arrivalStation] = [arrivalStation, departureStation];

    // Update UI elements
    updateDirectionDisplay();

    // Fetch new schedule
    fetchTrainSchedule();
});

// Settings button
settingsButton.addEventListener('click', openSettings);

// Close settings button
closeSettingsButton.addEventListener('click', closeSettings);

// Save settings button
saveSettingsButton.addEventListener('click', saveSettings);

// Input event listeners for autocomplete
depStationInput.addEventListener('input', () => {
    showSuggestions(depStationInput.value, depStationInput, depSuggestions);
});
arrStationInput.addEventListener('input', () => {
    showSuggestions(arrStationInput.value, arrStationInput, arrSuggestions);
});

// Hide suggestions on blur
depStationInput.addEventListener('blur', () => hideSuggestions(depSuggestions));
arrStationInput.addEventListener('blur', () => hideSuggestions(arrSuggestions));

// Clear input on focus and hide suggestions
depStationInput.addEventListener('focus', () => {
    depStationInput.value = '';
    depSuggestions.innerHTML = ''; // Clear suggestions visually
    depSuggestions.style.display = 'none';
});
arrStationInput.addEventListener('focus', () => {
    arrStationInput.value = '';
    arrSuggestions.innerHTML = ''; // Clear suggestions visually
    arrSuggestions.style.display = 'none';
});

// Initial load
fetchStationData(); // Fetch station data first
fetchTrainSchedule();     // Fetch initial schedule (might use defaults initially)

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/next-train-commute/sw.js') // Use the correct path for GitHub Pages
      .then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch(error => {
        console.log('ServiceWorker registration failed: ', error);
      });
  });
}
