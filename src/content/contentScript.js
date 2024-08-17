// src/content/contentScript.js

function saveHighlight(text, note = '') {
    console.log("Saving highlight with text:", text);
    const highlight = {
        id: Date.now(),
        text: text,
        note: note,
        location: {
            pathname: window.location.pathname,
            href: window.location.href
        }
    };
  
    chrome.storage.local.get({ highlights: [] }, (result) => {
        const highlights = result.highlights;
        highlights.push(highlight);
        chrome.storage.local.set({ highlights: highlights }, () => {
            console.log("Highlight saved:", highlight);
            // Highlight the text only after the annotation is saved
            finalizeHighlight(highlight.id);
        });
    });
  
    return highlight.id;
}

function finalizeHighlight(highlightId) {
    if (!highlightId) return;

    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    span.style.backgroundColor = 'yellow';
    span.className = 'highlighted-text';
    span.dataset.highlightId = highlightId;
    range.surroundContents(span);
    console.log("Text highlighted after saving:", range.toString());
}

function removeHighlight() {
    console.log("Removing highlight");
    const selection = window.getSelection();
    if (!selection.rangeCount) {
        console.log("No selection found");
        return;
    }
    const range = selection.getRangeAt(0);
    const span = range.startContainer.parentNode;

    if (!span || span.nodeName !== 'SPAN' || !span.dataset.highlightId) {
        console.error("No valid highlighted element found.");
        return;
    }

    const textNode = document.createTextNode(span.innerText);
    span.parentNode.replaceChild(textNode, span);
    console.log("Highlight removed:", span.innerText);

    const highlightId = span.dataset.highlightId;
    chrome.storage.local.get({ highlights: [] }, (result) => {
        const highlights = result.highlights.filter(h => h.id !== parseInt(highlightId));
        chrome.storage.local.set({ highlights: highlights }, () => {
            console.log("Highlight removed from storage:", highlightId);
        });
    });

    loadAnnotations();
}

function annotateSelection() {
    console.log("Annotate selection triggered");
    const selection = window.getSelection();
    if (!selection.rangeCount) {
        console.log("No selection found");
        return;
    }
    const range = selection.getRangeAt(0);
    const startContainer = range.startContainer.parentNode;
    const endContainer = range.endContainer.parentNode;

    loadSidebar(() => {
        console.log("Sidebar loaded");

        if (startContainer.classList && startContainer.classList.contains('annotated') && startContainer === endContainer) {
            const span = startContainer;
            console.log("Existing annotation found:", span);
            createAnnotationSidebar(span);  // Sidebar is created after it's loaded
        } else {
            // Defer highlighting until the annotation is saved
            createAnnotationSidebar(null, range);  // Pass the range for later use
        }
    });
}

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

                // Dynamically load the logo from the extension folder
                const logoElement = document.getElementById('annotator-logo');
                if (logoElement) {
                    console.log("Found element with ID 'annotator-logo'.");

                    const imgElement = document.createElement('img');
                    const imgSrc = chrome.runtime.getURL('assets/icons/icon.png');
                    console.log("Attempting to load image from:", imgSrc);
                    imgElement.src = imgSrc; // Load image from extension

                    // Add error handling for image loading
                    imgElement.onload = () => {
                        console.log("Image loaded successfully.");
                    };

                    imgElement.onerror = (error) => {
                        console.error("Failed to load image. Error:", error);
                    };

                    logoElement.appendChild(imgElement);
                    console.log("Image appended to 'annotator-logo' element.");
                } else {
                    console.error("Element with ID 'annotator-logo' not found.");
                }

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


