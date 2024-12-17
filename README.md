# Local Annotator

```{admonition} User types
:class: tip
This page is useful for all user types, although explicitly designed for students!
```
+++
{bdg-success}`Chrome Extension`

```{admonition} Work in progress
:class: warning
This tool is still in development
```

A tool for making annotations on websites, with the primary application for use with online interactive textbooks. This extension provides students, readers and anyone with the ability to use an online textbook in a similar way as a paper book: highligh text and make notes in the margins. Although the initial feature set is simple, future releases will include the ability to use labels and different annotation types to improve your study sessions as well as features to collaborate with others. The extension is developed by the TeachBooks team (teachbooks@tudelft.nl)

You can download the extension directly from the [Chrome Web Store](https://chromewebstore.google.com/detail/teachbooks-annotator/dimjlbhnlppdgeckiigomiidepaopidm).

If you want to try it in **developer mode**, follow the step-by-step instructions below.

## Features

### Current Features
- **Highlight Text**: Select and highlight text on any webpage to make important information stand out.
- **Add Annotations**: Annotate your highlights with detailed notes to capture ideas or insights.
- **Annotation Toolbar**: Contextual toolbar appears when you interact with annotated or selected text, offering editing or deletion options.
- **Annotation Sidebar**:
  - View all annotations for the current page.
  - Edit, delete, or organize annotations from a central location.
- **Search Annotations**: Quickly search for specific annotations or highlighted text using a search bar. (Under development)
- **Export Highlights**: Export your highlights and annotations for later use.
- **Persistent Storage**: Automatically saves your annotations and highlights locally, so they stay on the page even when you refresh.
- **Undo Highlights and Annotations**: Remove highlights or annotations effortlessly.

### Future Features
- **Tags for Annotations**: Allow users to categorize annotations using custom tags for better organization.
- **Different Annotation Colors**: Support for multiple highlight and annotation colors to distinguish different types of information.
- **Annotation Sharing**: Share annotations with others via links or downloadable files.
- **Organized Annotation Dashboard**: A centralized dashboard to manage annotations across multiple pages.
- **Quick Copy Feature**: Allow users to quickly copy annotated or highlighted text.
- **Multi-page Annotation Viewing**: Navigate and manage annotations across multiple tabs or pages.
- **Improved Export Options**: Export highlights in multiple formats like PDF, Markdown, or CSV, or selective export for annotations with a specific tags.

## Installation

### From Chrome Web Store
1. Visit the [Chrome Web Store link](https://chromewebstore.google.com/detail/teachbooks-annotator/dimjlbhnlppdgeckiigomiidepaopidm).
2. Click the **"Add to Chrome"** button.
3. Once installed, the Local Annotator extension icon will appear in your Chrome toolbar.

### Developer Mode (Optional)
If you want to try the extension in **developer mode**, follow these instructions:

1. **Prepare the Extension Files**:
   - Ensure the following files are in a directory named `local-annotator-extension`:
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

## How to Use
1. **Highlight Text**:
   - Select the text you want to highlight.
   - Click on the "Highlight" option in the floating toolbar or context menu.
2. **Add Annotations**:
   - Select text and click "Annotate".
   - Write your note in the sidebar editor and save.
3. **Search for Annotations**:
   - Click on the search icon in the sidebar.
   - Type your query to filter annotations.
4. **Manage Annotations**:
   - Use the sidebar to edit or delete annotations.
5. **Export Highlights**:
   - Use the export option to save your highlights for later use.


## How to Test the Extension

To ensure that the Local Annotator Extension functions correctly, follow these comprehensive steps to test its basic and advanced functionalities:

### 1. Install the Extension from the Chrome Web Store
- **Step 1**: Navigate to the [Chrome Web Store link](https://chromewebstore.google.com/detail/teachbooks-annotator/dimjlbhnlppdgeckiigomiidepaopidm).
- **Step 2**: Click the **"Add to Chrome"** button.
- **Step 3**: Confirm the installation and ensure the extension icon appears in your Chrome toolbar.

### 2. Open an Online TeachBook
- **Step 1**: Visit any online interactive textbook supported by the TeachBooks platform.
- **Step 2**: Ensure the page loads completely to interact with its content.

### 3. Use the Extension as in Real Life
- **Highlight Text**:
  - **Action**: Select a portion of text you want to highlight.
  - **Expected Result**: The selected text is highlighted, and a floating toolbar or context menu appears with the "Highlight" option.
  
- **Add Annotations**:
  - **Action**: Select a portion of text and choose the "Annotate" option from the floating toolbar or context menu.
  - **Expected Result**: A sidebar appears where you can write and save your annotation.
  
- **Edit Annotations**:
  - **Action**: Open the annotation sidebar, select an existing annotation, and choose to edit it.
  - **Expected Result**: The annotation text is editable, and changes are saved upon confirmation.
  
- **Remove Annotations and Highlights**:
  - **Action**: Select highlighted text or an annotation and choose the delete option from the toolbar or sidebar.
  - **Expected Result**: The highlight or annotation is removed from the page and the sidebar.
  
- **Test Sidebar Functionalities**:
  - **Action**: Open the annotation sidebar to view all annotations on the current page.
  - **Expected Result**: All annotations are listed, and you can perform actions such as editing, deleting, or organizing them.
  
- **Export Highlights**:
  - **Action**: Use the export option to save your highlights and annotations.
  - **Expected Result**: A file containing your highlights and annotations is downloaded for later use.

### 4. Advanced Testing Scenarios

- **Import Highlights**:
  - **Action**: Use the import feature to load previously exported highlights and annotations.
  - **Expected Result**: The imported highlights and annotations appear correctly on the webpage and in the sidebar.
  
- **Remove and Reinstall the Extension**:
  - **Action**: Remove the extension from Chrome (`chrome://extensions/` > Remove), then reinstall it from the Chrome Web Store.
  - **Step**: After reinstalling, use the import feature to load your previously exported highlights and annotations.
  - **Expected Result**: Your highlights and annotations are restored accurately on the webpage and in the sidebar.
  
- **Edge Cases**:
  - **Highlighting an Annotated Text**:
    - **Action**: Select a text segment that already has an annotation and apply a highlight.
    - **Expected Result**: The text remains annotated, and the highlight is applied without causing conflicts or data loss.
    
  - **Annotating Highlighted Text**:
    - **Action**: Select a text segment that is already highlighted and add an annotation.
    - **Expected Result**: The existing highlight remains, and the new annotation is added successfully.
    
  - **Overlapping Annotations**:
    - **Action**: Create multiple annotations on overlapping text segments.
    - **Expected Result**: All annotations are visible and manageable without interfering with each other.
    
  - **Large Volume of Annotations**:
    - **Action**: Add a significant number of annotations on a single page.
    - **Expected Result**: The sidebar handles the large volume gracefully, allowing easy navigation and management of all annotations.
    
  - **Special Characters and Formatting**:
    - **Action**: Add annotations containing special characters, emojis, or rich text formatting.
    - **Expected Result**: Annotations display correctly without rendering issues or data corruption.
    
  - **Importing After Reinstallation**:
    - **Action**: Export annotations from one device, remove the extension, reinstall it on another device, and import the exported annotations.
    - **Expected Result**: Annotations are accurately imported and displayed on the new device.

### 5. Verify Basic Functionalities
- **Highlighting and Annotating**:
  - Ensure that you can successfully highlight and annotate multiple sections of text.
  
- **Editing and Deleting**:
  - Confirm that editing and deleting annotations and highlights work as expected.
  
- **Sidebar Management**:
  - Check that the sidebar accurately displays all annotations and allows for their management.
  
- **Persistent Storage**:
  - Refresh the page and verify that your highlights and annotations remain intact.
  
- **Undo Functionality**:
  - Test the undo feature to ensure highlights and annotations can be removed effortlessly.

### 6. Note Non-functional Features
- **Search Functionality**:
  - **Observation**: The search feature is not yet implemented and should not be tested.
  
- **Styling Options and Top Bar**:
  - **Observation**: Styling options (such as different colors for highlights) and the top bar options are not yet implemented.
  - **Action**: Attempt to use these features to confirm they are inactive.
  - **Expected Result**: No changes occur, and no errors are present. This is expected behavior as these features are planned for future releases.

### 7. Additional Test Cases
- **Cross-Page Annotations**:
  - **Action**: Create annotations on multiple pages within the same TeachBook.
  - **Expected Result**: Annotations are correctly associated with their respective pages and can be managed independently.
  
- **Export and Import Between Devices**:
  - **Action**: Export annotations from one device, install the extension on another device, and import the annotations.
  - **Expected Result**: Annotations are accurately imported and displayed on the new device.
  
- **Performance Testing**:
  - **Action**: Use the extension on pages with heavy content and multiple annotations.
  - **Expected Result**: The extension performs smoothly without significant lag or performance issues.
  
- **Special Text Structures**:
  - **Action**: Annotate text within tables, lists, or other complex HTML structures.
  - **Expected Result**: Annotations and highlights are applied correctly without disrupting the page layout.

By following these testing steps, you can thoroughly evaluate the functionality and reliability of the Local Annotator Extension, ensuring it meets the needs of its users effectively.


## Contribute
Feel free to submit feedback or suggest new features directly via the extension's review section on the Chrome Web Store. Your input helps make the Local Annotator better for everyone! This tool's repository is stored on [GitHub](https://github.com/TeachBooks/annotater). The `README.md` of the branch `Manual` is also part of the [TeachBooks manual](https://teachbooks.io/manual/intro.html) as a submodule. If you'd like to contribute, you can create a fork and open a pull request on the [GitHub repository](https://github.com/TeachBooks/annotater). To update the `README.md` shown in the TeachBooks manual, create a fork and open a merge request for the [GitHub repository of the manual](https://github.com/TeachBooks/manual). If you intent to clone the manual including its submodules, clone using: `git clone --recurse-submodulesgit@github.com:TeachBooks/manual.git`.
