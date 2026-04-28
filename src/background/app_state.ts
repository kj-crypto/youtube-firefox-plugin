import { Playlist } from './playlist';

export const appState = {
  isPluginActive: true,
  playlists: [] as Playlist[],
  playlistIndex: 0,
  youtubePlaylistId: null as string | null,

  setVideoIds(videoIds: string[]) {
    this.playlists[this.playlistIndex].setVideoIds(videoIds);
  },

  pushVideoId(videoIs: string) {
    this.playlists[this.playlistIndex].addVideoId(videoIs);
  },

  getCurrentPlaylistName() {
    return this.playlists[this.playlistIndex].getName();
  },

  getCurrentVideoIds() {
    return this.playlists[this.playlistIndex].getVideoIds();
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

  async updateFromStorage() {
    const result = await browser.storage.local.get(['isPluginActive', 'playlists', 'index']);
    this.isPluginActive = result.isPluginActive;
    this.playlists = result.playlists;
    this.playlistIndex = result.index;
  },
};

export type AppState = typeof appState;
export type Message = {
  type: string;
  payload: Record<string, any>;
};

export const videosChangeMessage = 'VIDEO_LIST_CHANGED';
export const showPlaylistMessage = 'SHOW_PLAYLIST_JSON_IN_NEW_TAB';
export const savePlaylistMessage = 'SAVE_PLAYLIST_TO_FILE';
export const playlistMetaUpdateMessage = 'UPDATE_QUEUE_ID_OR_NAME';
export const createNewPlaylistMessage = 'CREATE_NEW_PLAYLIST';
export const injectCredentialsRetrieverMessage = 'INJECT_CREDENTIALS_RETRIEVER';
export const loadPlaylistMessage = 'LOAD_PLAYLIST';
export const appToggleButtonMessage = 'TOGGLE_PLUGIN_BUTTON';
