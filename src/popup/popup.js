document.addEventListener('DOMContentLoaded', () => {
  const summaryElement = document.getElementById('summary');
  const openSidebarButton = document.getElementById('open-sidebar');
  const clearHighlightsButton = document.getElementById('clear-highlights');
  const clearAnnotationsButton = document.getElementById('clear-annotations');

  let currentUrl = '';

  // Get the current tab URL
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      currentUrl = new URL(tabs[0].url).href;  // Capture the full URL

      updateSummary(currentUrl);
  });

  // Fetch highlights and annotations from chrome storage for the specific website and display summary
  function updateSummary(url) {
      chrome.storage.local.get({ highlights: [], annotations: [] }, (result) => {
          // Filter highlights and annotations by the current website URL
          const websiteHighlights = result.highlights.filter(h => h.url === url);
          const websiteAnnotations = result.annotations.filter(a => a.url === url);

          const highlightCount = websiteHighlights.length;
          const annotationCount = websiteAnnotations.length;
          
          summaryElement.innerHTML = `
              <p>For this website, you have <strong>${highlightCount}</strong> highlights and <strong>${annotationCount}</strong> annotations.</p>
          `;
      });
  }

  // Open the annotation sidebar on the main page when button is clicked
  openSidebarButton.addEventListener('click', () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          chrome.tabs.sendMessage(tabs[0].id, { action: 'openSidebar' });
      });
  });

  // Clear all highlights for the current website with confirmation
  clearHighlightsButton.addEventListener('click', () => {
      if (confirm("Are you sure you want to clear all highlights for this website?")) {
          chrome.storage.local.get({ highlights: [] }, (result) => {
              const filteredHighlights = result.highlights.filter(h => h.url !== currentUrl); // Exclude highlights for current URL
              chrome.storage.local.set({ highlights: filteredHighlights }, () => {
                  alert("All highlights for this website cleared.");
                  updateSummary(currentUrl);  // Update the summary after clearing
              });
          });
      }
  });

  // Clear all annotations for the current website with confirmation
  clearAnnotationsButton.addEventListener('click', () => {
      if (confirm("Are you sure you want to clear all annotations for this website?")) {
          chrome.storage.local.get({ annotations: [] }, (result) => {
              const filteredAnnotations = result.annotations.filter(a => a.url !== currentUrl); // Exclude annotations for current URL
              chrome.storage.local.set({ annotations: filteredAnnotations }, () => {
                  alert("All annotations for this website cleared.");
                  updateSummary(currentUrl);  // Update the summary after clearing
              });
          });
      }
  });
});
