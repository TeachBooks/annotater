document.getElementById('toggle-sidebar-button').addEventListener('click', toggleSidebar);

function toggleSidebar() {
    const sidebar = document.getElementById("annotation-sidebar");
    sidebar.style.display = sidebar.style.display === "block" ? "none" : "block";
}
