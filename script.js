// Digitrafic API endpoint for trains departing from Helsinki (HKI)
// Fetch the next 50 departing commuter trains, excluding others.
const apiUrl = 'https://rata.digitraffic.fi/api/v1/live-trains/station/HKI?departing_trains=50&departed_trains=0&arriving_trains=0&arrived_trains=0&train_categories=Commuter'; // Be more specific
const scheduleDiv = document.getElementById('train-list'); // Target the new train-list div

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
    scheduleDiv.innerHTML = ''; // Clear loading message from train-list

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

        if (!departureRow) return; // Skip if departure data is missing

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

        const trainType = train.commuterLineID || train.trainType + train.trainNumber; // Use Commuter Line ID if available

        const trainDiv = document.createElement('div');
        trainDiv.classList.add('train'); // Keep the train class for potential individual styling

        // Use train-info class for flex alignment matching the header
        trainDiv.classList.add('train-info');
        trainDiv.innerHTML = `
            <span><strong>${trainType}</strong></span>
            <span>${departureDisplay}</span>
            <span>${departureRow.commercialTrack || '-'}</span>
        `;

        scheduleDiv.appendChild(trainDiv);
    });
}

// Fetch the schedule when the page loads
fetchTrainSchedule();
