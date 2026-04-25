import { appState, Message, savePlaylistMessage, showPlaylistMessage } from './menu/app_state';

type Tab = browser.tabs.Tab;
type TabsOnUpdatedChangeInfo = browser.tabs._OnUpdatedChangeInfo;

const domainName = 'https://www.youtube.com';

browser.tabs.onUpdated.addListener((tabId: number, changeInfo: TabsOnUpdatedChangeInfo, tab: Tab) => {
  if (appState.isPluginActive && tab.url?.startsWith(domainName) && changeInfo.status === 'complete') {
    browser.tabs.executeScript(tabId, {
      file: 'injection_script.js',
    });
  }
});

browser.runtime.onMessage.addListener((message: Message) => {
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
});
