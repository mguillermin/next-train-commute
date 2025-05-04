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

// Load stations from localStorage or use defaults
let departureStation = localStorage.getItem('departureStation') || 'HKI';
let arrivalStation = localStorage.getItem('arrivalStation') || 'LPV';

// Function to update the main direction display
function updateDirectionDisplay() {
    directionText.textContent = `${departureStation} → ${arrivalStation}`;
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
    depStationInput.value = departureStation; // Pre-fill with current stations
    arrStationInput.value = arrivalStation;
    settingsPanel.hidden = false;
}

// Function to hide the settings panel
function closeSettings() {
    settingsPanel.hidden = true;
}

// Function to save settings
function saveSettings() {
    const newDep = depStationInput.value.trim().toUpperCase();
    const newArr = arrStationInput.value.trim().toUpperCase();

    // Basic validation (3 letters)
    if (newDep.length === 3 && /^[A-Z]+$/.test(newDep) &&
        newArr.length === 3 && /^[A-Z]+$/.test(newArr)) {

        departureStation = newDep;
        arrivalStation = newArr;

        localStorage.setItem('departureStation', departureStation);
        localStorage.setItem('arrivalStation', arrivalStation);

        updateDirectionDisplay();
        closeSettings();
        fetchTrainSchedule(); // Fetch data for new stations
    } else {
        alert('Please enter valid 3-letter station codes (e.g., HKI, LPV).');
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

// Initial load
updateDirectionDisplay(); // Update display based on loaded/default stations
fetchTrainSchedule();     // Fetch initial schedule

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
