// src/content/sidebar/js/initializeSidebar.js

import { storageManager } from '../../storage/storageManager';

function initializeSidebar() {
    const annotations = storageManager.loadAnnotations();
    const tags = storageManager.loadTags();
    loadHighlights(annotations);
    displayAnnotationsInSidebar(annotations);
    initializeTagSelection(tags);

    document.getElementById('save-button').addEventListener('click', saveAnnotation);
    document.getElementById('cancel-button').addEventListener('click', closeAnnotationSidebar);
    document.getElementById('import-button').addEventListener('change', importAnnotations);
    document.getElementById('export-button').addEventListener('click', exportAnnotations);

    document.querySelectorAll('.toolbar-button').forEach(button => {
        button.addEventListener('click', handleToolbarClick);
    });

    document.getElementById('toggle-sidebar-button').addEventListener('click', toggleSidebar);
}

function loadHighlights(annotations) {
    annotations.forEach(annotation => {
        applyHighlight(annotation);
    });
}

function displayAnnotationsInSidebar(annotations) {
    const sidebarList = document.getElementById('annotations-list');
    sidebarList.innerHTML = ''; // Clear current list
    annotations.forEach(annotation => {
        const listItem = document.createElement('li');
        listItem.textContent = annotation.text;
        sidebarList.appendChild(listItem);
    });
}

function initializeTagSelection(tags) {
    const tagSelect = document.getElementById('tag-select');
    tags.forEach(tag => {
        const option = document.createElement('option');
        option.value = tag;
        option.textContent = tag;
        tagSelect.appendChild(option);
    });
}

function saveAnnotation() {
    const annotationText = document.getElementById('annotation-editor').innerText;
    const selectedTags = Array.from(document.getElementById('tag-input').value.split(',').map(tag => tag.trim()));
    const annotation = createAnnotation(annotationText, selectedTags);
    const annotations = storageManager.loadAnnotations();
    annotations.push(annotation);
    storageManager.saveAnnotations(annotations, selectedTags);
    displayAnnotationsInSidebar(annotations);  // Refresh sidebar
}

function importAnnotations(event) {
    const file = event.target.files[0];
    storageManager.importAnnotations(file);
}

function exportAnnotations() {
    storageManager.exportAnnotations();
}

document.addEventListener('DOMContentLoaded', initializeSidebar);
window.initializeSidebar = initializeSidebar;
