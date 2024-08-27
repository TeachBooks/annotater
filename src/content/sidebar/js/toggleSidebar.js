// src/content/sidebar/js/toggleSidebar.js

function toggleSidebar() {
    const container = document.getElementById('annotation-container');
    const sidebar = document.getElementById('annotation-sidebar');
    const toggleButtonIcon = document.querySelector('#toggle-sidebar-button i');

    // Toggle the 'closed' class on the sidebar
    sidebar.classList.toggle('closed');

    // Toggle the display of the entire annotation container
    container.style.display = container.style.display === 'none' ? 'block' : 'none';

    // Update the icon based on whether the sidebar is closed or open
    if (toggleButtonIcon) {
        if (sidebar.classList.contains('closed')) {
            toggleButtonIcon.classList.remove('fa-chevron-left');
            toggleButtonIcon.classList.add('fa-chevron-right');
        } else {
            toggleButtonIcon.classList.remove('fa-chevron-right');
            toggleButtonIcon.classList.add('fa-chevron-left');
        }
    }
}
