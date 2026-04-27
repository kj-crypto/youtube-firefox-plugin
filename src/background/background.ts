import {
  appState,
  createNewPlaylistMessage,
  Message,
  playlistMetaUpdateMessage,
  savePlaylistMessage,
  showPlaylistMessage,
} from './app_state';
import { initializePlaylist, origin } from './initialize';
import { Playlist } from './playlist';

type Tab = browser.tabs.Tab;
type TabsOnUpdatedChangeInfo = browser.tabs._OnUpdatedChangeInfo;

browser.tabs.onUpdated.addListener((tabId: number, changeInfo: TabsOnUpdatedChangeInfo, tab: Tab) => {
  if (appState.isPluginActive && tab.url?.startsWith(origin) && changeInfo.status === 'complete') {
    console.log('Injecting script');
    browser.tabs
      .executeScript(tabId, {
        file: 'injection_script.js',
      })
      .then(() => {
        if (appState.youtubePlaylistId) {
          console.log('Sending message');
          browser.tabs.sendMessage(tabId, {
            type: playlistMetaUpdateMessage,
            payload: {
              playlistId: appState.youtubePlaylistId,
              playlistTitle: appState.getCurrentPlaylistName(),
            },
          });
        }
      });
  }
});

browser.runtime.onMessage.addListener((message: Message) => {
  console.log('Message received', message);
  if (message.type === showPlaylistMessage) {
    const json = JSON.stringify(appState.playlists);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    browser.tabs.create({ url });
  }
  if (message.type === savePlaylistMessage) {
    const json = JSON.stringify(appState.playlists, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    browser.downloads.download({
      url,
      filename: `youtube_playlists_${Date.now()}.json`,
      saveAs: false,
    });
  }
  if (message.type === createNewPlaylistMessage) {
    const playlistName = message.payload.name;
    console.log('Creating new playlist', playlistName);
    const playlist = new Playlist(playlistName);
    initializePlaylist(playlistName, ['ZP7EtjwlQXo']).then((response) => {
      console.log('Playlist ID', response.playlistId);
      console.log('Target URL', response.targetUrl);

      appState.youtubePlaylistId = response.playlistId;
      appState.playlists.push(playlist);
      appState.playlistIndex = appState.playlists.length - 1;

      console.log('Updating tab ...');
      browser.tabs.update(response.tabId, { url: response.targetUrl, active: true });
    });
  }
  return true;
});
