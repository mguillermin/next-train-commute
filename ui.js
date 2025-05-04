import { getStationData, getStationName, getDepartureStation, getArrivalStation } from './state.js';
import { TRAINS_TO_DISPLAY } from './config.js';

// DOM Elements (used by UI functions)
export const scheduleDiv = document.getElementById('train-list');
export const directionText = document.getElementById('direction-text'); // Target the text span in H1
export const settingsPanel = document.getElementById('settings-panel');
export const depStationInput = document.getElementById('dep-station');
export const arrStationInput = document.getElementById('arr-station');
export const depSuggestions = document.getElementById('dep-suggestions');
export const arrSuggestions = document.getElementById('arr-suggestions');
export const lastUpdatedText = document.getElementById('last-updated-text');

// Function to show suggestions
export function showSuggestions(inputValue, inputElement, suggestionsElement) {
    if (getStationData().length === 0) {
        suggestionsElement.style.display = 'none';
        return;
    }

    suggestionsElement.innerHTML = '';
    if (!inputValue) {
        suggestionsElement.style.display = 'none';
        return;
    }

    const lowerInputValue = inputValue.toLowerCase();
    const filteredStations = getStationData().filter(station =>
        station.stationName.toLowerCase().includes(lowerInputValue) ||
        station.stationShortCode.toLowerCase().includes(lowerInputValue)
    ).slice(0, 10);

    if (filteredStations.length > 0) {
        filteredStations.forEach(station => {
            const item = document.createElement('div');
            item.classList.add('suggestion-item');
            item.textContent = `${station.stationName} (${station.stationShortCode})`;
            item.addEventListener('click', () => {
                inputElement.value = station.stationName;
                suggestionsElement.style.display = 'none';
                suggestionsElement.innerHTML = '';
            });
            suggestionsElement.appendChild(item);
        });
        suggestionsElement.style.display = 'block';
    } else {
        suggestionsElement.style.display = 'none';
    }
}

// Function to hide suggestions
export function hideSuggestions(suggestionsElement) {
    setTimeout(() => {
        suggestionsElement.style.display = 'none';
    }, 150);
}

// Function to update the main direction display
export function updateDirectionDisplay() {
    const depName = getStationName(getDepartureStation());
    const arrName = getStationName(getArrivalStation());
    directionText.textContent = `${depName} → ${arrName}`;
}

// Function to update the last updated time display
export function updateLastUpdatedTime(success = true) {
    if (success) {
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        lastUpdatedText.textContent = `Last updated: ${timeString}`;
    } else {
        lastUpdatedText.textContent = 'Update failed';
    }
}

// Function to display the schedule
export function displaySchedule(trains) {
    scheduleDiv.innerHTML = '';
    const currentDepartureStation = getDepartureStation();
    const currentArrivalStation = getArrivalStation();

    if (trains.length === 0) {
        scheduleDiv.innerHTML = `No upcoming commuter trains found departing from ${getStationName(currentDepartureStation)}.`;
        return;
    }

    const relevantTrains = trains
        .filter(train => {
            return train.timeTableRows.some(row => row.stationShortCode === currentArrivalStation && row.type === 'ARRIVAL' && row.trainStopping);
        })
        .sort((a, b) => {
            const depA = a.timeTableRows.find(row => row.stationShortCode === currentDepartureStation && row.type === 'DEPARTURE').scheduledTime;
            const depB = b.timeTableRows.find(row => row.stationShortCode === currentDepartureStation && row.type === 'DEPARTURE').scheduledTime;
            return new Date(depA) - new Date(depB);
        });

    if (relevantTrains.length === 0) {
        scheduleDiv.innerHTML = `No upcoming commuter trains found from ${getStationName(currentDepartureStation)} stopping at ${getStationName(currentArrivalStation)}.`;
        return;
    }

    relevantTrains.slice(0, TRAINS_TO_DISPLAY).forEach(train => {
        const departureRow = train.timeTableRows.find(row => row.stationShortCode === currentDepartureStation && row.type === 'DEPARTURE');
        if (!departureRow) return;

        const scheduledDeparture = new Date(departureRow.scheduledTime);
        const now = new Date();
        const diffMinutes = Math.round((scheduledDeparture - now) / (1000 * 60));

        let departureDisplay;
        if (diffMinutes < 0) {
            departureDisplay = "Departed";
        } else if (diffMinutes === 0) {
            departureDisplay = "Now";
        } else if (diffMinutes >= 60) {
            const hours = Math.floor(diffMinutes / 60);
            const minutes = diffMinutes % 60;
            if (minutes === 0) {
                departureDisplay = `in ${hours}h`;
            } else {
                departureDisplay = `in ${hours}h ${minutes}min`;
            }
        } else {
            departureDisplay = `in ${diffMinutes} min`;
        }

        const trainType = train.commuterLineID || train.trainType + train.trainNumber;

        const trainDiv = document.createElement('div');
        trainDiv.classList.add('train', 'train-info');
        trainDiv.innerHTML = `
            <span>${departureDisplay}</span>
            <span>${departureRow.commercialTrack || '-'}</span>
            <span><strong>${trainType}</strong></span>
        `;
        scheduleDiv.appendChild(trainDiv);
    });
}

// Function to show the settings panel
export function openSettings() {
    depStationInput.value = getStationName(getDepartureStation());
    arrStationInput.value = getStationName(getArrivalStation());
    settingsPanel.hidden = false;
}

// Function to hide the settings panel
export function closeSettings() {
    settingsPanel.hidden = true;
}

// Function to show loading state in schedule
export function showLoading() {
    scheduleDiv.innerHTML = 'Loading...';
}

// Function to show error state in schedule
export function showScheduleError() {
    scheduleDiv.innerHTML = `Failed to load train schedule for ${getStationName(getDepartureStation())}. Please try again later.`;
}
