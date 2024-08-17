// src/content/sidebar/js/toolbar.js

function handleToolbarClick(event) {
    const command = event.currentTarget.getAttribute('data-command');
    const value = event.currentTarget.getAttribute('value') || null;

    if (command) {
        if (command === 'createLink') {
            const url = prompt("Enter the URL:", "http://");
            if (url) {
                document.execCommand(command, false, url);
            }
        } else if (command === 'insertImage') {
            const imageUrl = prompt("Enter the image URL:", "http://");
            if (imageUrl) {
                document.execCommand(command, false, imageUrl);
            }
        } else {
            document.execCommand(command, false, value);
        }
    }
}
