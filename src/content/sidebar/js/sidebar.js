document.getElementById('toggle-sidebar-button').addEventListener('click', toggleContainerAndSidebar);

function toggleContainerAndSidebar() {
    const container = document.getElementById("annotation-container");
    const sidebar = document.getElementById("annotation-sidebar");

    // Toggle the display of the entire annotation container
    container.style.display = container.style.display === "none" ? "block" : "none";

    // Toggle the display of the annotation sidebar
    sidebar.style.display = sidebar.style.display === "none" ? "block" : "none";
}
