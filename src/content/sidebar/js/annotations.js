document.getElementById('save-button').addEventListener('click', saveAnnotation);

function saveAnnotation() {
    const annotationText = document.getElementById('annotation-editor').innerText;
    const tags = document.getElementById('tag-input').value.split(',').map(tag => tag.trim());
    const url = window.location.href;

    const annotation = {
        text: annotationText,
        tags: tags,
        url: url,
        date: new Date().toISOString()
    };

    chrome.storage.local.get({ annotations: [] }, function(result) {
        const annotations = result.annotations;
        annotations.push(annotation);
        chrome.storage.local.set({ annotations: annotations });
    });
}
