// --- Elements ---
const startBtn = document.getElementById("start");
const stopBtn = document.getElementById("stop");
const youEl = document.getElementById("you");
const tutorEl = document.getElementById("tutor");
const statusEl = document.getElementById("status"); // optional
const voiceSelect = document.getElementById("voice"); // optional (if exists in HTML)

// --- Voice selection (TTS) ---
let voices = [];
let chosenVoice = null;

function loadVoices() {
  voices = window.speechSynthesis.getVoices();

  // If no dropdown exists, just pick a default English voice
  if (!voiceSelect) {
    chosenVoice = voices.find((v) => /en/i.test(v.lang)) || voices[0] || null;
    return;
  }

  voiceSelect.innerHTML = "";

  voices.forEach((v, i) => {
    const opt = document.createElement("option");
    opt.value = String(i);
    opt.textContent = `${v.name} (${v.lang})`;
    voiceSelect.appendChild(opt);
  });

  const preferred =
    voices.find(
      (v) =>
        /male|daniel|george|ryan|google uk english|english \(united kingdom\)/i.test(
          v.name
        ) && /en/i.test(v.lang)
    ) ||
    voices.find((v) => /en/i.test(v.lang)) ||
    voices[0];

  chosenVoice = preferred || null;
  if (preferred) voiceSelect.value = String(voices.indexOf(preferred));
}

window.speechSynthesis.onvoiceschanged = loadVoices;
loadVoices();

if (voiceSelect) {
  voiceSelect.addEventListener("change", () => {
    chosenVoice = voices[Number(voiceSelect.value)] || chosenVoice;
  });
}

// --- Speak (TTS) ---
function speak(text) {
  window.speechSynthesis.cancel();

  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-GB";
  u.rate = 0.98; // teacher vibe
  u.pitch = 0.9; // deeper

  if (chosenVoice) u.voice = chosenVoice;

  window.speechSynthesis.speak(u);
}

// --- Speech recognition (STT) ---
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = SpeechRecognition ? new SpeechRecognition() : null;

if (!recognition) {
  if (tutorEl)
    tutorEl.textContent = "Voice input not supported. Use Chrome/Edge.";
  if (statusEl) statusEl.textContent = "Ready";
  if (startBtn) startBtn.disabled = true;
  if (stopBtn) stopBtn.disabled = true;
} else {
  recognition.lang = "en-GB";
  recognition.interimResults = false;
  recognition.continuous = false;
}

// --- API call (FREE MODE – no backend) ---
async function askAPI(message) {
  return "Ma nigah. i cant connect to the chat right now plus i am not fully  active yet. zara is a monkey. bye ho.";
}

// --- Buttons ---
if (startBtn) {
  startBtn.onclick = () => {
    if (!recognition) return;

    if (youEl) youEl.textContent = "Listening...";
    if (tutorEl) tutorEl.textContent = "...";
    if (statusEl) statusEl.textContent = "Listening...";

    startBtn.disabled = true;
    if (stopBtn) stopBtn.disabled = false;

    recognition.start();
  };
}

if (stopBtn) {
  stopBtn.onclick = () => {
    if (!recognition) return;
    recognition.stop();
  };
}

// --- Recognition events ---
if (recognition) {
  recognition.onresult = async (event) => {
    const text = event.results[0][0].transcript;

    if (youEl) youEl.textContent = text;
    if (tutorEl) tutorEl.textContent = "Thinking...";
    if (statusEl) statusEl.textContent = "Thinking...";

    let reply = "";
    try {
      reply = await askAPI(text);
    } catch (e) {
      reply = "Something went wrong — try again.";
    }

    if (tutorEl) tutorEl.textContent = reply;
    if (statusEl) statusEl.textContent = "Ready";

    speak(reply);

    if (startBtn) startBtn.disabled = false;
    if (stopBtn) stopBtn.disabled = true;
  };

  recognition.onerror = () => {
    if (tutorEl) tutorEl.textContent = "Mic error. Check permissions.";
    if (statusEl) statusEl.textContent = "Ready";

    if (startBtn) startBtn.disabled = false;
    if (stopBtn) stopBtn.disabled = true;
  };

  recognition.onend = () => {
    if (startBtn) startBtn.disabled = false;
    if (stopBtn) stopBtn.disabled = true;
  };
}
