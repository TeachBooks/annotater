// src/content/sidebar/js/annotationSidebar.js

function createAnnotationSidebar(range = null) {
    console.log('Creating Annotation Sidebar');  // Debugging line
    loadSidebar(() => {
        const sidebar = document.getElementById('annotation-sidebar');
        if (sidebar) {
            console.log('Sidebar Found');  // Debugging line
            sidebar.style.display = 'block';
            console.log('Sidebar Display Set to Block');

            if (range) {
                // Highlight the text after the sidebar is shown
                const highlightId = saveHighlight(range.toString());
                finalizeHighlight(highlightId);
            }
        } else {
            console.log('Sidebar Not Found');  // Debugging line
        }
    });
}

function saveAnnotation() {
    closeAnnotationSidebar();
}

function closeAnnotationSidebar() {
    document.getElementById('annotation-sidebar').style.display = 'none';
}
