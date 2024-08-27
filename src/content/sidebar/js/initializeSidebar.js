function createAnnotationSidebar(span) {
    let sidebar = document.getElementById('annotation-sidebar');
    if (!sidebar) {
      sidebar = document.createElement('div');
      sidebar.id = 'annotation-sidebar';
      sidebar.style.position = 'fixed';
      sidebar.style.right = '0';
      sidebar.style.top = '0';
      sidebar.style.width = '350px';
      sidebar.style.height = '100%';
      sidebar.style.backgroundColor = '#f1f1f1';
      sidebar.style.boxShadow = '-2px 0 5px rgba(0, 0, 0, 0.2)';
      sidebar.style.padding = '15px';
      sidebar.style.overflowY = 'auto';
      sidebar.style.zIndex = '10000'; // Ensure it is on top of other content
  
      // Add a title
      const title = document.createElement('h3');
      title.innerText = 'Annotation';
      sidebar.appendChild(title);
  
      // Add textarea for the annotation
      const textarea = document.createElement('textarea');
      textarea.id = 'annotation-input';
      textarea.style.width = '100%';
      textarea.style.height = '150px';
      textarea.style.marginBottom = '10px';
      textarea.value = span.dataset.annotation || ''; // Pre-fill with existing annotation if available
      sidebar.appendChild(textarea);
  
      // Add buttons
      const buttonContainer = document.createElement('div');
      buttonContainer.style.display = 'flex';
      buttonContainer.style.justifyContent = 'space-between';
  
      const saveButton = document.createElement('button');
      saveButton.innerText = 'Save';
      saveButton.style.flex = '0 0 48%';
      saveButton.addEventListener('click', () => {
        saveAnnotation(span);
      });
      buttonContainer.appendChild(saveButton);
  
      const cancelButton = document.createElement('button');
      cancelButton.innerText = 'Cancel';
      cancelButton.style.flex = '0 0 48%';
      cancelButton.addEventListener('click', closeAnnotationSidebar);
      buttonContainer.appendChild(cancelButton);
  
      sidebar.appendChild(buttonContainer);
  
      document.body.appendChild(sidebar);
    }
  
    // Show the sidebar
    sidebar.style.display = 'block';
  }
  
  // Function to handle sidebar messages
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'showSidebar') {
      const span = document.createElement('span'); // Create a span or get the actual element
      span.innerText = message.text; // Set the text of the span
      createAnnotationSidebar(span); // Create and show the sidebar
      sendResponse({ status: "Sidebar shown" });
    }
  });
  