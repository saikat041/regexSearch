

let port;
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    // only connecting to the tab having our contentScript contentScript
    // contentScript is only injected to http and https pages: see manifest.json
    if (tabs[0].url.startsWith('http://') || tabs[0].url.startsWith('https://')) {
        port = chrome.tabs.connect(tabs[0].id, { name: 'regexSearch' });
        port.onMessage.addListener(function (msg) {
            if ('error' in msg) {
                alert(msg.error);
            }
        });
    }
});


function onCloseBtnClick() {
    // port may not be available if pages are like: chrome://extensions, file:// etc
    if (port) {
        port.postMessage({ task: 'clear' });
    }
    window.close();
}

function onChange() {
    const input = document.getElementById('regexSearchInput');
    const checkBox = document.getElementById('caseCheckBox');
    const regStr = input.value;
    const extraParam = checkBox.checked ? 'g' : 'gi';

    // port may not be available if pages are like: chrome://extensions, file:// etc
    if (port) {
        port.postMessage({ task: 'search', regStr, extraParam });
    } else {
        alert("Search can't be done on given page");
    }

}


// adding event listner here since inline scripting is not allowed in chrome extension
document.getElementById('regexSearchInput').addEventListener('change', () => { onChange() });
document.getElementById('caseCheckBox').addEventListener('change', () => { onChange() });
document.getElementById('closeBtn').addEventListener('click', () => { onCloseBtnClick() })