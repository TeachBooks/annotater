 
// storageManager.js

const STORAGE_KEY_ANNOTATIONS = 'annotations';
const STORAGE_KEY_HIGHLIGHTS = 'highlights';

export const storageManager = {
    saveAnnotations(annotations) {
        localStorage.setItem(STORAGE_KEY_ANNOTATIONS, JSON.stringify(annotations));
    },
    
    loadAnnotations() {
        const annotations = localStorage.getItem(STORAGE_KEY_ANNOTATIONS);
        return annotations ? JSON.parse(annotations) : [];
    },

    saveHighlights(highlights) {
        localStorage.setItem(STORAGE_KEY_HIGHLIGHTS, JSON.stringify(highlights));
    },
    
    loadHighlights() {
        const highlights = localStorage.getItem(STORAGE_KEY_HIGHLIGHTS);
        return highlights ? JSON.parse(highlights) : [];
    }
};
