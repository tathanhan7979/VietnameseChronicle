/**
 * Custom implementation to replace deprecated DOM mutation events with modern MutationObserver
 * This file handles the image resize functionality for the Quill editor without using deprecated APIs
 */

export const setupQuillImageResize = (Quill: any): void => {
  if (!Quill) return;

  const ImageResize = {
    modules: {
      Resize: {
        init: function(quill: any) {
          // Use MutationObserver instead of DOMNodeInserted
          if (typeof window !== 'undefined' && window.MutationObserver) {
            const observer = new MutationObserver((mutations: MutationRecord[]) => {
              mutations.forEach((mutation: MutationRecord) => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                  Array.from(mutation.addedNodes).forEach((node: Node) => {
                    if (node instanceof HTMLElement && node.tagName === 'IMG') {
                      applyResizableImage(node as HTMLImageElement);
                    }
                  });
                }
              });
            });
            
            // Start observing the editor content
            const editorElement = quill.root;
            if (editorElement) {
              observer.observe(editorElement, { 
                childList: true, 
                subtree: true 
              });
            }
            
            // Also process existing images
            const images = editorElement.querySelectorAll('img');
            images.forEach((img: HTMLImageElement) => applyResizableImage(img));
          }
        }
      }
    }
  };

  // Apply resize handlers to an image
  function applyResizableImage(img: HTMLImageElement) {
    if (!img || img.getAttribute('data-resizable') === 'true') return;
    
    // Mark as resizable
    img.setAttribute('data-resizable', 'true');
    
    // Make draggable for resizing
    img.style.cursor = 'pointer';
    
    // Add resize event listener
    let isResizing = false;
    let startX = 0;
    let startY = 0;
    let startWidth = 0;
    let startHeight = 0;
    
    img.addEventListener('mousedown', (e) => {
      // Start resizing on mouse down
      startX = e.clientX;
      startY = e.clientY;
      startWidth = img.clientWidth;
      startHeight = img.clientHeight;
      isResizing = true;
      
      // Add event listeners for resize
      document.addEventListener('mousemove', resize);
      document.addEventListener('mouseup', stopResize);
      
      e.preventDefault();
    }, { passive: true });
    
    // Resize function
    function resize(e: MouseEvent) {
      if (!isResizing) return;
      
      // Calculate new size
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      // Calculate aspect ratio
      const aspectRatio = startWidth / startHeight;
      
      // Maintain aspect ratio while resizing
      const newWidth = startWidth + deltaX;
      const newHeight = newWidth / aspectRatio;
      
      // Apply new size
      img.style.width = newWidth + 'px';
      img.style.height = newHeight + 'px';
      
      e.preventDefault();
    }
    
    // Stop resizing
    function stopResize() {
      isResizing = false;
      document.removeEventListener('mousemove', resize);
      document.removeEventListener('mouseup', stopResize);
    }
  }

  // Register the module with Quill
  Quill.register('modules/imageResize', ImageResize);
};