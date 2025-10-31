// ====== CONFIG: update songs array with your filenames (in songs/ folder) ======
const songs = [
  { title: "Polladhvan BGM", artist: "GV Prakesh", src: "songs/song1.mp3", cover: "assets/cover1.jpg" },
  { title: "Thalaiva BGM", artist: "GV Prakesh", src: "songs/song2.mp3", cover: "assets/cover2.jpg" },
  { title: "Pirai Thedum", artist: "GV Prakesh", src: "songs/song3.mp3", cover: "assets/cover3.jpg" }
];
// ============================================================================

/* DOM elements */
const audio = document.getElementById("audio");
const playBtn = document.getElementById("play");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const shuffleBtn = document.getElementById("shuffle");
const repeatBtn = document.getElementById("repeat");
const progress = document.getElementById("progress");
const currentTimeEl = document.getElementById("currentTime");
const durationEl = document.getElementById("duration");
const volumeEl = document.getElementById("volume");
const titleEl = document.getElementById("title");
const artistEl = document.getElementById("artist");
const coverEl = document.getElementById("cover");
const playlistEl = document.getElementById("playlist");

const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");

let currentIndex = 0;
let isPlaying = false;
let isShuffle = false;
let isRepeat = false;

/* Initialize UI */
function buildPlaylist(){
  playlistEl.innerHTML = "";
  songs.forEach((s, i) => {
    const li = document.createElement("li");
    li.dataset.index = i;
    li.innerHTML = `
      <div class="p-info">
        <strong>${s.title}</strong><div style="color:var(--muted);font-size:13px">${s.artist}</div>
      </div>
      <div class="p-time">3:30</div>
    `;
    li.addEventListener("click", () => {
      loadSong(i);
      playSong();
    });
    playlistEl.appendChild(li);
  });
}

function updateActivePlaylist(){
  [...playlistEl.children].forEach(li => li.classList.remove("active"));
  const active = playlistEl.querySelector(`[data-index='${currentIndex}']`);
  if(active) active.classList.add("active");
}

/* Load & Play */
function loadSong(index){
  if(index < 0) index = songs.length - 1;
  if(index >= songs.length) index = 0;
  currentIndex = index;
  const s = songs[currentIndex];
  audio.src = s.src;
  titleEl.textContent = s.title;
  artistEl.textContent = s.artist || "";
  coverEl.src = s.cover || "assets/placeholder.jpg";
  updateActivePlaylist();
}

/* Play / Pause */
function playSong(){
  audio.play().then(() => {
    isPlaying = true;
    playBtn.innerHTML = `<i class="fa-solid fa-pause"></i>`;
  }).catch(err => {
    // autoplay blocked: user must interact
    console.log("play blocked", err);
  });
}
function pauseSong(){
  audio.pause();
  isPlaying = false;
  playBtn.innerHTML = `<i class="fa-solid fa-play"></i>`;
}

/* Buttons */
playBtn.addEventListener("click", () => {
  if(audio.src === "") loadSong(currentIndex);
  if(!isPlaying) playSong(); else pauseSong();
});

nextBtn.addEventListener("click", () => {
  if(isShuffle) {
    playRandom();
  } else {
    loadSong(currentIndex + 1);
    playSong();
  }
});
prevBtn.addEventListener("click", () => {
  loadSong(currentIndex - 1);
  playSong();
});

shuffleBtn.addEventListener("click", () => {
  isShuffle = !isShuffle;
  shuffleBtn.classList.toggle("active", isShuffle);
});
repeatBtn.addEventListener("click", () => {
  isRepeat = !isRepeat;
  repeatBtn.classList.toggle("active", isRepeat);
});

/* Random */
function playRandom(){
  const next = Math.floor(Math.random() * songs.length);
  loadSong(next);
  playSong();
}

/* Progress */
audio.addEventListener("loadedmetadata", () => {
  durationEl.textContent = formatTime(audio.duration);
});
audio.addEventListener("timeupdate", () => {
  if(audio.duration){
    const percent = (audio.currentTime / audio.duration) * 100;
    progress.value = percent;
    currentTimeEl.textContent = formatTime(audio.currentTime);
  }
});
progress.addEventListener("input", () => {
  if(audio.duration){
    audio.currentTime = (progress.value / 100) * audio.duration;
  }
});

/* Volume */
volumeEl.addEventListener("input", () => {
  audio.volume = volumeEl.value;
});

/* Ended */
audio.addEventListener("ended", () => {
  if(isRepeat) {
    audio.currentTime = 0;
    playSong();
  } else if(isShuffle) {
    playRandom();
  } else {
    loadSong(currentIndex + 1);
    playSong();
  }
});

/* Utils */
function formatTime(seconds){
  if(!seconds || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

/* Theme handling */
function applyTheme(theme){
  if(theme === "light"){
    document.documentElement.classList.add("light");
    themeIcon.className = "fa-solid fa-sun";
  } else {
    document.documentElement.classList.remove("light");
    themeIcon.className = "fa-solid fa-moon";
  }
  localStorage.setItem("cw_theme", theme);
}
themeToggle.addEventListener("click", () => {
  const cur = localStorage.getItem("cw_theme") === "light" ? "light" : "dark";
  const next = cur === "light" ? "dark" : "light";
  applyTheme(next);
});

/* Init */
(function init(){
  buildPlaylist();
  loadSong(0);
  updateActivePlaylist();

  // set default volume
  audio.volume = parseFloat(volumeEl.value);

  // restore theme
  const saved = localStorage.getItem("cw_theme") || "dark";
  applyTheme(saved);
})();
