import { Playlist } from './playlist';

export const appState = {
  isPluginActive: true,
  playlists: [] as Playlist[],
  playlistIndex: 0,

  setVideoIds(videoIds: string[]) {
    this.playlists[this.playlistIndex].setVideoIds(videoIds);
  },

  getAllNames() {
    const obj: Record<string, number> = {};
    for (let i = 0; i < this.playlists.length; ++i) {
      obj[this.playlists[i].getName()] = i;
    }
    return obj;
  },

  saveToStorage() {
    browser.storage.local.set({
      isPluginActive: this.isPluginActive,
      playlists: this.playlists,
      index: this.playlistIndex,
    });
  },

  updateFromStorage() {
    browser.storage.local.get(['isPluginActive', 'playlists', 'index']).then((result) => {
      this.isPluginActive = result.isPluginActive;
      this.playlists = result.playlists;
      this.playlistIndex = result.index;
    });
  },
};

export type AppState = typeof appState;

export type Message = {
  type: string;
  payload: Record<string, any>;
};
export const videosChangeMessage = 'VIDEO_LIST_CHANGED';

browser.runtime.onMessage.addListener((message: Message) => {
  if (message.type === videosChangeMessage) {
    console.log('+++ Video list changed', message);
    // appState.setVideoIds(message.payload.videoIds);
    // browser.storage.local.set({ playlists: appState.playlists });
  }
});

export const showPlaylistMessage = 'SHOW_PLAYLIST_JSON_IN_NEW_TAB';
export const savePlaylistMessage = 'SAVE_PLAYLIST_TO_FILE';
export const playlistMetaUpdateMessage = 'UPDATE_QUEUE_ID_OR_NAME';
export const createNewPlaylistMessage = 'CREATE_NEW_PLAYLIST';
export const injectCredentialsRetrieverMessage = 'INJECT_CREDENTIALS_RETRIEVER';
