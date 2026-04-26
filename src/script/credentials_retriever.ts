export {};

declare global {
  interface Window {
    ytcfg?: Record<string, any>;
  }
}

export const messageType = 'YT_CFG_DATA';
export const payloadSchema = {
  eomData: '',
  clientVersion: '',
  userAgent: '',
};
export type Payload = typeof payloadSchema;
export type Message = {
  type: string;
  payload: Payload;
};

/**
 * This function must be executed in webpage context to retrieve credentials
 */
function sendCredentials() {
  console.log('+++ send state started');
  const eomData = (window.ytcfg?.data_?.EOM_VISITOR_DATA ?? '') as string;
  const clientVersion = (window.ytcfg?.data_?.INNERTUBE_CLIENT_VERSION ?? '') as string;
  const userAgent = (window.ytcfg?.data_?.INNERTUBE_CONTEXT?.client?.userAgent ?? '') as string;
  console.log('+++ send state', { eomData, clientVersion, userAgent });
  window.postMessage(
    {
      type: messageType,
      payload: {
        eomData,
        clientVersion,
        userAgent,
      },
    } as Message,
    '*'
  );
}

function inject_script() {
  window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    if (event.data.type === messageType) {
      console.log('+++ receive message from webpage script', event.data, 'sending to background');
      browser.runtime.sendMessage({
        ...event.data,
      });
    }
  });

  const code = `${sendCredentials.toString()}\n\n${sendCredentials.name}();`.replaceAll(
    'messageType',
    `'${messageType}'`
  );
  console.log('Try to inject script:');
  console.log(code);
  const script = document.createElement('script');
  script.textContent = code;
  document.documentElement.appendChild(script);
}

inject_script();
new MutationObserver(inject_script).observe(document.body, {
  childList: true,
  subtree: true,
});
