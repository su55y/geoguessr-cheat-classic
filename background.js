chrome.browserAction.onClicked.addListener(() => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tab) {
    chrome.tabs.sendMessage(tab[0].id, { message: 'icon_clicked' })
  })
})
