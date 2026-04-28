import {
  appToggleButtonMessage,
  showPlaylistMessage,
  savePlaylistMessage,
  createNewPlaylistMessage,
  appState,
} from '../background/app_state';

const toggleInput = document.getElementById('toggle') as HTMLInputElement;
const toggleText = document.querySelector('.toggle-text') as HTMLSpanElement;
const showBtn = document.getElementById('show') as HTMLButtonElement;
const dumpBtn = document.getElementById('dump') as HTMLButtonElement;
const playlistNameInput = document.getElementById('playlist-name') as HTMLInputElement;
const newPlaylistBtn = document.getElementById('new-playlist') as HTMLButtonElement;
const loadPlaylistBtn = document.getElementById('load-playlist') as HTMLButtonElement;
const playlistControls = document.getElementById('playlist-controls') as HTMLDivElement;

function checkToggle() {
  const isChecked = toggleInput.checked;
  toggleText.textContent = isChecked ? 'On' : 'Off';
  playlistControls.classList.toggle('disable', !isChecked);
  return isChecked;
}

toggleInput.addEventListener('change', () => {
  browser.runtime.sendMessage({ type: appToggleButtonMessage, payload: { enabled: checkToggle() } });
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
  console.log(appState.getAllNames())
});

async function initialize() {
  try {
    await appState.updateFromStorage();
    console.log("Initialized states", appState)
    const { youtubePlaylistId } = await browser.storage.session.get("youtubePlaylistId");
    console.log("Youtube playlist ID", youtubePlaylistId);

    
    if (appState.isPluginActive !== undefined) {
      toggleInput.checked = appState.isPluginActive;
      checkToggle();
    }
   
    showBtn.classList.toggle("disabled", !youtubePlaylistId);
    
  } catch (error) {
    console.error('Popup initialization failed:', error);
  }
}

document.addEventListener('DOMContentLoaded', initialize);