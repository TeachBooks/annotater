// Event listener for mouse selection
document.addEventListener("mouseup", function(event) {
    const selection = window.getSelection();
    if (selection.toString().length > 0 && !event.target.closest('#floating-toolbar')) {
        console.log("Text selected: ", selection.toString());
        showFloatingToolbar(selection);
    }
});

// Event listener for clicking outside the toolbar
document.addEventListener("mousedown", function(event) {
    const toolbar = document.getElementById("floating-toolbar");
    if (toolbar && !toolbar.contains(event.target)) {
        console.log("Clicked outside toolbar, removing toolbar");
        toolbar.remove();
    }
});

// Show the floating toolbar
function showFloatingToolbar(selection) {
    const existingToolbar = document.getElementById("floating-toolbar");
    if (existingToolbar) {
        console.log("Removing existing toolbar");
        existingToolbar.remove();
    }

    const toolbar = document.createElement("div");
    toolbar.id = "floating-toolbar";
    toolbar.innerHTML = `
        <button id="annotate-btn">Annotate</button>
        <button id="highlight-btn">Highlight</button>
        <button id="remove-highlight-btn" style="display: none;">Remove Highlight</button>
    `;
    console.log("Toolbar created");

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    toolbar.style.position = "absolute";
    toolbar.style.top = `${window.scrollY + rect.top - 40}px`;
    toolbar.style.left = `${rect.left}px`;
    toolbar.style.zIndex = "10000"; // Ensure toolbar is above other elements

    document.body.appendChild(toolbar);

    console.log("Toolbar positioned at: ", toolbar.style.top, toolbar.style.left);

    const highlightButton = document.getElementById("highlight-btn");
    const removeHighlightButton = document.getElementById("remove-highlight-btn");

    if (isTextHighlighted(range)) {
        highlightButton.style.display = "none";
        removeHighlightButton.style.display = "block";
        console.log("Text is already highlighted");
    } else {
        highlightButton.style.display = "block";
        removeHighlightButton.style.display = "none";
        console.log("Text is not highlighted");
    }

    setTimeout(() => toolbar.classList.add("show"), 10);

    highlightButton.addEventListener("click", function(event) {
        event.stopPropagation();
        console.log("Highlight button clicked");
        highlightText(range);
        saveHighlight(selection.toString(), range);
        toolbar.classList.remove("show");
        setTimeout(() => toolbar.remove(), 300); // Delay removal for transition
    });

    removeHighlightButton.addEventListener("click", function(event) {
        event.stopPropagation();
        console.log("Remove highlight button clicked");
        removeHighlight(range);
        removeHighlightFromStorage(selection.toString());
        toolbar.classList.remove("show");
        setTimeout(() => toolbar.remove(), 300); // Delay removal for transition
    });

    document.getElementById("annotate-btn").addEventListener("click", function(event) {
        event.stopPropagation();
        console.log("Annotate button clicked");
        openAnnotationSidebar(selection.toString());
        toolbar.classList.remove("show");
        setTimeout(() => toolbar.remove(), 300); // Delay removal for transition
    });
}

// Function to calculate the offset within the entire parent element using markers
function calculateFullOffsetUsingMarkers(range) {
    const startMarker = document.createElement("span");
    const endMarker = document.createElement("span");

    startMarker.className = "offset-marker";
    endMarker.className = "offset-marker";

    range.insertNode(startMarker);
    range.collapse(false);
    range.insertNode(endMarker);

    const startOffset = getOffsetRelativeToParent(startMarker);
    const endOffset = getOffsetRelativeToParent(endMarker) + endMarker.textContent.length;

    startMarker.remove();
    endMarker.remove();

    return { startOffset, endOffset };
}

// Function to get the offset relative to the parent container
function getOffsetRelativeToParent(marker) {
    let offset = 0;
    let currentNode = marker.previousSibling;

    while (currentNode) {
        if (currentNode.nodeType === Node.TEXT_NODE) {
            offset += currentNode.textContent.length;
        } else if (currentNode.nodeType === Node.ELEMENT_NODE) {
            offset += currentNode.innerText.length;
        }
        currentNode = currentNode.previousSibling;
    }

    return offset;
}

// Function to save the highlight information
function saveHighlight(text, range) {
    const { startOffset, endOffset } = calculateFullOffsetUsingMarkers(range);

    const highlightData = {
        text: text,
        url: window.location.href,
        rangeInfo: {
            startOffset: startOffset,
            endOffset: endOffset,
            startXPath: getXPath(range.startContainer),
            endXPath: getXPath(range.endContainer)
        }
    };

    console.log("Saving highlight with data:", JSON.stringify(highlightData, null, 2));

    chrome.storage.local.get({ highlights: [] }, function(result) {
        const highlights = result.highlights;
        highlights.push(highlightData);
        chrome.storage.local.set({ highlights: highlights });
        console.log("Highlight saved. Current highlights:", JSON.stringify(highlights, null, 2));
    });
}

// Function to apply the saved highlights to the page
function applyHighlight(highlight) {
    const range = document.createRange();
    const startContainer = findTextNode(highlight.rangeInfo.startXPath);
    const endContainer = findTextNode(highlight.rangeInfo.endXPath);

    if (startContainer && endContainer) {
        try {
            range.setStart(startContainer, highlight.rangeInfo.startOffset);
            range.setEnd(endContainer, highlight.rangeInfo.endOffset);

            if (range.toString().length > 0) {
                highlightText(range);
                console.log("Range applied successfully. Text:", range.toString());
            } else {
                console.error("Range does not contain any text.");
            }
        } catch (e) {
            console.error("Error applying highlight:", e, "Range info:", highlight.rangeInfo);
        }
    } else {
        console.error("Failed to find text nodes to reapply highlight. Start container:", startContainer, "End container:", endContainer);
    }
}

// Highlight the selected text
function highlightText(range) {
    const span = document.createElement("span");
    span.style.backgroundColor = "yellow";
    span.className = "highlighted-text";

    range.surroundContents(span);

    console.log("Text highlighted");
}

// Remove the highlight from the selected text
function removeHighlight(range) {
    let span = range.startContainer.parentElement;
    if (span && span.classList.contains("highlighted-text")) {
        const parent = span.parentNode;
        while (span.firstChild) {
            parent.insertBefore(span.firstChild, span);
        }
        parent.removeChild(span);
        console.log("Highlight removed");
    }
}

// Check if the text is already highlighted
function isTextHighlighted(range) {
    const element = range.startContainer.parentElement;
    return element && element.classList.contains("highlighted-text");
}

// Open the annotation sidebar
function openAnnotationSidebar(text) {
    console.log("Opening annotation sidebar for text:", text);
    chrome.runtime.sendMessage({ action: "openSidebar", text: text });
}

// Initialize highlights on page load
function initialize() {
    console.log("Reapplying highlights on page load");

    chrome.storage.local.get({ highlights: [] }, function(result) {
        const highlights = result.highlights;
        console.log("Loaded highlights from storage:", JSON.stringify(highlights, null, 2));
        highlights.forEach(highlight => {
            if (highlight.url === window.location.href) {
                applyHighlight(highlight);
                console.log("Reapplied highlight:", JSON.stringify(highlight, null, 2));
            }
        });
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
} else {
    initialize();
}

// Simplified function to generate a more reliable XPath
function getXPath(node) {
    if (!node) return '';
    if (node.nodeType === Node.TEXT_NODE) {
        node = node.parentNode;
    }

    const parts = [];
    while (node && node.nodeType === Node.ELEMENT_NODE) {
        let index = 0;
        let sibling = node.previousSibling;
        while (sibling) {
            if (sibling.nodeType === Node.ELEMENT_NODE && sibling.nodeName === node.nodeName) {
                index++;
            }
            sibling = sibling.previousSibling;
        }
        const part = `${node.nodeName.toLowerCase()}${index ? `[${index + 1}]` : ''}`;
        parts.unshift(part);
        node = node.parentNode;
    }
    const xpath = parts.length ? `/${parts.join('/')}` : '';
    console.log("Generated XPath:", xpath);
    return xpath;
}

// Updated function to find a text node from its XPath with error handling
function findTextNode(xpath) {
    try {
        const evaluator = new XPathEvaluator();
        const result = evaluator.evaluate(xpath, document.documentElement, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
        if (result.singleNodeValue) {
            const node = result.singleNodeValue.nodeType === Node.TEXT_NODE
                ? result.singleNodeValue
                : result.singleNodeValue.firstChild;
            console.log("Found node for XPath:", xpath, "Node:", node);
            return node;
        } else {
            console.error("XPath evaluation did not return a valid node. XPath:", xpath);
        }
    } catch (error) {
        console.error("XPath evaluation error:", error.message, "XPath:", xpath);
    }
    return null;
}
