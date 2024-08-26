// src/storage/storageManager.js

const STORAGE_KEY_ANNOTATIONS = 'annotations';
const TAGS_KEY = 'annotation_tags';

export const storageManager = {
    saveAnnotations(annotations, tags) {
        if (isLocalFile()) {
            saveAnnotationsToFile(annotations);
        } else {
            localStorage.setItem(STORAGE_KEY_ANNOTATIONS, JSON.stringify(annotations));
            localStorage.setItem(TAGS_KEY, JSON.stringify(tags));
        }
    },
    
    loadAnnotations() {
        if (isLocalFile()) {
            return loadAnnotationsFromFile();
        } else {
            const annotations = localStorage.getItem(STORAGE_KEY_ANNOTATIONS);
            return annotations ? JSON.parse(annotations) : [];
        }
    },
    
    loadTags() {
        if (isLocalFile()) {
            const annotations = loadAnnotationsFromFile();
            return annotations.reduce((acc, annotation) => {
                annotation.tags.forEach(tag => {
                    if (!acc.includes(tag)) acc.push(tag);
                });
                return acc;
            }, []);
        } else {
            const tags = localStorage.getItem(TAGS_KEY);
            return tags ? JSON.parse(tags) : [];
        }
    },
    
    exportAnnotations() {
        const annotations = this.loadAnnotations();
        const tags = this.loadTags();
        const exportData = {
            annotations,
            tags
        };
        downloadJSON(exportData, 'annotations_export.json');
    },
    
    importAnnotations(file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const importData = JSON.parse(event.target.result);
            const existingAnnotations = this.loadAnnotations();
            const mergedAnnotations = [...existingAnnotations, ...importData.annotations];
            const mergedTags = Array.from(new Set([...this.loadTags(), ...importData.tags]));
            this.saveAnnotations(mergedAnnotations, mergedTags);
        };
        reader.readAsText(file);
    }
};

function isLocalFile() {
    return window.location.protocol === 'file:';
}

function saveAnnotationsToFile(annotations) {
    const fileHandle = getFileHandle();
    fileHandle.createWritable().then(writable => {
        writable.write(JSON.stringify(annotations));
        writable.close();
    });
}

function loadAnnotationsFromFile() {
    const fileHandle = getFileHandle();
    return fileHandle.getFile().then(file => file.text().then(text => JSON.parse(text)));
}

async function getFileHandle() {
    const options = {
        suggestedName: `${getWebsiteName()}-annotations.json`,
        types: [{
            description: 'JSON file',
            accept: {'application/json': ['.json']}
        }]
    };
    const fileHandle = await window.showSaveFilePicker(options);
    return fileHandle;
}

function getWebsiteName() {
    const path = window.location.pathname.split('/');
    return path[path.length - 2] || path[path.length - 1];
}

function downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
