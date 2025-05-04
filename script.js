// Digitrafic API endpoint for trains departing from Helsinki (HKI)
// Fetch the next 50 departing commuter trains, excluding others.
const scheduleDiv = document.getElementById('train-list');
const switchButton = document.getElementById('switch-direction');
const mainHeading = document.getElementById('main-heading');

let departureStation = 'HKI';
let arrivalStation = 'LPV';

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

// Event listener for the switch direction button
switchButton.addEventListener('click', () => {
    // Swap stations
    [departureStation, arrivalStation] = [arrivalStation, departureStation];

    // Update UI elements
    mainHeading.textContent = `Next Trains: ${departureStation} to ${arrivalStation}`;

    // Fetch new schedule
    fetchTrainSchedule();
});

// Initial fetch when the page loads
fetchTrainSchedule();
