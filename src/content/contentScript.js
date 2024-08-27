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
    const annotateButton = document.getElementById("annotate-btn");

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
        toolbar.classList.remove("show");
        setTimeout(() => toolbar.remove(), 300); // Delay removal for transition
    });

    annotateButton.addEventListener("click", function(event) {
        event.stopPropagation();
        console.log("Annotate button clicked");
        openAnnotationSidebar(selection, range);
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

// Remove the highlight from the selected text and update storage
function removeHighlight(range) {
    let span = range.startContainer.parentElement;
    if (span && span.classList.contains("highlighted-text")) {
        const parent = span.parentNode;
        while (span.firstChild) {
            parent.insertBefore(span.firstChild, span);
        }
        parent.removeChild(span);
        console.log("Highlight removed");

        // Remove the highlight from storage
        removeHighlightFromStorage(range);
    }
}

// Remove the highlight from storage
function removeHighlightFromStorage(range) {
    const { startOffset, endOffset } = calculateFullOffsetUsingMarkers(range);

    console.log("Attempting to remove highlight with calculated offsets:");
    console.log("Calculated Start Offset:", startOffset);
    console.log("Calculated End Offset:", endOffset);

    chrome.storage.local.get({ highlights: [] }, function(result) {
        const highlights = result.highlights;

        console.log("Stored highlights in storage:", JSON.stringify(highlights, null, 2));

        const indexToRemove = highlights.findIndex(highlight =>
            highlight.rangeInfo.startOffset === startOffset &&
            highlight.rangeInfo.endOffset === endOffset &&
            highlight.url === window.location.href
        );

        if (indexToRemove !== -1) {
            console.log("Matching highlight found for removal at index:", indexToRemove);
            console.log("Highlight data being removed:", JSON.stringify(highlights[indexToRemove], null, 2));
            highlights.splice(indexToRemove, 1); // Remove the highlight from the array
            chrome.storage.local.set({ highlights: highlights }, function() {
                console.log("Highlight removed from storage. Updated highlights:", JSON.stringify(highlights, null, 2));
            });
        } else {
            console.log("No matching highlight found in storage to remove.");
            console.log("Attempted removal with Start Offset:", startOffset, "End Offset:", endOffset);
            console.log("Here is what was in storage for comparison:");
            highlights.forEach((highlight, index) => {
                console.log(`Highlight ${index}:`);
                console.log("Stored Start Offset:", highlight.rangeInfo.startOffset);
                console.log("Stored End Offset:", highlight.rangeInfo.endOffset);
                console.log("Stored URL:", highlight.url);
            });
        }
    });
}

// Check if the text is already highlighted
function isTextHighlighted(range) {
    const element = range.startContainer.parentElement;
    return element && element.classList.contains("highlighted-text");
}

// Function to split text into lines of a specified length
function splitTextIntoLines(text, maxLineLength) {
    const lines = [];
    let start = 0;
    while (start < text.length) {
        let end = start + maxLineLength;
        if (end > text.length) {
            end = text.length;
        }
        lines.push(text.substring(start, end));
        start = end;
    }
    return lines;
}

// Function to display truncated text with "More" link if necessary
function displayAnnotationText(fullText, element) {
    const maxLineLength = 50; // Approximate number of characters per line
    const maxLines = 2; // Maximum number of lines to display initially

    const lines = splitTextIntoLines(fullText, maxLineLength);
    let truncatedText = lines.slice(0, maxLines).join('<br>');
    
    if (lines.length > maxLines) {
        // Add "More" directly at the end of the second line
        truncatedText = truncatedText.replace(/<br>$/, '') + '...<a href="#" class="more-link">More</a>';
    }

    element.innerHTML = `<p>${truncatedText}</p>`;

    if (lines.length > maxLines) {
        const moreLink = element.querySelector('.more-link');
        moreLink.addEventListener('click', function(event) {
            event.preventDefault();
            element.innerHTML = `<p>${lines.join('<br>')}</p>`;
        });
    }
}

// Open the annotation sidebar with selected text
function openAnnotationSidebar(selection, range) {
    const selectedText = selection.toString();
    console.log("Selected text:", selectedText);

    const { startOffset, endOffset } = calculateFullOffsetUsingMarkers(range);
    console.log("Calculated offsets - startOffset:", startOffset, "endOffset:", endOffset);

    const annotationData = {
        text: selectedText,
        url: window.location.href,
        rangeInfo: {
            startOffset: startOffset,
            endOffset: endOffset,
            startXPath: getXPath(range.startContainer),
            endXPath: getXPath(range.endContainer)
        }
    };

    console.log("Annotation data prepared:", JSON.stringify(annotationData, null, 2));

    loadSidebar(() => {
        console.log("Sidebar loaded or already exists.");

        const sidebar = document.getElementById("annotation-sidebar");
        if (!sidebar) {
            console.error("Annotation sidebar element not found in the DOM after loading.");
            return;
        }

        sidebar.style.display = "block";
        console.log("Sidebar opened and displayed.");

        const annotationTextElement = document.querySelector(".annotation-text");
        if (annotationTextElement) {
            displayAnnotationText(selectedText, annotationTextElement);
            console.log("Annotation text element populated with truncated text.");
        } else {
            console.error("Annotation text element not found in the DOM.");
        }

        // Store annotation data globally for further use
        window.annotationData = annotationData;
    });
}

// The rest of your existing code...


// Utility function to truncate the selected text
function truncateText(text, limit) {
    console.log("truncateText called with text:", text, "and limit:", limit);
    if (text.length <= limit) {
        console.log("Text is within limit, no truncation needed.");
        return text;
    }
    const truncated = text.substring(0, limit) + '...';
    console.log("Text truncated to:", truncated);
    return truncated;
}

// Function to generate a more reliable XPath
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

// Function to find a text node from its XPath
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

// Initialize highlights and annotations on page load
function initialize() {
    console.log("Reapplying highlights and annotations on page load");

    chrome.storage.local.get({ highlights: [], annotations: [] }, function(result) {
        const highlights = result.highlights;
        const annotations = result.annotations;

        console.log("Loaded highlights from storage:", JSON.stringify(highlights, null, 2));
        highlights.forEach(highlight => {
            if (highlight.url === window.location.href) {
                applyHighlight(highlight);
                console.log("Reapplied highlight:", JSON.stringify(highlight, null, 2));
            }
        });

        console.log("Loaded annotations from storage:", JSON.stringify(annotations, null, 2));
        annotations.forEach(annotation => {
            if (annotation.url === window.location.href) {
                highlightAnnotation(annotation.rangeInfo);
                console.log("Reapplied annotation:", JSON.stringify(annotation, null, 2));
            }
        });
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
} else {
    initialize();
}

// Sidebar.js (This would be part of your sidebar's JavaScript file)

// Saving annotation from sidebar
document.getElementById("save-button").addEventListener("click", function() {
    console.log("Save button clicked.");

    const annotationText = document.getElementById("annotation-editor").innerText;
    console.log("Annotation text entered:", annotationText);

    const tags = document.getElementById("tag-input").value;
    console.log("Tags entered:", tags);

    if (window.annotationData) {
        const annotationData = {
            ...window.annotationData,
            annotationText: annotationText,
            tags: tags,
        };

        console.log("Prepared annotation data to save:", JSON.stringify(annotationData, null, 2));

        chrome.storage.local.get({ annotations: [] }, function(result) {
            const annotations = result.annotations;
            console.log("Existing annotations retrieved from storage:", JSON.stringify(annotations, null, 2));

            const existingAnnotationIndex = annotations.findIndex(annotation =>
                annotation.rangeInfo.startOffset === annotationData.rangeInfo.startOffset &&
                annotation.rangeInfo.endOffset === annotationData.rangeInfo.endOffset &&
                annotation.url === annotationData.url
            );

            if (existingAnnotationIndex !== -1) {
                console.log("Updating existing annotation at index:", existingAnnotationIndex);
                annotations[existingAnnotationIndex] = annotationData;
            } else {
                console.log("Adding new annotation.");
                annotations.push(annotationData);
            }

            chrome.storage.local.set({ annotations: annotations }, function() {
                console.log("Annotation saved successfully to storage. Updated annotations:", JSON.stringify(annotations, null, 2));

                // Provide feedback to the user after saving
                alert("Annotation saved successfully!");
                console.log("User alerted about successful save.");

                // Clear the editor and tags input
                document.getElementById("annotation-editor").innerText = '';
                document.getElementById("tag-input").value = '';
                console.log("Cleared annotation editor and tag input fields.");

                // Optionally, close the sidebar
                document.getElementById('annotation-sidebar').style.display = 'none';
                console.log("Sidebar closed after saving.");
            });
        });

        // Highlight the text in lighter yellow to indicate an annotation
        highlightAnnotation(annotationData.rangeInfo);
        console.log("Text highlighted with annotation style.");
    } else {
        console.error("No annotation data found in window.annotationData.");
    }
});

// Function to highlight the text associated with the annotation
function highlightAnnotation(rangeInfo) {
    const range = document.createRange();
    const startContainer = findTextNode(rangeInfo.startXPath);
    const endContainer = findTextNode(rangeInfo.endXPath);

    if (startContainer && endContainer) {
        try {
            range.setStart(startContainer, rangeInfo.startOffset);
            range.setEnd(endContainer, rangeInfo.endOffset);

            if (range.toString().length > 0) {
                applyAnnotationHighlight(range);
                console.log("Annotation text highlighted successfully.");
            } else {
                console.error("Range does not contain any text.");
            }
        } catch (e) {
            console.error("Error applying annotation highlight:", e, "Range info:", rangeInfo);
        }
    } else {
        console.error("Failed to find text nodes to apply annotation highlight. Start container:", startContainer, "End container:", endContainer);
    }
}

// Function to apply the annotation highlight style
function applyAnnotationHighlight(range) {
    const span = document.createElement("span");
    span.style.backgroundColor = "lightyellow";
    span.className = "annotated-text";

    range.surroundContents(span);

    console.log("Text highlighted with annotation style.");
}

// Load and inject the sidebar into the page
function loadSidebar(callback) {
    console.log("Loading sidebar");
    if (!document.getElementById('annotation-sidebar')) {
        fetch(chrome.runtime.getURL('src/content/sidebar/sidebar.html'))
            .then(response => response.text())
            .then(data => {
                console.log('Sidebar HTML fetched');
                document.body.insertAdjacentHTML('beforeend', data);

                const sidebar = document.getElementById('annotation-sidebar');
                console.log('Sidebar Element:', sidebar);

                // Inject CSS dynamically
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.type = 'text/css';
                link.href = chrome.runtime.getURL('src/content/sidebar/css/sidebar.css');
                document.head.appendChild(link);

                // Load sidebar JS
                const script = document.createElement('script');
                script.src = chrome.runtime.getURL('src/content/sidebar/js/sidebar.js');
                script.onload = callback;
                document.body.appendChild(script);
            })
            .catch(err => console.error('Error loading sidebar:', err));
    } else {
        console.log("Sidebar already exists.");
        callback();
    }
}
