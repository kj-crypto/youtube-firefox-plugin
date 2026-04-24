import { initialize } from '../initialize_session';

const toggleInput = document.getElementById('toggle') as HTMLInputElement;
const toggleText = document.querySelector('.toggle-text') as HTMLSpanElement;
const showBtn = document.getElementById('show') as HTMLButtonElement;
const dumpBtn = document.getElementById('dump') as HTMLButtonElement;
const playlistNameInput = document.getElementById('playlist-name') as HTMLInputElement;
const newPlaylistBtn = document.getElementById('new-playlist') as HTMLButtonElement;
const loadPlaylistBtn = document.getElementById('load-playlist') as HTMLButtonElement;
const playlistControls = document.getElementById('playlist-controls') as HTMLDivElement;

toggleInput.addEventListener('change', () => {
  const isChecked = toggleInput.checked;
  toggleText.textContent = isChecked ? 'On' : 'Off';
  playlistControls.classList.toggle('disable', !isChecked);
  console.log('Update app state');
});

showBtn.addEventListener('click', () => {
  console.log('Show clicked');
});

dumpBtn.addEventListener('click', () => {
  console.log('Dump clicked');
});

newPlaylistBtn.addEventListener('click', () => {
  console.log('New playlist clicked');
  initialize(['eFtiwNUDIcs', 'B_vatDn6G4g', 'YP3W-E0OamU'], 'Custom name from menu');
});

loadPlaylistBtn.addEventListener('click', () => {
  console.log('Load playlist clicked');
});
