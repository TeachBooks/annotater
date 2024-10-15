document.addEventListener('DOMContentLoaded', () => {
  const summaryElement = document.getElementById('summary');
  const openSidebarButton = document.getElementById('open-sidebar');
  const clearHighlightsButton = document.getElementById('clear-highlights');
  const clearAnnotationsButton = document.getElementById('clear-annotations');
  const exportDataButton = document.getElementById('export-data');
  const importDataButton = document.getElementById('import-data');
  const importFileInput = document.getElementById('import-file');

  let currentUrl = '';

  // Get the current tab URL
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      currentUrl = new URL(tabs[0].url).href;  // Capture the full URL
      updateSummary(currentUrl);
  });

  // Fetch highlights and annotations from chrome storage for the specific webpage and display summary
  function updateSummary(url) {
      chrome.storage.local.get({ highlights: [], annotations: [] }, (result) => {
          // Filter highlights and annotations by the current webpage URL
          const webpageHighlights = result.highlights.filter(h => h.url === url);
          const webpageAnnotations = result.annotations.filter(a => a.url === url);

          const highlightCount = webpageHighlights.length;
          const annotationCount = webpageAnnotations.length;
          
          summaryElement.innerHTML = `
              <p>For this webpage, you have <strong>${highlightCount}</strong> highlights and <strong>${annotationCount}</strong> annotations.</p>
          `;
      });
  }

  // Open the annotation sidebar on the main page when button is clicked
  openSidebarButton.addEventListener('click', () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          chrome.tabs.sendMessage(tabs[0].id, { action: 'openSidebar' });
      });
  });

  // Clear all highlights for the current webpage with confirmation
  clearHighlightsButton.addEventListener('click', () => {
      if (confirm("Are you sure you want to clear all highlights for this webpage?")) {
          chrome.storage.local.get({ highlights: [] }, (result) => {
              const filteredHighlights = result.highlights.filter(h => h.url !== currentUrl); // Exclude highlights for current URL
              chrome.storage.local.set({ highlights: filteredHighlights }, () => {
                  alert("All highlights for this webpage cleared.");
                  updateSummary(currentUrl);  // Update the summary after clearing
              });
          });
      }
  });

  // Clear all annotations for the current webpage with confirmation
  clearAnnotationsButton.addEventListener('click', () => {
      if (confirm("Are you sure you want to clear all annotations for this webpage?")) {
          chrome.storage.local.get({ annotations: [] }, (result) => {
              const filteredAnnotations = result.annotations.filter(a => a.url !== currentUrl); // Exclude annotations for current URL
              chrome.storage.local.set({ annotations: filteredAnnotations }, () => {
                  alert("All annotations for this webpage cleared.");
                  updateSummary(currentUrl);  // Update the summary after clearing
              });
          });
      }
  });

  // Export highlights and annotations to a JSON file
  exportDataButton.addEventListener('click', () => {
      chrome.storage.local.get({ highlights: [], annotations: [] }, (result) => {
          const data = {
              highlights: result.highlights,
              annotations: result.annotations
          };
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          
          const a = document.createElement('a');
          a.href = url;
          a.download = 'annotations_data.json';
          a.click();
          URL.revokeObjectURL(url);  // Release memory
      });
  });

  // Import highlights and annotations from a JSON file
  importDataButton.addEventListener('click', () => {
      importFileInput.click();  // Trigger file input click
  });

  // Handle the file input for importing data
  importFileInput.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
              try {
                  const importedData = JSON.parse(e.target.result);
                  chrome.storage.local.get({ highlights: [], annotations: [] }, (result) => {
                      const mergedHighlights = [...result.highlights, ...importedData.highlights];
                      const mergedAnnotations = [...result.annotations, ...importedData.annotations];

                      chrome.storage.local.set({ highlights: mergedHighlights, annotations: mergedAnnotations }, () => {
                          alert("Data imported successfully.");
                          updateSummary(currentUrl);  // Update the summary after importing
                      });
                  });
              } catch (error) {
                  alert('Failed to import data: Invalid JSON file.');
              }
          };
          reader.readAsText(file);
      }
  });
});
