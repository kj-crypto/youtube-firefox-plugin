import { credentialsRetrieverMessage, Message } from './types';

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
      type: credentialsRetrieverMessage,
      credentials: {
        eomData,
        clientVersion,
        userAgent,
      },
    } as Message,
    '*'
  );
}

function inject_script(timeout: number) {
  return new Promise((resolve, reject) => {
    window.addEventListener('message', function handler(event) {
      if (event.source !== window) return;
      if (event.data.type === credentialsRetrieverMessage) {
        console.log('+++ receive message from webpage script', event.data, 'promise resolving');
        window.removeEventListener('message', handler);
        resolve(event.data.credentials);
      }
    });
    const script = document.createElement('script');
    script.textContent = '<code-placeholder>';
    document.documentElement.appendChild(script);
    script.remove();
    setTimeout(() => reject(new Error('Credentials retrieval timeout')), timeout);
  });
}

export function generateInjectCode(timeout: number) {
  return `(${inject_script.toString()})(${timeout})`
    .replace('"<code-placeholder>"', `\`(${sendCredentials.toString()})()\``)
    .replace('credentialsRetrieverMessage', `"${credentialsRetrieverMessage}"`);
}
