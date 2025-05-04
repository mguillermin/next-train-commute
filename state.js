import { DEFAULT_DEP_STATION, DEFAULT_ARR_STATION, LOCAL_STORAGE_DEP_KEY, LOCAL_STORAGE_ARR_KEY } from './config.js';

let departureStation = localStorage.getItem(LOCAL_STORAGE_DEP_KEY) || DEFAULT_DEP_STATION;
let arrivalStation = localStorage.getItem(LOCAL_STORAGE_ARR_KEY) || DEFAULT_ARR_STATION;
let stationData = []; // To store fetched station metadata

export function getDepartureStation() {
    return departureStation;
}

export function getArrivalStation() {
    return arrivalStation;
}

export function setStations(dep, arr) {
    departureStation = dep;
    arrivalStation = arr;
}

export function saveStationsToLocalStorage() {
    localStorage.setItem(LOCAL_STORAGE_DEP_KEY, departureStation);
    localStorage.setItem(LOCAL_STORAGE_ARR_KEY, arrivalStation);
}

export function swapStations() {
    [departureStation, arrivalStation] = [arrivalStation, departureStation];
    saveStationsToLocalStorage(); // Save after swapping
}

export function getStationData() {
    return stationData;
}

export function setStationData(data) {
    stationData = data;
}

// Helper to get station name from code using current stationData
export function getStationName(code) {
    const station = stationData.find(s => s.stationShortCode === code);
    return station ? station.stationName : code; // Fallback to code if not found
}

// Helper to get station code from name (or code) using current stationData
export function getStationCode(input) {
    if (!input) return null;
    const upperInput = input.toUpperCase();
    // First check if input is already a valid code
    const isCode = stationData.some(s => s.stationShortCode === upperInput);
    if (isCode) return upperInput;

    // Otherwise, find by name
    const station = stationData.find(s => s.stationName.toUpperCase() === upperInput);
    return station ? station.stationShortCode : null; // Return null if not found
}
