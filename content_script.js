function getTextNodes(node) {
    let allElements = [];
    let children = node.childNodes || [];

    for (let i = 0; i < children.length; i++) {
        // storing textNodes and their original text content
        let nodeName = children[i].nodeName;
        // not entering in script and style node since we dont want to modify those
        if (nodeName === 'SCRIPT' || nodeName === 'STYLE') {
            continue;
        } else if (nodeName === '#text') {
            allElements.push({ node: children[i] });
        } else {
            allElements = allElements.concat(getTextNodes(children[i]));
        }
    }

    return allElements;
}

function highlightmatch(textNodes, regex) {
    for (let i = 0; i < textNodes.length; i++) {
        let textNode = textNodes[i];
        let text = textNode.node.textContent;

        if (text.match(regex)) {
            let newNode = document.createElement('SPAN');
            // some may hide span at that position
            newNode.style.cssText = 'display:inline';
            newNode.innerHTML = text.replace(regex, (match) => `<span style="display:inline;color:black;background:yellow">${match}</span>`);
            textNode.node.replaceWith(newNode);
            // storing newNode, it will be used while restoring
            textNode.newNode = newNode;
        }

    }
}

// this function is used to revert changes made by hilighting search text
function restoreOriginal(textNodes) {
    for (let i = 0; i < textNodes.length; i++) {
        let textNode = textNodes[i];
        if (textNode.newNode) {
            textNode.newNode.replaceWith(textNode.node);
            delete textNode.newNode;
        }
    }
}


chrome.runtime.onConnect.addListener(function (port) {
    const allTextNodes = getTextNodes(document.body);

    // failsafe
    if(port.name != 'regexSearch'){
        return;
    }

    port.onMessage.addListener(function (msg) {

        if (msg.task === 'search') {
            let regex;
            try {
                regex = new RegExp(msg.regStr, msg.extraParam);
            } catch{
                port.postMessage({ 'error': 'Invalid regex expression' });
                return;
            }
            restoreOriginal(allTextNodes);
            highlightmatch(allTextNodes, regex);
        }else if(msg.task === 'clear'){
            restoreOriginal(allTextNodes);
        }
    });

    // restoring nodes when popup is closed
    // port is disconnected if popup is closed
    port.onDisconnect.addListener(function(){
        restoreOriginal(allTextNodes);
    });
});

