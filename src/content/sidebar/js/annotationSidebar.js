chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "openSidebar") {
        openSidebar(request.text);
    }
});

function openSidebar(text) {
    const sidebar = document.getElementById("annotation-sidebar");
    if (sidebar) {
        sidebar.style.display = "block";
        document.getElementById('annotation-editor').innerText = text;
    } else {
        console.error("Sidebar element not found!");
    }
}
