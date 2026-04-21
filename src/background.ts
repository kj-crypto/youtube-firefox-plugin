const appState = {
  isActive: true,
};

const domainName = 'youtube.com';

type Tab = browser.tabs.Tab;
type TabsOnUpdatedChangeInfo = browser.tabs._OnUpdatedChangeInfo;

browser.tabs.onUpdated.addListener((tabId: number, changeInfo: TabsOnUpdatedChangeInfo, tab: Tab) => {
  if (appState.isActive && tab.url?.startsWith(`https://www.${domainName}`) && changeInfo.status === 'complete') {
    browser.tabs.executeScript(tabId, {
      file: 'injection_script.js',
    });
  }
});
