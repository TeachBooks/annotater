document.addEventListener("DOMContentLoaded", function() {
    chrome.storage.local.get({ highlights: [] }, function(result) {
        const highlights = result.highlights;
        highlights.forEach(highlight => {
            if (highlight.url === window.location.href) {
                applyHighlight(highlight);
            }
        });
    });
});

function applyHighlight(highlight) {
    const range = document.createRange();
    const startContainer = findTextNode(document.body, highlight.rangeInfo.startContainer);
    const endContainer = findTextNode(document.body, highlight.rangeInfo.endContainer);

    if (startContainer && endContainer) {
        range.setStart(startContainer, highlight.rangeInfo.startOffset);
        range.setEnd(endContainer, highlight.rangeInfo.endOffset);
        highlightText(range);
    }
}

function findTextNode(element, text) {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
    while (walker.nextNode()) {
        if (walker.currentNode.textContent.includes(text)) {
            return walker.currentNode;
        }
    }
    return null;
}

function highlightText(range) {
    const span = document.createElement("span");
    span.style.backgroundColor = "yellow";
    range.surroundContents(span);
}
