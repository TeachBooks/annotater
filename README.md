## How to Try the Local Annotator Extension

### Step-by-Step Instructions

1. **Prepare the Extension Files**:
   - make sure the following file exist in a directory named `local-annotator-extension`:
     - `manifest.json`
     - `popup.html`
     - `popup.js`
     - `background.js`
     - `content.js`
     - `styles.css`
     - `icon.png` (128x128 icon image)

2. **Load the Extension in Chrome**:
   - Open Chrome and navigate to `chrome://extensions/`.
   - Enable "Developer mode".
   - Click "Load unpacked" and select the `local-annotator-extension` directory.

3. **Test the Extension**:
   - Navigate to any webpage.
   - Open Developer Tools (F12 or right-click and "Inspect") and go to the "Console" tab.
   - Select some text to see context menu options "Annotate" and "Highlight".
   - Click "Annotate" or "Highlight" in the context menu.

