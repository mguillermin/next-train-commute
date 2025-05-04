// Digitrafic API endpoint for trains departing from Helsinki (HKI)
// Fetch the next 50 departing commuter trains, excluding others.
const apiUrl = 'https://rata.digitraffic.fi/api/v1/live-trains/station/HKI?departing_trains=50&departed_trains=0&arriving_trains=0&arrived_trains=0&train_categories=Commuter'; // Be more specific
const scheduleDiv = document.getElementById('train-schedule');

async function fetchTrainSchedule() {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const trains = await response.json();

        displaySchedule(trains);
    } catch (error) {
        console.error('Error fetching train data:', error);
        scheduleDiv.innerHTML = 'Failed to load train schedule. Please try again later.';
    }
}

function displaySchedule(trains) {
    scheduleDiv.innerHTML = ''; // Clear loading message

    if (trains.length === 0) {
        scheduleDiv.innerHTML = 'No upcoming commuter trains found departing from Helsinki.';
        return;
    }

    // Filter trains that have a stop at Leppävaara (LPV)
    const relevantTrains = trains
        .filter(train => {
            // Check if the train's timeTableRows includes a stop at LPV
            return train.timeTableRows.some(row => row.stationShortCode === 'LPV' && row.type === 'ARRIVAL' && row.trainStopping);
        })
        .sort((a, b) => {
            // Sort by scheduled departure time from HKI
            const depA = a.timeTableRows.find(row => row.stationShortCode === 'HKI' && row.type === 'DEPARTURE').scheduledTime;
            const depB = b.timeTableRows.find(row => row.stationShortCode === 'HKI' && row.type === 'DEPARTURE').scheduledTime;
            return new Date(depA) - new Date(depB);
        });

    if (relevantTrains.length === 0) {
        scheduleDiv.innerHTML = 'No upcoming commuter trains found stopping at Leppävaara.';
        return;
    }

    relevantTrains.slice(0, 10).forEach(train => { // Display next 10 relevant trains
        const departureRow = train.timeTableRows.find(row => row.stationShortCode === 'HKI' && row.type === 'DEPARTURE');
        const arrivalRow = train.timeTableRows.find(row => row.stationShortCode === 'LPV' && row.type === 'ARRIVAL');

        if (!departureRow || !arrivalRow) return; // Skip if essential data is missing

        const departureTime = new Date(departureRow.scheduledTime).toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' });
        const arrivalTime = new Date(arrivalRow.scheduledTime).toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' });
        const trainType = train.commuterLineID || train.trainType + train.trainNumber; // Use Commuter Line ID if available

        const trainDiv = document.createElement('div');
        trainDiv.classList.add('train');

        const trainInfoDiv = document.createElement('div');
        trainInfoDiv.classList.add('train-info');
        trainInfoDiv.innerHTML = `
            <span><strong>${trainType}</strong></span>
            <span>Dep: ${departureTime}</span>
            <span>Arr: ${arrivalTime}</span>
            <span>Track: ${departureRow.commercialTrack || '-'}</span>
        `;

        trainDiv.appendChild(trainInfoDiv);
        scheduleDiv.appendChild(trainDiv);
    });
}

// Fetch the schedule when the page loads
fetchTrainSchedule();
