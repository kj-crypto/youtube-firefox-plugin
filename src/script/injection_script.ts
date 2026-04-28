// @ts-ignore
import inlineCss from './styles.css?inline';
import {
  Message,
  videosChangeMessage,
  playlistMetaUpdateMessage,
  createNewPlaylistMessage,
} from '../background/app_state';
import { addToQueue } from './innertube_commands';

function createIcon(size: number = 24) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', size.toString());
  svg.setAttribute('height', size.toString());
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.classList.add('my-plus-icon');

  // --- SCALING MODEL ---
  const cx = 50 as number;
  const cy = 50 as number;
  const radius = 50 as number; // full circle
  const arm = radius * 0.6; // plus arm length (60% of radius)
  const stroke = radius * 0.2; // plus thickness (20% of radius)

  // --- CIRCLE ---
  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  circle.setAttribute('cx', cx.toString());
  circle.setAttribute('cy', cy.toString());
  circle.setAttribute('r', radius.toString());
  circle.setAttribute('fill', 'currentColor');

  // --- PLUS SIGN ---
  const plus = document.createElementNS('http://www.w3.org/2000/svg', 'path');

  plus.setAttribute(
    'd',
    `
      M ${cx} ${cy - arm}
      V ${cy + arm}
      M ${cx - arm} ${cy}
      H ${cx + arm}
    `
  );

  plus.setAttribute('stroke', 'currentColor');
  plus.setAttribute('stroke-width', stroke.toString());
  plus.setAttribute('stroke-linecap', 'round');

  svg.appendChild(circle);
  svg.appendChild(plus);
  return svg;
}

function createIconButton(size: number, labelText: string, id: string = 'my-icon-btn') {
  const wrapper = document.createElement('div');
  wrapper.id = id;
  wrapper.appendChild(createIcon(size));
  const label = document.createElement('span');
  label.textContent = labelText;
  wrapper.appendChild(label);
  return wrapper;
}

function setStyle(id: string) {
  if (document.getElementById(id)) return;
  const style = document.createElement('style');
  style.id = `${id}-style`;
  style.textContent = inlineCss;
  document.head.appendChild(style);
}

class Injector {
  private elementID = 'my-icon-btn' as string;
  private container: HTMLElement | null;
  private icon: HTMLElement;
  private playlist = {
    id: null as string | null,
    title: '',
    videoIds: [] as string[]
  }
  constructor(size: number = 28, label: string = 'Add to playlist') {
    this.container = document.querySelector('div#container.style-scope.ytd-masthead') as HTMLElement | null;
    this.icon = createIconButton(size, label, this.elementID);
    this.apply = this.apply.bind(this); // bind to avoid context issues in mutation observer
  }

  private isBlocked(): boolean {
    return this.container?.dataset.injected === '1';
  }
  private block() {
    if (this.container) this.container.dataset.injected = '1';
  }

  apply() {
    if (this.isBlocked()) return;
    const center = this.container?.querySelector('div#center');
    setStyle(this.elementID);
    center?.prepend(this.icon);

    this.icon.onclick = () => {
      console.log('Add ++ clicked', window.location.href);
      const videoId = retrieveVideoIdFromUrl(window.location.href);
      console.log('+++ Video ID', videoId, 'Queue ID', this.playlist.id);
      if (!videoId || !this.playlist.id) {
        console.warn("[Playlist Addon] Cannot add video to playlist - video ID or playlist ID is not set");
        return;
      }
      if (this.playlist.videoIds.includes(videoId)) {
        console.warn("[Playlist Addon] Video already in playlist");
        return;
      }
      const code = `(${addToQueue.toString()})("${videoId}", "${this.playlist.id}")`;
      console.log(code);
      const script = document.createElement('script');
      script.textContent = code;
      document.documentElement.appendChild(script);
      setTimeout(() => script.remove(), 2_000);
      this.playlist.videoIds.push(videoId);
      browser.runtime.sendMessage({ type: videosChangeMessage, payload: { videoId } });
    };

    this.block();
  }

  updatePlaylist(playlistId: string, videoIds: string[], playlistTitle: string) {
    this.playlist.id = playlistId;
    this.playlist.title = playlistTitle;
    this.playlist.videoIds = videoIds;
  }
}

const injector = new Injector(28, 'Add to playlist');
injector.apply();

new MutationObserver(injector.apply).observe(document.body, {
  childList: true,
  subtree: true,
});

browser.runtime.onMessage.addListener((message: Message) => {
  console.log('+++ Injected script message received', message);
  if (message.type === playlistMetaUpdateMessage) {
    console.log('+++ Update playlist', message);
    const {playlistId, playlistTitle, videoIds } = message.payload;
    injector.updatePlaylist(playlistId, videoIds, playlistTitle);
  }
});

function cleanup() {
  ['div#chat-container', 'div#donation-shelf', 'div#related'].forEach((selector: string) => {
    document.querySelector(selector)?.remove();
  });
}

cleanup();
new MutationObserver(cleanup).observe(document.body, {
  childList: true,
  subtree: true,
});

function retrieveVideoIdFromUrl(url: string) {
  const regexExp = /watch\?v=([a-zA-Z0-9_\-]+)(&|$)/;
  const match = url.match(regexExp);
  if (match && match[1]) return match[1];
  return null;
}

class PlayListObserver {
  private playlistSize = 0;
  private lastVideoIds = "";

  constructor() {
    this.updateAppState = this.updateAppState.bind(this);
  }

  retrieveVideoIds(rootNode: Element): string[] {
    type PolymerElement = Element & { data: Record<string, any> };
    const children = Array.from(rootNode.children || []) as PolymerElement[];
    let videoIds = [] as string[];

    for (const child of children) {
      const a = child.querySelector('a');
      const videoId = retrieveVideoIdFromUrl(a?.href || '');
      if (videoId) videoIds.push(videoId);
    }
    return videoIds;
  }

  checkState() {
    console.log("Checking state");
    const watchModePlaylistContainer = document.querySelector('ytd-playlist-panel-renderer #items');
    const playlistModePlaylistContainer = document.querySelector('div#contents.ytd-playlist-video-list-renderer');
    const playlistSize = watchModePlaylistContainer?.children?.length || 0;
    const playlistModePlaylistSize = playlistModePlaylistContainer?.children?.length || 0;

    // Pure playlist view case
    if (playlistSize === 0 && playlistModePlaylistSize > 0) {
      return { triggerUpdate: true, rootNode: playlistModePlaylistContainer! };
    }
    if (playlistSize !== this.playlistSize) {
      this.playlistSize = playlistSize;
      return { triggerUpdate: true, rootNode: watchModePlaylistContainer! };
    }
    return { triggerUpdate: false };
  }

  updateAppState() {
    const { triggerUpdate, rootNode } = this.checkState();
    if (!triggerUpdate) return;
    const videoIds = this.retrieveVideoIds(rootNode!);
    const currentVideoIds = JSON.stringify(videoIds);
    if (currentVideoIds === this.lastVideoIds) return;
    this.lastVideoIds = currentVideoIds;
    console.log('[Playlist Addon] Changed Video IDs:', videoIds);
    browser.runtime.sendMessage({
      type: videosChangeMessage,
      payload: { videoIds },
    });
  }
}

if(window.location.href.startsWith("https://www.youtube.com/playlist?list=")) {

  const playlistObserver = new PlayListObserver();
  new MutationObserver(playlistObserver.updateAppState).observe(document.body, {
    childList: true,
    subtree: true,
  });
}

console.log('[Playlist Addon] Content script loaded at', new Date().toISOString());
