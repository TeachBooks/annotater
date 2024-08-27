// Log a message when the extension is installed or updated
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log("Local Annotator Extension Installed");
  } else if (details.reason === 'update') {
    console.log("Local Annotator Extension Updated");
  }
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "openSidebar") {
    console.log("Received request to open sidebar with text:", request.text);

    // Inject sidebar HTML and CSS into the current page
    chrome.scripting.executeScript({
      target: { tabId: sender.tab.id },
      files: ['src/content/sidebar/js/initializeSidebar.js'] // Ensure this file contains the sidebar creation logic
    });

    chrome.scripting.insertCSS({
      target: { tabId: sender.tab.id },
      files: ['src/content/sidebar/css/sidebar.css'] // Ensure the CSS is loaded
    });

    // Send a message to the content script to open the sidebar
    chrome.tabs.sendMessage(sender.tab.id, { action: "showSidebar", text: request.text });

    sendResponse({ status: "Sidebar opening initiated" });
  } else {
    console.warn("Unknown action:", request.action);
    sendResponse({ status: "Error", message: "Unknown action" });
  }

  // Return true to indicate that you want to send a response asynchronously
  return true;
});
