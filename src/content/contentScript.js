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
        id: Date.now(),  // Assign a unique ID using the current timestamp
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
// Open the annotation sidebar with selected text
function openAnnotationSidebar(selection, range) {
    const selectedText = selection.toString();
    console.log("[DEBUG] Annotate button clicked, selected text: ", selectedText);

    const { startOffset, endOffset } = calculateFullOffsetUsingMarkers(range);
    console.log("[DEBUG] Calculated offsets - startOffset:", startOffset, "endOffset:", endOffset);

    const annotationData = {
        id: Date.now(),  // Assign a unique ID to the annotation
        text: selectedText,
        url: window.location.href,
        rangeInfo: {
            startOffset: startOffset,
            endOffset: endOffset,
            startXPath: getXPath(range.startContainer),
            endXPath: getXPath(range.endContainer)
        }
    };

    console.log("[DEBUG] Annotation data prepared:", JSON.stringify(annotationData, null, 2));

    // Ensure the sidebar is fully loaded before interacting with it
    console.log("[DEBUG] Calling loadSidebar function");
    loadSidebar(() => {
        console.log("[DEBUG] Sidebar loaded or already exists, entering callback");

        const sidebar = document.getElementById("annotation-sidebar");
        if (!sidebar) {
            console.error("[ERROR] Annotation sidebar element not found in the DOM after loading.");
            return;
        }

        // Now that the sidebar is loaded, display it and update its content
        sidebar.style.display = "block";
        console.log("[DEBUG] Sidebar opened and displayed.");

        const annotationTextElement = document.querySelector(".annotation-text");
        if (annotationTextElement) {
            // Display truncated selected text in the annotation sidebar
            displayAnnotationText(selectedText, annotationTextElement);
            console.log("[DEBUG] Annotation text element populated with truncated text.");
        } else {
            console.error("[ERROR] Annotation text element (.annotation-text) not found in the DOM.");
        }

        // Ensure editor container is visible each time the sidebar is opened
        const editorContainer = document.getElementById('editor-container');
        if (editorContainer) {
            editorContainer.style.display = 'block';
            console.log("[DEBUG] Editor container displayed.");
        } else {
            console.error("[ERROR] Editor container (editor-container) not found in the DOM.");
        }

        // Store annotation data globally for further use
        window.annotationData = annotationData;

        // Display existing annotations after opening the sidebar
        displayExistingAnnotations();
    });
}


// Function to display existing annotations in the sidebar
function displayExistingAnnotations() {
    chrome.storage.local.get({ annotations: [] }, function(result) {
        const annotations = result.annotations.filter(annotation => annotation.url === window.location.href);

        const annotationList = document.getElementById('annotation-list');
        annotationList.innerHTML = ''; // Clear previous entries

        annotations.forEach(annotation => {
            const annotationItem = document.createElement('div');
            annotationItem.className = 'annotation-item';
            annotationItem.style.backgroundColor = 'white';
            annotationItem.style.padding = '10px';
            annotationItem.style.marginBottom = '10px';
            annotationItem.style.position = 'relative';

            const deleteButton = document.createElement('button');
            deleteButton.className = 'delete-annotation';
            deleteButton.innerText = 'X';
            deleteButton.style.position = 'absolute';
            deleteButton.style.top = '5px';
            deleteButton.style.right = '5px';
            deleteButton.style.background = 'red';
            deleteButton.style.color = 'white';
            deleteButton.style.border = 'none';
            deleteButton.style.cursor = 'pointer';

            deleteButton.addEventListener('click', function() {
                if (confirm('Are you sure you want to delete this annotation?')) {
                    deleteAnnotation(annotation.id);
                }
            });

            annotationItem.appendChild(deleteButton);

            const selectedTextElement = document.createElement('div');
            selectedTextElement.className = 'selected-text';
            selectedTextElement.innerText = annotation.text;
            selectedTextElement.style.fontWeight = 'bold';
            annotationItem.appendChild(selectedTextElement);

            const annotationTextElement = document.createElement('div');
            displayAnnotationText(annotation.annotationText || '', annotationTextElement);
            annotationItem.appendChild(annotationTextElement);

            annotationList.appendChild(annotationItem);
        });
    });
}

// Function to delete an annotation by its id
function deleteAnnotation(annotationId) {
    chrome.storage.local.get({ annotations: [] }, function(result) {
        const annotations = result.annotations.filter(ann => ann.id !== annotationId);

        chrome.storage.local.set({ annotations: annotations }, function() {
            console.log("Annotation deleted successfully. Updated annotations:", JSON.stringify(annotations, null, 2));
            displayExistingAnnotations(); // Refresh the list of annotations
        });
    });
}

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
        console.log("Loaded annotations from storage:", JSON.stringify(annotations, null, 2));

        // Combine highlights and annotations into a single group by XPath
        const groupedItems = groupAndSortByXPathAndOffset(highlights, annotations);

        // Apply sorted highlights and annotations
        Object.keys(groupedItems).forEach(xpath => {
            const itemGroup = groupedItems[xpath];

            // Apply each highlight or annotation in the sorted order
            itemGroup.forEach(item => {
                if (item.url === window.location.href) {
                    if (item.type === 'highlight') {
                        applyHighlight(item);  // Apply highlight
                        console.log("Reapplied highlight:", JSON.stringify(item, null, 2));
                    } else if (item.type === 'annotation') {
                        highlightAnnotation(item.rangeInfo);  // Apply annotation
                        console.log("Reapplied annotation:", JSON.stringify(item, null, 2));
                    }
                }
            });
        });

        displayExistingAnnotations(); // Display annotations in the sidebar
    });
}

// Function to group and sort both highlights and annotations by XPath and endOffset
function groupAndSortByXPathAndOffset(highlights, annotations) {
    const grouped = {};

    // Add highlights to the group
    highlights.forEach(highlight => {
        const xpath = highlight.rangeInfo.endXPath;
        if (!grouped[xpath]) {
            grouped[xpath] = [];
        }

        grouped[xpath].push({ ...highlight, type: 'highlight' });  // Mark as highlight
    });

    // Add annotations to the group
    annotations.forEach(annotation => {
        const xpath = annotation.rangeInfo.endXPath;
        if (!grouped[xpath]) {
            grouped[xpath] = [];
        }

        grouped[xpath].push({ ...annotation, type: 'annotation' });  // Mark as annotation
    });

    // Sort each group by endOffset in descending order
    Object.keys(grouped).forEach(xpath => {
        grouped[xpath].sort((a, b) => b.rangeInfo.endOffset - a.rangeInfo.endOffset);
    });

    return grouped;
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
} else {
    initialize();
}

// Sidebar.js (This would be part of your sidebar's JavaScript file)

// Saving annotation from sidebar
document.addEventListener("click", function(event) {
    if (event.target && event.target.id === "save-button") {
        console.log("Save button clicked.");

        const annotationText = document.getElementById("annotation-editor").innerText;
        console.log("Annotation text entered:", annotationText);

        if (window.annotationData) {
            const annotationData = {
                ...window.annotationData,
                annotationText: annotationText
            };

            console.log("Prepared annotation data to save:", JSON.stringify(annotationData, null, 2));

            chrome.storage.local.get({ annotations: [] }, function(result) {
                const annotations = result.annotations;
                console.log("Existing annotations retrieved from storage:", JSON.stringify(annotations, null, 2));

                annotations.push(annotationData);

                chrome.storage.local.set({ annotations: annotations }, function() {
                    console.log("Annotation saved successfully to storage. Updated annotations:", JSON.stringify(annotations, null, 2));

                    // Provide feedback to the user after saving
                    alert("Annotation saved successfully!");
                    console.log("User alerted about successful save.");

                    // Clear the editor input
                    document.getElementById("annotation-editor").innerText = '';

                    // Close the editor container but keep the sidebar open
                    document.getElementById('editor-container').style.display = 'none';

                    // Refresh the list of annotations to show the new one
                    displayExistingAnnotations();
                });
            });
        } else {
            console.error("No annotation data found in window.annotationData.");
        }
    } else if (event.target && event.target.id === "cancel-button") {
        console.log("Cancel button clicked.");
        document.getElementById('editor-container').style.display = 'none';
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
    console.log("[DEBUG] Loading sidebar");

    // Check if sidebar is already in the DOM, if so, just call the callback
    let sidebar = document.getElementById('annotation-sidebar');
    if (sidebar) {
        console.log("[DEBUG] Sidebar already exists.");
        callback();  // Sidebar already exists, call the callback immediately
        return;
    }

    // Sidebar doesn't exist, proceed to fetch and inject it
    fetch(chrome.runtime.getURL('src/content/sidebar/sidebar.html'))
        .then(response => {
            console.log("[DEBUG] Sidebar HTML fetch response received");
            return response.text();
        })
        .then(data => {
            console.log("[DEBUG] Sidebar HTML fetched successfully");
            document.body.insertAdjacentHTML('beforeend', data);

            // Ensure the sidebar element is now in the DOM
            sidebar = document.getElementById('annotation-sidebar');
            if (!sidebar) {
                console.error("[ERROR] Sidebar element not found after insertion.");
                return;
            }
            console.log("[DEBUG] Sidebar element found and inserted into DOM:", sidebar);

            // Inject CSS dynamically
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = chrome.runtime.getURL('src/content/sidebar/css/sidebar.css');
            document.head.appendChild(link);
            console.log("[DEBUG] Sidebar CSS injected");

            // Call the callback to proceed with further operations
            callback();  // Sidebar is fully loaded and CSS injected, call the callback
        })
        .catch(err => console.error("[ERROR] Error loading sidebar:", err));
}


// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'openSidebar') {
        console.log("Message received: Open Annotation Sidebar");

        // Call the function to open the sidebar
        loadSidebar(() => {
            console.log("Sidebar opened via popup.");
        });
    }
});
