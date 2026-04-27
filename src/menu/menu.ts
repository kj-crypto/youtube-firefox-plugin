import {
  appToggleButtonMessage,
  showPlaylistMessage,
  savePlaylistMessage,
  createNewPlaylistMessage,
} from '../background/app_state';

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
  browser.runtime.sendMessage({ type: appToggleButtonMessage, payload: { enabled: isChecked } });
});

showBtn.addEventListener('click', () => {
  browser.runtime.sendMessage({ type: showPlaylistMessage });
  window.close();
});

dumpBtn.addEventListener('click', () => {
  console.log('Dump clicked');
  browser.runtime.sendMessage({ type: savePlaylistMessage });
  window.close();
});

newPlaylistBtn.addEventListener('click', () => {
  console.log('New playlist clicked');
  const playlistName = playlistNameInput.value;
  browser.runtime.sendMessage({ type: createNewPlaylistMessage, payload: { name: playlistName } });
  window.close();
});

loadPlaylistBtn.addEventListener('click', () => {
  console.log('Load playlist clicked');
});
