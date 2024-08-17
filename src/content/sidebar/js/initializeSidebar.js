// src/content/sidebar/js/initializeSidebar.js

function initializeSidebar() {
    console.log("Initializing sidebar event listeners.");
    document.getElementById('save-button').addEventListener('click', saveAnnotation);
    document.getElementById('cancel-button').addEventListener('click', closeAnnotationSidebar);

    // Add these only if you have toolbar buttons for text styling:
    document.querySelectorAll('.toolbar-button').forEach(button => {
        button.addEventListener('click', handleToolbarClick);
    });

    // Add this if you have a toggle sidebar button:
    document.getElementById('toggle-sidebar-button').addEventListener('click', toggleSidebar);
}

// Ensure the initializeSidebar function runs once the DOM is ready
document.addEventListener('DOMContentLoaded', initializeSidebar);
