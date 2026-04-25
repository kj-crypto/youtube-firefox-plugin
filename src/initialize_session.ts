import { Message, Payload, messageType, code, payloadSchema } from './script/startup_script';
import { urlJoin, validateResponse } from './utils';

const origin = 'https://www.youtube.com';

export function initialize(playlistTitle: string, videoIds?: string[]) {
  let resolveYtCredentials: (payload: Payload) => void;
  const ytCredentialsPromise = new Promise<Payload>((resolve) => {
    resolveYtCredentials = resolve;
  });

  const listener = (message: Message) => {
    if (message.type === messageType) {
      console.log('Credentials fetched');
      validateResponse(message.payload, payloadSchema);
      browser.runtime.onMessage.removeListener(listener);
      resolveYtCredentials(message.payload);
    }
  };
  browser.runtime.onMessage.addListener(listener);

  async function process() {
    const tabId = (await browser.tabs.create({ url: origin })).id || 0;
    browser.tabs.executeScript(tabId, { code: code });
    const ytCfg = await ytCredentialsPromise;

    browser.webRequest.onBeforeSendHeaders.addListener(
      (details) => {
        let headers = details.requestHeaders || [];
        for (let i = 0; i < headers?.length; i++) {
          if (headers[i].name.toLowerCase() === 'user-agent') {
            headers[i].value = ytCfg.userAgent;
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
        'X-YouTube-Client-Version': ytCfg.clientVersion,
        'X-Goog-EOM-Visitor-Id': ytCfg.eomData,
        'X-Goog-AuthUser': '0',
      },

      body: JSON.stringify({
        context: {
          client: {
            clientName: 'WEB',
            clientVersion: ytCfg.clientVersion,
            visitorData: ytCfg.eomData,
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
    const targetUrl = urlJoin(origin, (!videoIds || videoIds.length === 0) ? "" : `/playlist?list=${playlistId}`);
    await browser.tabs.update(tabId, { url: targetUrl, active: true });
    // TODO: send message here
    // browser.tabs.;
  }

  process()
    .then(() => {})
    .catch((err) => console.error(err));
}
