chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "highlight",
    title: "Highlight Text",
    contexts: ["selection"]
  });

  chrome.contextMenus.create({
    id: "annotate",
    title: "Annotate Text",
    contexts: ["selection"]
  });

  chrome.contextMenus.create({
    id: "removeHighlight",
    title: "Remove Highlight",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "highlight") {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: highlightSelection
    });
  } else if (info.menuItemId === "annotate") {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: annotateSelection
    });
  } else if (info.menuItemId === "removeHighlight") {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: removeHighlight
    });
  }
});

function saveHighlight(text, note = '') {
  const highlight = {
    id: Date.now(), // Unique identifier for the highlight
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
    chrome.storage.local.set({ highlights: highlights });
  });

  return highlight.id; // Return the ID to attach to the span element
}

function highlightSelection() {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;
  const range = selection.getRangeAt(0);
  const span = document.createElement('span');
  span.style.backgroundColor = 'yellow';
  span.className = 'highlighted-text';
  const highlightId = saveHighlight(range.toString()); // Save highlight and get the ID
  span.dataset.highlightId = highlightId; // Attach the ID to the span element
  range.surroundContents(span);
}

function createAnnotationSidebar(span) {
  let sidebar = document.getElementById('annotation-sidebar');
  if (!sidebar) {
    sidebar = document.createElement('div');
    sidebar.id = 'annotation-sidebar';
    sidebar.style.position = 'fixed';
    sidebar.style.right = '0';
    sidebar.style.top = '0';
    sidebar.style.width = '350px';
    sidebar.style.height = '100%';
    sidebar.style.backgroundColor = '#f1f1f1';
    sidebar.style.boxShadow = '-2px 0 5px rgba(0, 0, 0, 0.2)';
    sidebar.style.padding = '15px';
    sidebar.style.overflowY = 'auto';
    sidebar.style.zIndex = '10000'; // Ensure it is on top of other content

    // Add a title
    const title = document.createElement('h3');
    title.innerText = 'Annotation';
    sidebar.appendChild(title);

    // Add textarea for the annotation
    const textarea = document.createElement('textarea');
    textarea.id = 'annotation-input';
    textarea.style.width = '100%';
    textarea.style.height = '150px';
    textarea.style.marginBottom = '10px';
    textarea.value = span.dataset.annotation || ''; // Pre-fill with existing annotation if available
    sidebar.appendChild(textarea);

    // Add buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'space-between';

    const saveButton = document.createElement('button');
    saveButton.innerText = 'Save';
    saveButton.style.flex = '0 0 48%';
    saveButton.addEventListener('click', () => {
      saveAnnotation(span);
    });
    buttonContainer.appendChild(saveButton);

    const cancelButton = document.createElement('button');
    cancelButton.innerText = 'Cancel';
    cancelButton.style.flex = '0 0 48%';
    cancelButton.addEventListener('click', closeAnnotationSidebar);
    buttonContainer.appendChild(cancelButton);

    sidebar.appendChild(buttonContainer);

    document.body.appendChild(sidebar);
  }

  // Show the sidebar
  sidebar.style.display = 'block';
}

function closeAnnotationSidebar() {
  const sidebar = document.getElementById('annotation-sidebar');
  if (sidebar) {
    sidebar.style.display = 'none';
  }
}

function saveAnnotation(span) {
  const textarea = document.getElementById('annotation-input');
  const note = textarea.value.trim();

  if (note) {
    span.dataset.annotation = note; // Store the annotation directly in the span element
    updateHighlight(span.dataset.highlightId, note);
  }

  closeAnnotationSidebar();
}

function updateHighlight(highlightId, note) {
  chrome.storage.local.get({ highlights: [] }, (result) => {
    const highlights = result.highlights.map(h => {
      if (h.id === parseInt(highlightId)) {
        h.note = note; // Update the note for this highlight
      }
      return h;
    });
    chrome.storage.local.set({ highlights: highlights });
  });
}

function annotateSelection() {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;
  const range = selection.getRangeAt(0);
  const startContainer = range.startContainer.parentNode;
  const endContainer = range.endContainer.parentNode;

  // Check if the selection is within an existing highlight
  if (startContainer.classList && startContainer.classList.contains('annotated') && startContainer === endContainer) {
    createAnnotationSidebar(startContainer);
  } else {
    const span = document.createElement('span');
    span.style.backgroundColor = 'yellow';
    span.className = 'highlighted-text annotated';
    const highlightId = saveHighlight(range.toString()); // Save highlight and get the ID
    span.dataset.highlightId = highlightId; // Attach the ID to the span element
    range.surroundContents(span);
    createAnnotationSidebar(span); // Open the sidebar with the new highlight
  }
}

function removeHighlight() {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;
  const range = selection.getRangeAt(0);
  const span = range.startContainer.parentNode;

  if (!span || span.nodeName !== 'SPAN' || !span.dataset.highlightId) {
    console.error("No valid highlighted element found.");
    return;
  }

  // Remove the span and replace it with plain text
  const textNode = document.createTextNode(span.innerText);
  span.parentNode.replaceChild(textNode, span);

  // Remove the corresponding highlight from storage
  const highlightId = span.dataset.highlightId;
  chrome.storage.local.get({ highlights: [] }, (result) => {
    const highlights = result.highlights.filter(h => h.id !== parseInt(highlightId));
    chrome.storage.local.set({ highlights: highlights });
  });
}
