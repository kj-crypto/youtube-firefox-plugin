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

function sendStates() {
  const eomData = (window.ytcfg?.data_?.EOM_VISITOR_DATA ?? '') as string;
  const clientVersion = (window.ytcfg?.data_?.INNERTUBE_CLIENT_VERSION ?? '') as string;
  const userAgent = (window.ytcfg?.data_?.INNERTUBE_CONTEXT?.client?.userAgent ?? '') as string;
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

function setup_script() {
  window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    if (event.data.type === messageType) {
      browser.runtime.sendMessage({
        ...event.data,
      });
    }
  });

  const script = document.createElement('script');
  script.textContent = `<script-placeholder>`;
  document.documentElement.appendChild(script);
}

export const code = `${setup_script.toString()}\n\n${setup_script.name}();`
  .replace('<script-placeholder>', `(${sendStates.toString()})();`)
  .replaceAll('messageType', `'${messageType}'`);
