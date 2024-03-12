chrome.runtime.onInstalled.addListener(async (opt) => {
  // Check if reason is install or update. Eg: opt.reason === 'install' // If extension is installed.
  // opt.reason === 'update' // If extension is updated.
  if (opt.reason === 'install') {
    await chrome.storage.local.clear()

    chrome.tabs.create({
      active: true,
      // Open the setup page and append `?type=install` to the URL so frontend
      // can know if we need to show the install page or update page.
      url: chrome.runtime.getURL('./src/setup/index.html?type=install'),
    })
  }

  if (opt.reason === 'update') {
    chrome.tabs.create({
      active: true,
      url: chrome.runtime.getURL('./src/setup/index.html?type=update'),
    })
  }
})

self.onerror = function (message, source, lineno, colno, error) {
  console.info(
    `Error: ${message}\nSource: ${source}\nLine: ${lineno}\nColumn: ${colno}\nError object: ${error}`
  )
}

chrome.webNavigation.onCommitted.addListener(async (details) => {
  try {
    let currentTabId = details.tabId;
    const bannedUrls = await getBannedUrlList();
    for (let url of bannedUrls) {
      if (details.url.includes(url)) {
        chrome.tabs.remove(currentTabId);
        break;
      }
    }

  } catch(e) {
    console.error('Error in onCommitted', e);
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  try {
    if (message.to === 'background') {
      console.log('Message received in background', message);
      if (message.action === 'banUrl') {
        banUrl(message)
        sendResponse({ success: true, message: 'Message received' })
      }

      if (message.action === 'getBannedUrlList') {
        getBannedUrlList().then((bannedUrls) => {
          sendResponse({ success: true, bannedUrls })
        });
      }
      
    } else {
      sendResponse({ success: false, error: 'Invalid recipient' })
    }
  }
  catch (error) {
    console.error('Error in onMessage', error);
    sendResponse({ success: false, error: error.message });
  }
  return true;
})

export {}
function banUrl(message: any) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get('bannedUrls', (result) => {
      const bannedUrls = result.bannedUrls || []

      bannedUrls.push(message.payload);
      chrome.storage.local.set({ bannedUrls });
    })
    resolve(true);
  })
}

function getBannedUrlList() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get('bannedUrls', (result) => {
      resolve(result.bannedUrls || [])
    })
  })
}

