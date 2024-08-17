document.addEventListener('DOMContentLoaded', () => {
    const highlightsList = document.getElementById('highlights-list');
    const clearButton = document.getElementById('clear-highlights');
  
    chrome.storage.local.get({ highlights: [] }, (result) => {
      result.highlights.forEach((highlight, index) => {
        const listItem = document.createElement('div');
        listItem.textContent = `${highlight.text} - ${highlight.location.pathname}`;
        highlightsList.appendChild(listItem);
      });
    });
  
    clearButton.addEventListener('click', () => {
      chrome.storage.local.set({ highlights: [] });
      highlightsList.innerHTML = '';
    });
  });
  