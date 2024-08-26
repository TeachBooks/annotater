document.getElementById('save-page-notes').addEventListener('click', savePageNotes);

function savePageNotes() {
    const notes = document.getElementById('page-notes-editor').value;
    const url = window.location.href;

    const pageNote = {
        notes: notes,
        url: url,
        date: new Date().toISOString()
    };

    if (window.location.protocol === 'file:') {
        // Save to a local JSON file
        saveToLocalFile(pageNote, "pageNotes");
    } else {
        // Save to chrome.storage.local
        chrome.storage.local.get({ pageNotes: [] }, function(result) {
            const pageNotes = result.pageNotes;
            pageNotes.push(pageNote);
            chrome.storage.local.set({ pageNotes: pageNotes });
        });
    }
}

function saveToLocalFile(data, type) {
    const fileName = `${type}.json`;
    const existingData = loadFromLocalFile(fileName) || [];
    existingData.push(data);

    const blob = new Blob([JSON.stringify(existingData)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
}

function loadFromLocalFile(fileName) {
    // Since file reading in Chrome extensions is complex, assume this function returns parsed JSON data from a local file
    // In real scenarios, you'd use the FileSystem API or similar
    return []; // Placeholder for actual implementation
}
