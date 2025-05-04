import { REFRESH_INTERVAL_MS } from './config.js';
import { fetchStationData as apiFetchStationData, fetchTrainSchedule as apiFetchTrainSchedule } from './api.js';
import {
    getDepartureStation,
    getArrivalStation,
    setStations,
    saveStationsToLocalStorage,
    swapStations,
    setStationData,
    getStationCode
} from './state.js';
import {
    showSuggestions,
    hideSuggestions,
    updateDirectionDisplay,
    updateLastUpdatedTime,
    displaySchedule,
    openSettings,
    closeSettings,
    showLoading,
    showScheduleError,
    // Import specific DOM elements needed for event listeners
    depStationInput,
    arrStationInput,
    depSuggestions,
    arrSuggestions
} from './ui.js';

// Get references to buttons needed for event listeners in this file
const switchButton = document.getElementById('switch-direction-btn');
const settingsButton = document.getElementById('settings-btn');
const saveSettingsButton = document.getElementById('save-settings-btn');
const closeSettingsButton = document.getElementById('close-settings-btn');
const refreshButton = document.getElementById('refresh-btn');

// --- Core Logic --- //

// Fetch and store station data
async function loadStationData() {
    try {
        const data = await apiFetchStationData();
        setStationData(data);
        updateDirectionDisplay(); // Update UI after data is loaded
        console.log('Station data loaded');
    } catch (error) {
        console.error('Failed to load station data:', error);
        // Optionally show an error message to the user via the UI module
    }
}

// Fetch and display train schedule
async function refreshTrainSchedule(isManualRefresh = false) {
    if (isManualRefresh) {
        showLoading(); // Use UI function
    }

    try {
        const trains = await apiFetchTrainSchedule(getDepartureStation());
        displaySchedule(trains); // Use UI function
        updateLastUpdatedTime(true); // Use UI function
    } catch (error) {
        console.error('Failed to refresh train schedule:', error);
        if (isManualRefresh) {
            showScheduleError(); // Use UI function
        }
        updateLastUpdatedTime(false); // Use UI function
    }
}

// Save settings
function saveSettings() {
    const depInput = depStationInput.value.trim();
    const arrInput = arrStationInput.value.trim();

    const newDepCode = getStationCode(depInput);
    const newArrCode = getStationCode(arrInput);

    if (newDepCode && newArrCode) {
        setStations(newDepCode, newArrCode);
        saveStationsToLocalStorage();

        updateDirectionDisplay(); // Update UI
        closeSettings(); // Update UI
        refreshTrainSchedule(true); // Refresh data
    } else {
        alert('Invalid station name or code entered. Please select from the list or enter a valid 3-letter code.');
    }
}

// --- Event Listeners --- //

// Switch direction button
switchButton.addEventListener('click', () => {
    swapStations();
    updateDirectionDisplay(); // Update UI
    refreshTrainSchedule(true); // Refresh data
});

// Settings button
settingsButton.addEventListener('click', openSettings); // Use UI function

// Close settings button
closeSettingsButton.addEventListener('click', closeSettings); // Use UI function

// Save settings button
saveSettingsButton.addEventListener('click', saveSettings);

// Input event listeners for autocomplete
depStationInput.addEventListener('input', () => {
    showSuggestions(depStationInput.value, depStationInput, depSuggestions); // Use UI function
});
arrStationInput.addEventListener('input', () => {
    showSuggestions(arrStationInput.value, arrStationInput, arrSuggestions); // Use UI function
});

// Hide suggestions on blur
depStationInput.addEventListener('blur', () => hideSuggestions(depSuggestions)); // Use UI function
arrStationInput.addEventListener('blur', () => hideSuggestions(arrSuggestions)); // Use UI function

// Clear input on focus and hide suggestions
depStationInput.addEventListener('focus', () => {
    depStationInput.value = '';
    depSuggestions.innerHTML = ''; // Direct manipulation needed here or add UI function
    depSuggestions.style.display = 'none';
});
arrStationInput.addEventListener('focus', () => {
    arrStationInput.value = '';
    arrSuggestions.innerHTML = ''; // Direct manipulation needed here or add UI function
    arrSuggestions.style.display = 'none';
});

// Refresh button listener
refreshButton.addEventListener('click', () => {
    refreshTrainSchedule(true);
});

// --- Initial Load & Interval --- //

async function initializeApp() {
    await loadStationData(); // Fetch station data first
    refreshTrainSchedule(true); // Fetch initial schedule
}

initializeApp();

// Set interval to refresh schedule
setInterval(() => refreshTrainSchedule(false), REFRESH_INTERVAL_MS);

// --- Service Worker --- //

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/next-train-commute/sw.js') // Adjust path if needed
      .then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch(error => {
        console.log('ServiceWorker registration failed: ', error);
      });
  });
}
