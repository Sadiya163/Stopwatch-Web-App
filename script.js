
// ======================================
// STOPWATCH PRO - JAVASCRIPT
// ======================================

// HTML Elements
const display = document.getElementById("display");
const startBtn = document.getElementById("startBtn");
const lapBtn = document.getElementById("lapBtn");
const resetBtn = document.getElementById("resetBtn");
const lapList = document.getElementById("lapList");

const statusText = document.getElementById("status");
const totalLaps = document.getElementById("totalLaps");
const fastestLap = document.getElementById("fastestLap");
const slowestLap = document.getElementById("slowestLap");

const themeBtn = document.getElementById("themeBtn");
const exportBtn = document.getElementById("exportBtn");
const clearBtn = document.getElementById("clearBtn");

// Stopwatch Variables
let startTime = 0;
let elapsedTime = 0;
let timerInterval = null;
let isRunning = false;
let previousLapTime = 0;

// Lap History
let laps = [];

const STORAGE_KEY = "stopwatchProLaps";
const THEME_KEY = "stopwatchProTheme";

// ======================================
// TIME FORMATTING
// ======================================

function formatTime(milliseconds) {

    const totalCentiseconds = Math.floor(milliseconds / 10);

    const hours = Math.floor(totalCentiseconds / 360000);

    const minutes = Math.floor(
        (totalCentiseconds % 360000) / 6000
    );

    const seconds = Math.floor(
        (totalCentiseconds % 6000) / 100
    );

    const centiseconds = totalCentiseconds % 100;

    return (
        String(hours).padStart(2, "0") + ":" +
        String(minutes).padStart(2, "0") + ":" +
        String(seconds).padStart(2, "0") + "." +
        String(centiseconds).padStart(2, "0")
    );
}

// Format shorter time for statistics
function shortTime(milliseconds) {

    const totalCentiseconds = Math.floor(milliseconds / 10);

    const minutes = Math.floor(totalCentiseconds / 6000);

    const seconds = Math.floor(
        (totalCentiseconds % 6000) / 100
    );

    const centiseconds = totalCentiseconds % 100;

    return (
        String(minutes).padStart(2, "0") + ":" +
        String(seconds).padStart(2, "0") + "." +
        String(centiseconds).padStart(2, "0")
    );
}

// ======================================
// UPDATE STOPWATCH DISPLAY
// ======================================

function updateDisplay() {

    display.innerHTML =
        formatTime(elapsedTime).replace(
            /\.(\d+)$/,
            '<span class="milliseconds">.$1</span>'
        );

}

// ======================================
// START / PAUSE / RESUME
// ======================================

function startStopwatch() {

    if (isRunning) {

        pauseStopwatch();
        return;

    }

    startTime = performance.now() - elapsedTime;

    isRunning = true;

    timerInterval = setInterval(() => {

        elapsedTime = performance.now() - startTime;

        updateDisplay();

    }, 10);

    startBtn.textContent = "Ⅱ Pause";

    lapBtn.disabled = false;
    resetBtn.disabled = false;

    statusText.innerHTML =
        '<span class="status-dot"></span> Stopwatch Running';

    statusText.classList.add("running");

}

function pauseStopwatch() {

    if (!isRunning) return;

    elapsedTime = performance.now() - startTime;

    clearInterval(timerInterval);

    isRunning = false;

    updateDisplay();

    startBtn.textContent = "▶ Resume";

    lapBtn.disabled = true;

    statusText.innerHTML =
        '<span class="status-dot"></span> Stopwatch Paused';

    statusText.classList.remove("running");

}

// ======================================
// RESET STOPWATCH
// ======================================

function resetStopwatch() {

    clearInterval(timerInterval);

    timerInterval = null;

    isRunning = false;

    startTime = 0;
    elapsedTime = 0;
    previousLapTime = 0;

    laps = [];

    updateDisplay();

    startBtn.textContent = "▶ Start";

    lapBtn.disabled = true;
    resetBtn.disabled = true;

    statusText.innerHTML =
        '<span class="status-dot"></span> Ready to Start';

    statusText.classList.remove("running");

    saveLaps();

    renderLaps();

}

// ======================================
// RECORD LAP
// ======================================

function recordLap() {

    if (!isRunning) return;

    const currentTime = performance.now() - startTime;

    const lapDuration = currentTime - previousLapTime;

    previousLapTime = currentTime;

    const lap = {

        number: laps.length + 1,

        lapTime: lapDuration,

        totalTime: currentTime

    };

    laps.push(lap);

    saveLaps();

    renderLaps();

}

// ======================================
// LOCAL STORAGE
// ======================================

function saveLaps() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(laps)
    );

}

function loadLaps() {

    try {

        const savedLaps = JSON.parse(
            localStorage.getItem(STORAGE_KEY)
        );

        if (!Array.isArray(savedLaps)) {
            laps = [];
            return;
        }

        // Validate saved lap records
        laps = savedLaps.filter((lap, index) => {

            return (
                lap &&
                lap.number === index + 1 &&
                Number.isFinite(lap.lapTime) &&
                Number.isFinite(lap.totalTime) &&
                lap.lapTime >= 0 &&
                lap.totalTime >= 0
            );

        });

    } catch (error) {

        laps = [];

    }

}

// ======================================
// DISPLAY LAP HISTORY
// ======================================

function renderLaps() {

    lapList.innerHTML = "";

    if (laps.length === 0) {

        lapList.innerHTML = `
            <tr class="empty-row">
                <td colspan="3">
                    No laps recorded yet.
                    Start your stopwatch!
                </td>
            </tr>
        `;

    } else {

        const lapDurations = laps.map(
            lap => lap.lapTime
        );

        const fastest = Math.min(...lapDurations);
        const slowest = Math.max(...lapDurations);

        laps.forEach(lap => {

            const row = document.createElement("tr");

            let lapClass = "";

            if (laps.length > 1 && lap.lapTime === fastest) {

                lapClass = "fastest";

            } else if (
                laps.length > 1 &&
                lap.lapTime === slowest
            ) {

                lapClass = "slowest";

            }

            row.innerHTML = `
                <td>#${lap.number}</td>

                <td class="${lapClass}">
                    ${formatTime(lap.lapTime)}
                </td>

                <td>
                    ${formatTime(lap.totalTime)}
                </td>
            `;

            lapList.appendChild(row);

        });

    }

    updateStatistics();

}

// ======================================
// UPDATE STATISTICS
// ======================================

function updateStatistics() {

    totalLaps.textContent = laps.length;

    if (laps.length === 0) {

        fastestLap.textContent = "--:--";
        slowestLap.textContent = "--:--";

        return;

    }

    const lapDurations = laps.map(
        lap => lap.lapTime
    );

    fastestLap.textContent = shortTime(
        Math.min(...lapDurations)
    );

    slowestLap.textContent = shortTime(
        Math.max(...lapDurations)
    );

}

// ======================================
// CLEAR LAP HISTORY
// ======================================

function clearLapHistory() {

    if (laps.length === 0) return;

    const confirmClear = confirm(
        "Are you sure you want to clear all lap records?"
    );

    if (!confirmClear) return;

    laps = [];

    previousLapTime = elapsedTime;

    saveLaps();

    renderLaps();

}

// ======================================
// EXPORT LAP HISTORY AS CSV
// ======================================

function exportCSV() {

    if (laps.length === 0) {

        alert("No lap records available to export!");

        return;

    }

    let csvContent =
        "Lap Number,Lap Time,Total Time\n";

    laps.forEach(lap => {

        csvContent +=
            `${lap.number},` +
            `${formatTime(lap.lapTime)},` +
            `${formatTime(lap.totalTime)}\n`;

    });

    const blob = new Blob(
        [csvContent],
        { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = "Stopwatch_Lap_History.csv";

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);

}

// ======================================
// LIGHT / DARK THEME
// ======================================

function applyTheme(theme) {

    document.body.classList.toggle(
        "light",
        theme === "light"
    );

    themeBtn.textContent =
        theme === "light"
            ? "☾ Dark Mode"
            : "☀ Light Mode";

    localStorage.setItem(THEME_KEY, theme);

}

function toggleTheme() {

    const isLight =
        document.body.classList.contains("light");

    applyTheme(isLight ? "dark" : "light");

}

// ======================================
// KEYBOARD SHORTCUTS
// ======================================

document.addEventListener("keydown", function(event) {

    const tag = event.target.tagName;

    if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        event.ctrlKey ||
        event.altKey ||
        event.metaKey
    ) {
        return;
    }

    if (event.code === "Space") {

        event.preventDefault();

        startStopwatch();

    }

    if (event.key.toLowerCase() === "l") {

        if (isRunning) {
            recordLap();
        }

    }

    if (event.key.toLowerCase() === "r") {

        if (!resetBtn.disabled) {
            resetStopwatch();
        }

    }

});

// ======================================
// BUTTON EVENT LISTENERS
// ======================================

startBtn.addEventListener(
    "click",
    startStopwatch
);

lapBtn.addEventListener(
    "click",
    recordLap
);

resetBtn.addEventListener(
    "click",
    resetStopwatch
);

clearBtn.addEventListener(
    "click",
    clearLapHistory
);

exportBtn.addEventListener(
    "click",
    exportCSV
);

themeBtn.addEventListener(
    "click",
    toggleTheme
);

// ======================================
// INITIALIZE APPLICATION
// ======================================

function initializeApp() {

    loadLaps();

    renderLaps();

    updateDisplay();

    const savedTheme =
        localStorage.getItem(THEME_KEY) || "dark";

    applyTheme(savedTheme);

}

initializeApp();
