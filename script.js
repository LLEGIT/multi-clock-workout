/**
 * MULTI-CLOCK: Native JavaScript Logic
 * Comprehensive Version: Audio, State Machine, Wake Lock, & Service Worker
 */

// --- 1. Audio Engine (Web Audio API) ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playBeep(frequency, duration) {
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const osc = audioCtx.createOscillator();
    const envelope = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);

    envelope.gain.setValueAtTime(0, audioCtx.currentTime);
    envelope.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.02);
    envelope.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

    osc.connect(envelope);
    envelope.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

// --- 2. State Management ---
let timerInterval;
let isPaused = false;
let wakeLock = null;

let state = {
    series: 5,
    work: 30,
    rest: 10,
    cooldown: 0,
    currentSerie: 1,
    currentTime: 0,
    phase: 'PREP'
};

// --- 3. DOM Elements ---
const setupScreen = document.getElementById('setup-screen');
const timerScreen = document.getElementById('timer-screen');
const phaseLabel = document.getElementById('phase-label');
const timeDisplay = document.getElementById('time-display');
const seriesDisplay = document.getElementById('series-display');

const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const stopBtn = document.getElementById('stop-btn');

// --- 4. Wake Lock Logic (Prevent Screen Sleep) ---
async function requestWakeLock() {
    try {
        if ('wakeLock' in navigator) {
            wakeLock = await navigator.wakeLock.request('screen');
        }
    } catch (err) {
        console.error(`${err.name}, ${err.message}`);
    }
}

function releaseWakeLock() {
    if (wakeLock !== null) {
        wakeLock.release();
        wakeLock = null;
    }
}

// --- 5. Controls & Setup ---
function changeValue(id, amount) {
    const input = document.getElementById(id);
    let val = parseInt(input.value) + amount;
    if (val < 0) val = 0;
    input.value = val;
    state[id] = val;
}

startBtn.addEventListener('click', () => {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    requestWakeLock();

    setupScreen.classList.add('hidden');
    timerScreen.classList.remove('hidden');

    startWorkout();
});

pauseBtn.addEventListener('click', () => {
    isPaused = !isPaused;
    pauseBtn.innerText = isPaused ? "RESUME" : "PAUSE";
    pauseBtn.style.background = isPaused ? "#00e676" : "#ffb300";
    pauseBtn.style.color = isPaused ? "black" : "white";
});

stopBtn.addEventListener('click', () => {
    clearInterval(timerInterval);
    releaseWakeLock();
    window.location.reload();
});

// --- 6. Timer Core Logic ---
function startWorkout() {
    isPaused = false;
    state.currentSerie = 1;
    runPhase('PREP', 5);
}

function runPhase(phase, duration) {
    if (duration <= 0 && (phase === 'REST' || phase === 'COOLDOWN')) {
        nextStep();
        return;
    }

    state.phase = phase;
    state.currentTime = duration;
    updateUI();

    timerInterval = setInterval(() => {
        if (isPaused) return;

        state.currentTime--;

        // SOUND LOGIC: Last 3 seconds and End of phase
        if (state.currentTime <= 3 && state.currentTime > 0) {
            const pitch = (state.phase === 'PREP') ? 600 : 880;
            playBeep(pitch, 0.1);
        } else if (state.currentTime === 0) {
            playBeep(1200, 0.4);
        }

        updateUI();

        if (state.currentTime <= 0) {
            clearInterval(timerInterval);
            nextStep();
        }
    }, 1000);
}

function nextStep() {
    if (state.phase === 'PREP') {
        runPhase('WORK', state.work);
    } else if (state.phase === 'WORK') {
        if (state.currentSerie < state.series) {
            runPhase('REST', state.rest);
        } else if (state.cooldown > 0) {
            runPhase('COOLDOWN', state.cooldown);
        } else {
            finish();
        }
    } else if (state.phase === 'REST') {
        state.currentSerie++;
        runPhase('WORK', state.work);
    } else if (state.phase === 'COOLDOWN') {
        finish();
    }
}

// --- 7. UI Updates ---
function updateUI() {
    phaseLabel.innerText = state.phase;
    timeDisplay.innerText = state.currentTime;

    if (state.phase === 'PREP') {
        seriesDisplay.innerText = "Get Ready!";
        phaseLabel.style.color = '#2979ff';
    } else if (state.phase === 'COOLDOWN') {
        seriesDisplay.innerText = "Final Stretch";
        phaseLabel.style.color = '#9c27b0';
    } else {
        seriesDisplay.innerText = `Series: ${state.currentSerie} / ${state.series}`;
        phaseLabel.style.color = (state.phase === 'WORK') ? '#00e676' : '#ffb300';
    }
}

function finish() {
    releaseWakeLock();
    phaseLabel.innerText = "FINISHED";
    phaseLabel.style.color = "#ffffff";
    timeDisplay.innerText = "DONE";
    seriesDisplay.innerText = "Great Job!";
    pauseBtn.classList.add('hidden');

    // Triple beep for finish
    playBeep(600, 0.3);
    setTimeout(() => playBeep(800, 0.3), 200);
    setTimeout(() => playBeep(1200, 0.8), 400);
}

// --- 8. Service Worker Registration ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('SW Registered'))
            .catch(err => console.log('SW Registration Failed', err));
    });
}
