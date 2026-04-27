import { generateInjectCode } from '../script/credentials_retriever';
import { credentialsSchema } from '../script/types';
import { playlistMetaUpdateMessage } from './app_state';

const origin = 'https://www.youtube.com';

export async function initializePlaylist(playlistTitle: string, videoIds?: string[]) {
  console.log('proccess started');
  const tabId = (await browser.tabs.create({ url: origin })).id || 0;

  console.log('Try to inject credentials retriever script');
  const [credentials] = await browser.tabs.executeScript(tabId, { code: generateInjectCode(20_000) });
  console.log('+++ Credentials', credentials);
  validateResponse(credentials, credentialsSchema);

  browser.webRequest.onBeforeSendHeaders.addListener(
    (details) => {
      let headers = details.requestHeaders || [];
      for (let i = 0; i < headers?.length; i++) {
        if (headers[i].name.toLowerCase() === 'user-agent') {
          headers[i].value = credentials.userAgent;
        }
        if (headers[i].name.toLowerCase() === 'origin') {
          headers[i].value = origin;
        }
      }
      return {
        requestHeaders: headers,
      };
    },
    {
      urls: [urlJoin(origin, '/*')],
    },
    ['blocking', 'requestHeaders']
  );

  const response = await fetch(urlJoin(origin, '/youtubei/v1/playlist/create?prettyPrint=false'), {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-Origin': origin,
      'X-YouTube-Client-Version': credentials.clientVersion,
      'X-Goog-EOM-Visitor-Id': credentials.eomData,
      'X-Goog-AuthUser': '0',
    },

    body: JSON.stringify({
      context: {
        client: {
          clientName: 'WEB',
          clientVersion: credentials.clientVersion,
          visitorData: credentials.eomData,
        },
      },
      title: playlistTitle,
      videoIds: videoIds || [],
      params: 'CAQ%3D',
    }),
  });

  const data = await response.json();
  const playlistId = data.playlistId || '';
  console.log('PlayListID ', playlistId);
  const targetUrl = urlJoin(origin, !videoIds || videoIds.length === 0 ? '' : `/playlist?list=${playlistId}`);
  await browser.tabs.update(tabId, { url: targetUrl, active: true });
  browser.tabs.sendMessage(tabId, { type: playlistMetaUpdateMessage, payload: { playlistId, playlistTitle } });
}

function urlJoin(...parts: string[]) {
  return parts
    .map((part) => part.replace(/\/{2,}/, '/').replace(/(^\/|\/$)/, ''))
    .join('/')
    .replace(/([a-z]+:)\//, '$1//');
}

function validateResponse(response: Record<string, any>, schema: Record<string, any>) {
  for (const key of Object.keys(schema)) {
    if (!response[key] || response[key] === '') {
      console.log('Response missing ', key);
    }
  }
}
