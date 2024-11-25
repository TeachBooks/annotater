// Existing Code: Event listener for mouse selection
// Updated Code: Event listener for mouse selection
document.addEventListener("mouseup", function(event) {
    const selection = window.getSelection();
    
    // Proceed only if some text is selected and the target is not within any toolbar
    if (selection.toString().length > 0 && !event.target.closest('#floating-toolbar') && !event.target.closest('#annotation-toolbar')) {
        // Get the first range of the selection
        const range = selection.getRangeAt(0);
        let commonAncestor = range.commonAncestorContainer;
        
        // If the common ancestor is a text node, get its parent element
        if (commonAncestor.nodeType === Node.TEXT_NODE) {
            commonAncestor = commonAncestor.parentElement;
        }
        
        // Check if the selection is within an annotated text
        const isWithinAnnotatedText = commonAncestor.closest('.annotated-text') !== null;
        
        if (!isWithinAnnotatedText) {
            console.log("Text selected outside annotated elements: ", selection.toString());
            showFloatingToolbar(selection);
        } else {
            console.log("Text selected within an annotated element: ", selection.toString());
            showAnnotationToolbar(selection);
        }
    }
});
// New Function: Show the Annotation Toolbar
function showAnnotationToolbar(selection) {
    const existingToolbar = document.getElementById("annotation-toolbar");
    if (existingToolbar) {
        console.log("Removing existing annotation toolbar");
        existingToolbar.remove();
    }

    const toolbar = document.createElement("div");
    toolbar.id = "annotation-toolbar";
    toolbar.innerHTML = `
        <button id="view-annotation-btn" class="toolbar-button">View Annotation</button>
        <button id="remove-annotation-btn" class="toolbar-button">Remove Annotation</button>
    `;
    console.log("Annotation toolbar created");

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    toolbar.style.position = "absolute";
    toolbar.style.top = `${window.scrollY + rect.top - 40}px`;
    toolbar.style.left = `${rect.left}px`;
    // Removed other inline styles to rely on CSS

    document.body.appendChild(toolbar);

    // Show the toolbar with animation
    setTimeout(() => toolbar.classList.add("show"), 10);

    const viewBtn = document.getElementById("view-annotation-btn");
    const removeBtn = document.getElementById("remove-annotation-btn");

    viewBtn.addEventListener("click", function(event) {
        event.stopPropagation();
        console.log("View Annotation button clicked");
        openAllAnnotationsSidebar();
        toolbar.classList.remove("show");
        setTimeout(() => toolbar.remove(), 300); // Delay removal for transition
    });

    removeBtn.addEventListener("click", function(event) {
        event.stopPropagation();
        console.log("Remove Annotation button clicked");
        const annotationId = selection.anchorNode.parentElement.getAttribute('data-annotation-id');
        if (annotationId) {
            removeAnnotationById(annotationId);
        }
        toolbar.classList.remove("show");
        setTimeout(() => toolbar.remove(), 300); // Delay removal for transition
    });
}


// Existing Code: Event listener for clicking outside the toolbar
document.addEventListener("mousedown", function(event) {
    const toolbar = document.getElementById("floating-toolbar");
    if (toolbar && !toolbar.contains(event.target)) {
        console.log("Clicked outside toolbar, removing toolbar");
        toolbar.remove();
    }
    
    // Remove annotation toolbar if clicking outside
    const annotationToolbar = document.getElementById("annotation-toolbar");
    if (annotationToolbar && !annotationToolbar.contains(event.target)) {
        console.log("Clicked outside annotation toolbar, removing toolbar");
        annotationToolbar.remove();
    }
});

// Existing Code: Show the floating toolbar
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

// Existing Code: Function to calculate the offset within the entire parent element using markers
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

// Existing Code: Function to get the offset relative to the parent container
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
        chrome.storage.local.set({ highlights: highlights }, function() {
            console.log("Highlight saved. Current highlights:", JSON.stringify(highlights, null, 2));
            // Now highlight the text and set the data-highlight-id
            highlightText(range, highlightData.id);
        });
    });
}
function applyHighlight(highlight) {
    const range = document.createRange();
    const rangeInfo = highlight.rangeInfo;
    const startContainer = findTextNode(rangeInfo.startXPath);
    const endContainer = findTextNode(rangeInfo.endXPath);

    if (startContainer && endContainer) {
        try {
            range.setStart(startContainer, rangeInfo.startOffset);
            range.setEnd(endContainer, rangeInfo.endOffset);

            if (range.toString().length > 0) {
                highlightText(range, highlight.id); // Pass the highlight ID
                console.log("Range applied successfully. Text:", range.toString());
            } else {
                console.error("Range does not contain any text.");
            }
        } catch (e) {
            console.error("Error applying highlight:", e, "Range info:", rangeInfo);
        }
    } else {
        console.error("Failed to find text nodes to reapply highlight. Start container:", startContainer, "End container:", endContainer);
    }
}


function highlightText(range, highlightId) {
    const span = document.createElement("span");
    span.style.backgroundColor = "yellow";
    span.className = "highlighted-text";
    span.setAttribute('data-highlight-id', highlightId); // Set the highlight ID
    range.surroundContents(span);
    console.log("Text highlighted with ID:", highlightId);
}

function removeHighlight(range) {
    let span = range.startContainer.parentElement;
    if (span && span.classList.contains("highlighted-text")) {
        const highlightId = span.getAttribute('data-highlight-id'); // Get the highlight ID
        if (!highlightId) {
            console.error("No highlight ID found on the span element.");
            return;
        }

        // Remove the highlight from storage using the ID
        removeHighlightFromStorageById(highlightId);

        // Remove the span from the DOM
        const parent = span.parentNode;
        while (span.firstChild) {
            parent.insertBefore(span.firstChild, span);
        }
        parent.removeChild(span);
        console.log("Highlight removed");
    }
}

function removeHighlightFromStorageById(highlightId) {
    chrome.storage.local.get({ highlights: [] }, function(result) {
        const highlights = result.highlights;

        const indexToRemove = highlights.findIndex(highlight => highlight.id == highlightId);

        if (indexToRemove !== -1) {
            console.log("Matching highlight found for removal at index:", indexToRemove);
            console.log("Highlight data being removed:", JSON.stringify(highlights[indexToRemove], null, 2));
            highlights.splice(indexToRemove, 1); // Remove the highlight from the array
            chrome.storage.local.set({ highlights: highlights }, function() {
                console.log("Highlight removed from storage. Updated highlights:", JSON.stringify(highlights, null, 2));
            });
        } else {
            console.log("No matching highlight found in storage to remove.");
            console.log("Attempted removal with ID:", highlightId);
        }
    });
}



// Existing Code: Remove the highlight from storage
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

// Existing Code: Check if the text is already highlighted
function isTextHighlighted(range) {
    const element = range.startContainer.parentElement;
    return element && element.classList.contains("highlighted-text");
}

// Existing Code: Function to split text into lines of a specified length
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

// Existing Code: Function to display truncated text with "More" link if necessary
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

// Existing Code: Open the annotation sidebar with selected text
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
        },
        annotationText: "" // Initialize with empty text
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

// **Updated Code: Modify displayExistingAnnotations to Accept a Search Query**

function displayExistingAnnotations(searchQuery = '') {
    chrome.storage.local.get({ annotations: [] }, function(result) {
        const annotations = result.annotations.filter(annotation => annotation.url === window.location.href);
    
        const annotationList = document.getElementById('annotation-list');
        annotationList.innerHTML = ''; // Clear previous entries
    
        // Filter annotations based on the search query
        const filteredAnnotations = annotations.filter(annotation => {
            const textMatch = annotation.text.toLowerCase().includes(searchQuery);
            const annotationTextMatch = (annotation.annotationText || '').toLowerCase().includes(searchQuery);
            return textMatch || annotationTextMatch;
        });
    
        if (filteredAnnotations.length === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'no-results';
            noResults.innerText = 'No annotations found.';
            annotationList.appendChild(noResults);
            return;
        }
    
        filteredAnnotations.forEach(annotation => {
            const annotationItem = document.createElement('div');
            annotationItem.className = 'annotation-item';
    
            // Create header section
            const header = document.createElement('div');
            header.className = 'annotation-item-header';
    
            // Selected text
            const selectedTextElement = document.createElement('div');
            selectedTextElement.className = 'selected-text';
            selectedTextElement.innerText = annotation.text;
    
            // Creation date
            const dateElement = document.createElement('div');
            dateElement.className = 'annotation-date';
            const date = new Date(annotation.id);
            dateElement.innerText = date.toLocaleString();
    
            header.appendChild(selectedTextElement);
            header.appendChild(dateElement);
    
            // Annotation text
            const annotationTextElement = document.createElement('div');
            annotationTextElement.className = 'annotation-text-content';
            displayAnnotationText(annotation.annotationText || '', annotationTextElement);
    
            // Actions (Edit, Delete)
            const actions = document.createElement('div');
            actions.className = 'annotation-actions';
    
            // Edit button
            const editButton = document.createElement('button');
            editButton.className = 'edit-annotation';
            editButton.innerText = 'Edit';
    
            editButton.addEventListener('click', function() {
                console.log("Edit button clicked for annotation:", annotation.id);
                editAnnotation(annotation);
            });
    
            // Delete button
            const deleteButton = document.createElement('button');
            deleteButton.className = 'delete-annotation';
            deleteButton.innerText = 'Delete';
    
            deleteButton.addEventListener('click', function() {
                showConfirmationDialog('Are you sure you want to delete this annotation?', function() {
                    deleteAnnotation(annotation.id);
                });
            });
    
            actions.appendChild(editButton);
            actions.appendChild(deleteButton);
    
            // Append all parts to annotation item
            annotationItem.appendChild(header);
            annotationItem.appendChild(annotationTextElement);
            annotationItem.appendChild(actions);
    
            annotationList.appendChild(annotationItem);
        });
    });
}

// New Addition: Function to edit an existing annotation
function editAnnotation(annotation) {
    console.log("Editing annotation:", annotation);

    // Store the annotation data globally for further use
    window.annotationData = annotation;

    // Open the sidebar if not already open
    loadSidebar(() => {
        console.log("Sidebar loaded for editing annotation.");
        const sidebar = document.getElementById("annotation-sidebar");
        if (sidebar) {
            sidebar.style.display = "block";

            // Ensure editor container is visible
            const editorContainer = document.getElementById('editor-container');
            if (editorContainer) {
                editorContainer.style.display = 'block';

                // Set the selected text in the annotation text element
                const annotationTextElement = document.querySelector(".annotation-text");
                if (annotationTextElement) {
                    displayAnnotationText(annotation.text, annotationTextElement);
                }

                // Set the existing annotation text in the editor
                const annotationEditor = document.getElementById("annotation-editor");
                if (annotationEditor) {
                    annotationEditor.innerText = annotation.annotationText || '';
                }

                console.log("Editor populated with existing annotation data.");
            } else {
                console.error("Editor container not found.");
            }
        } else {
            console.error("Sidebar not found.");
        }
    });
}

// Updated Code: Function to delete an annotation by its id
function deleteAnnotation(annotationId) {
    chrome.storage.local.get({ annotations: [] }, function(result) {
        const annotations = result.annotations.filter(ann => ann.id !== annotationId);

        chrome.storage.local.set({ annotations: annotations }, function() {
            console.log("Annotation deleted successfully. Updated annotations:", JSON.stringify(annotations, null, 2));
            displayExistingAnnotations(); // Refresh the list of annotations
            // Additionally, remove the annotation highlight from the page
            removeAnnotationHighlight(annotationId);

            // Provide feedback to the user
            showToast("Annotation deleted successfully!");
        });
    });
}

// New Addition: Function to remove annotation highlight from the DOM
function removeAnnotationHighlight(annotationId) {
    const annotatedElements = document.querySelectorAll(`[data-annotation-id="${annotationId}"]`);
    annotatedElements.forEach(element => {
        const parent = element.parentNode;
        while (element.firstChild) {
            parent.insertBefore(element.firstChild, element);
        }
        parent.removeChild(element);
    });
    console.log(`Annotation highlight with ID ${annotationId} removed from DOM.`);
}

// Existing Code: Utility function to truncate the selected text
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

// Existing Code: Function to generate a more reliable XPath
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

// Existing Code: Function to find a text node from its XPath
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

// Existing Code: Initialize highlights and annotations on page load
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
                        highlightAnnotation(item);  // Apply annotation
                        console.log("Reapplied annotation:", JSON.stringify(item, null, 2));
                    }
                }
            });
        });

        displayExistingAnnotations(); // Display annotations in the sidebar
    });
}

// Existing Code: Function to group and sort both highlights and annotations by XPath and endOffset
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

// New Addition: Event listener for clicking on annotated text
document.addEventListener("click", function(event) {
    const annotatedElement = event.target.closest('.annotated-text');
    
    if (annotatedElement) {
        event.preventDefault();
        event.stopPropagation();
        
        // Remove any existing annotation toolbar
        const existingToolbar = document.getElementById("annotation-toolbar");
        if (existingToolbar) {
            existingToolbar.remove();
        }
        
        // Create the annotation toolbar
        const toolbar = document.createElement("div");
        toolbar.id = "annotation-toolbar";
        toolbar.innerHTML = `
            <button id="view-annotation-btn">View Annotation</button>
            <button id="remove-annotation-btn">Remove Annotation</button>
        `;
        
        // Position the toolbar near the annotated text
        const rect = annotatedElement.getBoundingClientRect();
        toolbar.style.position = "absolute";
        toolbar.style.top = `${window.scrollY + rect.top - 40}px`;
        toolbar.style.left = `${rect.left}px`;
        toolbar.style.zIndex = "10000"; // Ensure toolbar is above other elements
        toolbar.style.backgroundColor = "#fff";
        toolbar.style.border = "1px solid #ccc";
        toolbar.style.padding = "5px";
        toolbar.style.borderRadius = "4px";
        toolbar.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";
        
        document.body.appendChild(toolbar);
        
        // Add event listeners to the toolbar buttons
        const viewBtn = document.getElementById("view-annotation-btn");
        const removeBtn = document.getElementById("remove-annotation-btn");
        
        viewBtn.addEventListener("click", function(e) {
            e.stopPropagation();
            console.log("View annotation clicked");
            openAllAnnotationsSidebar(); // Open sidebar and load all annotations
            toolbar.remove(); // Remove the toolbar after action
        });
        
        
        removeBtn.addEventListener("click", function(e) {
            e.stopPropagation();
            console.log("Remove annotation clicked");
            const annotationId = annotatedElement.getAttribute('data-annotation-id');
            if (annotationId) {
                removeAnnotationById(annotationId, annotatedElement);
            }
            toolbar.remove();
        });
        
        // Optional: Automatically remove the toolbar after a certain time
        setTimeout(() => {
            if (toolbar.parentNode) {
                toolbar.remove();
            }
        }, 5000); // Removes the toolbar after 5 seconds
    } else {
        // Clicked outside an annotated text, remove annotation toolbar if exists
        const toolbar = document.getElementById("annotation-toolbar");
        if (toolbar) {
            toolbar.remove();
        }
    }
});

// New Addition: Function to view a specific annotation in the sidebar
function viewAnnotation(annotationId) {
    chrome.storage.local.get({ annotations: [] }, function(result) {
        const annotations = result.annotations;
        const annotation = annotations.find(ann => ann.id === Number(annotationId));
        
        if (annotation) {
            console.log("Viewing annotation:", annotation);
            // Store the annotation data globally for the sidebar to access
            window.annotationData = annotation;
            // Open the sidebar
            loadSidebar(() => {
                console.log("Sidebar loaded for viewing annotation.");
                const sidebar = document.getElementById("annotation-sidebar");
                if (sidebar) {
                    sidebar.style.display = "block";
                    
                    // Populate the sidebar with annotation data
                    const annotationTextElement = document.querySelector(".annotation-text");
                    if (annotationTextElement) {
                        displayAnnotationText(annotation.annotationText || annotation.text, annotationTextElement);
                        console.log("Sidebar populated with annotation data.");
                    } else {
                        console.error("Annotation text element not found in the sidebar.");
                    }

                    // Ensure editor container is hidden when viewing
                    const editorContainer = document.getElementById('editor-container');
                    if (editorContainer) {
                        editorContainer.style.display = 'none';
                    }
                }
            });
        } else {
            console.error("Annotation not found with ID:", annotationId);
        }
    });
}

// New Addition: Function to remove an annotation by its ID
function removeAnnotationById(annotationId, annotatedElement) {
    // Remove the annotated span from the DOM
    if (annotatedElement && annotatedElement.parentNode) {
        while (annotatedElement.firstChild) {
            annotatedElement.parentNode.insertBefore(annotatedElement.firstChild, annotatedElement);
        }
        annotatedElement.parentNode.removeChild(annotatedElement);
        console.log("Annotated element removed from DOM.");
    }

    // Remove the annotation from storage
    chrome.storage.local.get({ annotations: [] }, function(result) {
        let annotations = result.annotations;
        const index = annotations.findIndex(ann => ann.id === Number(annotationId));
        
        if (index !== -1) {
            const removed = annotations.splice(index, 1)[0];
            chrome.storage.local.set({ annotations: annotations }, function() {
                console.log("Annotation removed from storage:", removed);
                displayExistingAnnotations(); // Refresh the list of annotations

                // Provide feedback to the user
                showToast("Annotation removed successfully!");
            });
        } else {
            console.error("No annotation found with ID:", annotationId);
        }
    });
}

// Existing Code: Sidebar.js (This would be part of your sidebar's JavaScript file)

// Updated Code: Saving annotation from sidebar
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
                let annotations = result.annotations;
                console.log("Existing annotations retrieved from storage:", JSON.stringify(annotations, null, 2));

                // Check if we are updating an existing annotation
                const existingIndex = annotations.findIndex(ann => ann.id === annotationData.id);
                if (existingIndex !== -1) {
                    // Remove old highlight before updating
                    removeAnnotationHighlight(annotationData.id);
                    // Update existing annotation
                    annotations[existingIndex] = annotationData;
                    console.log("Updated existing annotation.");
                } else {
                    // Add new annotation
                    annotations.push(annotationData);
                    console.log("Added new annotation.");
                }

                chrome.storage.local.set({ annotations: annotations }, function() {
                    console.log("Annotation saved successfully to storage. Updated annotations:", JSON.stringify(annotations, null, 2));

                    // Apply the annotation highlight to the page
                    //applyAnnotationHighlightFromStorage(annotationData);

                    // Provide feedback to the user after saving
                    showToast("Annotation saved successfully!");
                    console.log("User alerted about successful save.");

                    // Clear the editor input
                    document.getElementById("annotation-editor").innerText = '';

                    // Close the editor container but keep the sidebar open
                    document.getElementById('editor-container').style.display = 'none';

                    // Refresh the list of annotations to show the updated one
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

// Updated Code: Function to highlight the text associated with the annotation
function highlightAnnotation(annotation) {
    const rangeInfo = annotation.rangeInfo;
    const range = document.createRange();
    const startContainer = findTextNode(rangeInfo.startXPath);
    const endContainer = findTextNode(rangeInfo.endXPath);

    if (startContainer && endContainer) {
        try {
            range.setStart(startContainer, rangeInfo.startOffset);
            range.setEnd(endContainer, rangeInfo.endOffset);

            if (range.toString().length > 0) {
                applyAnnotationHighlight(range, annotation.id);
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

// New Addition: Function to apply the annotation highlight style with a unique ID
function applyAnnotationHighlight(range, annotationId = null) {
    const span = document.createElement("span");
    span.style.backgroundColor = "lightyellow";
    span.className = "annotated-text";
    
    if (annotationId) {
        span.setAttribute('data-annotation-id', annotationId);
    }

    range.surroundContents(span);

    console.log("Text highlighted with annotation style.");
}

// New Addition: Function to apply annotation highlight from storage data
function applyAnnotationHighlightFromStorage(annotationData) {
    const range = document.createRange();
    const rangeInfo = annotationData.rangeInfo;
    const startContainer = findTextNode(rangeInfo.startXPath);
    const endContainer = findTextNode(rangeInfo.endXPath);

    if (startContainer && endContainer) {
        try {
            range.setStart(startContainer, rangeInfo.startOffset);
            range.setEnd(endContainer, rangeInfo.endOffset);

            if (range.toString().length > 0) {
                applyAnnotationHighlight(range, annotationData.id);
                console.log("Annotation highlight applied from storage.");
            } else {
                console.error("Range does not contain any text.");
            }
        } catch (e) {
            console.error("Error applying annotation highlight from storage:", e, "Range info:", rangeInfo);
        }
    } else {
        console.error("Failed to find text nodes to apply annotation highlight from storage. Start container:", startContainer, "End container:", endContainer);
    }
}
function loadSidebar(callback) {
    console.log("[DEBUG] Loading sidebar");

    // Check if sidebar is already in the DOM, if so, adjust visibility and call the callback
    let sidebar = document.getElementById('annotation-sidebar');
    if (sidebar) {
        console.log("[DEBUG] Sidebar already exists.");
        
        // Ensure the sidebar and annotation container are visible
        sidebar.style.display = "block";
        const editorContainer = document.getElementById('annotation-container');
        if (editorContainer) {
            editorContainer.style.display = "block";
            console.log("[DEBUG] Annotation container made visible.");
        } else {
            console.warn("[WARNING] Annotation container (editor-container) not found.");
        }
        
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

            // Add the event listener for the toggle-sidebar-button
            const toggleButton = document.getElementById('toggle-sidebar-button');
            if (toggleButton) {
                toggleButton.addEventListener('click', function() {
                    console.log("[DEBUG] Toggle Sidebar Button clicked. Closing sidebar and annotation container.");
                    sidebar.style.display = "none";

                    // Additionally hide the annotation container
                    const editorContainer = document.getElementById('annotation-container');
                    if (editorContainer) {
                        editorContainer.style.display = "none";
                        console.log("[DEBUG] Annotation container hidden.");
                    } else {
                        console.warn("[WARNING] Annotation container (editor-container) not found.");
                    }
                });
                console.log("[DEBUG] Toggle Sidebar Button event listener added.");
            } else {
                console.error("[ERROR] Toggle Sidebar Button not found in the sidebar.");
            }

            // Call the callback to proceed with further operations
            callback();  // Sidebar is fully loaded and CSS injected, call the callback
        })
        .catch(err => console.error("[ERROR] Error loading sidebar:", err));
}



// Existing Code: Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'openSidebar') {
        console.log("Message received: Open Annotation Sidebar");

        openAllAnnotationsSidebar();
    }
});

// New Addition: Function to show a toast notification
function showToast(message) {
    // Remove any existing toast
    const existingToast = document.getElementById('custom-toast');
    if (existingToast) {
        existingToast.remove();
    }

    // Create the toast element
    const toast = document.createElement('div');
    toast.id = 'custom-toast';
    toast.innerText = message;

    // Style the toast
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    toast.style.backgroundColor = '#333';
    toast.style.color = '#fff';
    toast.style.padding = '10px 20px';
    toast.style.borderRadius = '5px';
    toast.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
    toast.style.zIndex = '10000';
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.5s ease';

    // Append to the body
    document.body.appendChild(toast);

    // Fade in the toast
    setTimeout(() => {
        toast.style.opacity = '1';
    }, 10);

    // Remove the toast after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        // Remove the toast after the fade-out transition
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 500);
    }, 3000);
}

// New Addition: Function to show a custom confirmation dialog
function showConfirmationDialog(message, onConfirm) {
    // Remove any existing dialog
    const existingDialog = document.getElementById('custom-confirmation-dialog');
    if (existingDialog) {
        existingDialog.remove();
    }

    // Create the overlay
    const overlay = document.createElement('div');
    overlay.id = 'custom-dialog-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
    overlay.style.zIndex = '10000';

    // Create the dialog container
    const dialog = document.createElement('div');
    dialog.id = 'custom-confirmation-dialog';
    dialog.style.position = 'fixed';
    dialog.style.top = '50%';
    dialog.style.left = '50%';
    dialog.style.transform = 'translate(-50%, -50%)';
    dialog.style.backgroundColor = '#fff';
    dialog.style.padding = '20px';
    dialog.style.borderRadius = '5px';
    dialog.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
    dialog.style.zIndex = '10001';

    // Create the message
    const messageElem = document.createElement('p');
    messageElem.innerText = message;
    dialog.appendChild(messageElem);

    // Create the buttons container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.display = 'flex';
    buttonsContainer.style.justifyContent = 'flex-end';
    buttonsContainer.style.marginTop = '20px';

    // Create the Cancel button
    const cancelButton = document.createElement('button');
    cancelButton.innerText = 'Cancel';
    cancelButton.style.marginRight = '10px';
    cancelButton.addEventListener('click', () => {
        document.body.removeChild(overlay);
        document.body.removeChild(dialog);
    });

    // Create the Confirm button
    const confirmButton = document.createElement('button');
    confirmButton.innerText = 'Confirm';
    confirmButton.style.backgroundColor = '#007bff';
    confirmButton.style.color = '#fff';
    confirmButton.style.border = 'none';
    confirmButton.style.padding = '5px 10px';
    confirmButton.style.borderRadius = '3px';
    confirmButton.addEventListener('click', () => {
        document.body.removeChild(overlay);
        document.body.removeChild(dialog);
        if (typeof onConfirm === 'function') {
            onConfirm();
        }
    });

    // Append buttons to the container
    buttonsContainer.appendChild(cancelButton);
    buttonsContainer.appendChild(confirmButton);

    // Append buttons container to the dialog
    dialog.appendChild(buttonsContainer);

    // Append overlay and dialog to the body
    document.body.appendChild(overlay);
    document.body.appendChild(dialog);
}


// New Addition: Function to open the sidebar and load all annotations
function openAllAnnotationsSidebar() {
    console.log("Opening annotations sidebar to display all annotations.");

    loadSidebar(() => {
        console.log("Sidebar loaded.");
        const sidebar = document.getElementById("annotation-sidebar");
        if (!sidebar) {
            console.error("[ERROR] Annotation sidebar element not found in the DOM after loading.");
            return;
        }

        // Now that the sidebar is loaded, display it
        sidebar.style.display = "block";
        console.log("[DEBUG] Sidebar opened and displayed.");

        // Ensure editor container is hidden when viewing all annotations
        const editorContainer = document.getElementById('editor-container');
        if (editorContainer) {
            editorContainer.style.display = 'none';
            console.log("[DEBUG] Editor container hidden.");
        }

        // Display all existing annotations
        displayExistingAnnotations();
    });
}


document.addEventListener("DOMContentLoaded", function() {
    const searchButton = document.getElementById('search-button');
    const searchInput = document.getElementById('search-input');
    
    // Toggle search input visibility when search button is clicked
    searchButton.addEventListener('click', function(event) {
        console.log("lfksdajfklsadj");
        event.stopPropagation(); // Prevent the click from triggering other events
        searchInput.classList.toggle('visible');
        if (searchInput.classList.contains('visible')) {
            searchInput.focus();
        } else {
            searchInput.value = '';
            displayExistingAnnotations(); // Reset the annotations display
        }
    });
    
    // Handle search input
    searchInput.addEventListener('input', function(event) {
        const query = event.target.value.trim().toLowerCase();
        displayExistingAnnotations(query);
    });
});