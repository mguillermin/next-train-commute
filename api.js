import { API_BASE_URL, TRAINS_TO_FETCH } from './config.js';

// Fetch all station metadata
export async function fetchStationData() {
    const url = `${API_BASE_URL}/metadata/stations`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Filter for passenger stations and return
        return data.filter(station => station.passengerTraffic);
    } catch (error) {
        console.error('Error fetching station data:', error);
        throw error; // Re-throw the error to be handled by the caller
    }
}

// Fetch train schedule for a given departure station
export async function fetchTrainSchedule(departureStation) {
    const apiUrl = `${API_BASE_URL}/live-trains/station/${departureStation}?departing_trains=${TRAINS_TO_FETCH}&departed_trains=0&arriving_trains=0&arrived_trains=0&train_categories=Commuter`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json(); // Return the train data
    } catch (error) {
        console.error('Error fetching train data:', error);
        throw error; // Re-throw the error to be handled by the caller
    }
}
