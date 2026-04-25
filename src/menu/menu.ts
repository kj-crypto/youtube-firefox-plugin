import { initialize } from '../initialize_session';
import { appState, showPlaylistMessage, savePlaylistMessage } from './app_state';
import { Playlist } from './playlist';

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
  const playlist = new Playlist(playlistName);
  appState.playlists.push(playlist);
  initialize(playlistName);
});

loadPlaylistBtn.addEventListener('click', () => {
  console.log('Load playlist clicked');
});
