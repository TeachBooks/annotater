// src/content/sidebar/js/toggleSidebar.js

function toggleSidebar() {
    const sidebar = document.getElementById('annotation-sidebar');
    sidebar.classList.toggle('closed');

    const toggleButtonIcon = document.querySelector('#toggle-sidebar-button i');
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
