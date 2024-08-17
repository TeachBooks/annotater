 

function updateHighlight(highlightId, note) {
    console.log('Updating highlight ID ' + highlightId + ' with note: ' + note);
    chrome.storage.local.get({ highlights: [] }, (result) => {
        const highlights = result.highlights.map(h => {
            if (h.id === parseInt(highlightId)) {
                h.note = note;
            }
            return h;
        });
        chrome.storage.local.set({ highlights: highlights }, () => {
            console.log("Highlight updated in storage:", highlightId);
        });
    });
}
