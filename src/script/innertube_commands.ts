/**
 * Youtube internal API aka InnerTube commands for playlist
 * Those scripts must to be injected into webpage content to get access to
 * yt-app polymer command api
 */
type PolymerElement = HTMLElement & {
  data?: Record<string, any>;
  resolveCommand?: (command: Record<string, any>) => void;
};

export function addToQueue(videoId: string, playlistId: string) {
  const command = {
    commandMetadata: {
      webCommandMetadata: {
        sendPost: true,
        apiUrl: '/youtubei/v1/browse/edit_playlist',
      },
    },
    playlistEditEndpoint: {
      playlistId,
      actions: [
        {
          addedVideoId: videoId,
          action: 'ACTION_ADD_VIDEO',
        },
      ],
    },
  };

  const app = document.querySelector("ytd-app") as PolymerElement;
    if (!app?.resolveCommand) {
      console.error("[Playlist Addon] resolveCommand not found");
    } else {
      app?.resolveCommand?.call(app, command)
    }
}

export function removeFromQueue(videoId: string, playlistId: string) {
  const command = {
    commandMetadata: {
      webCommandMetadata: {
        sendPost: true,
        apiUrl: '/youtubei/v1/browse/edit_playlist',
      },
    },
    playlistEditEndpoint: {
      playlistId,
      actions: [
        {
          addedVideoId: videoId,
          action: 'ACTION_REMOVE_VIDEO',
        },
      ],
    },
  };

  document.querySelector<PolymerElement>('ytd-app')?.resolveCommand?.(command);
}

export function clearQueue() {
  const queueId = document.querySelector<PolymerElement>('ytd-playlist-panel-renderer')?.data?.playlistId;

  if (queueId) {
    const command = {
      signalServiceEndpoint: {
        signal: 'CLIENT_SIGNAL',
        actions: [
          {
            endPlaylistCommand: {
              closeListPanel: true,
              listId: queueId,
              listType: 'PLAYLIST_EDIT_LIST_TYPE_QUEUE',
            },
          },
        ],
      },
    };

    document.querySelector<PolymerElement>('ytd-app')?.resolveCommand?.(command);
  }
}

export function getCurrentVideoId() {
  return document.querySelector<PolymerElement>('ytd-app')?.data?.playerResponse?.videoDetails?.videoId || [];
}
