/**
 * Responsive Height Adjustment for Map and Timeline Templates
 * 
 * This script dynamically adjusts the height of map and timeline templates
 * based on the actual header height, ensuring proper display on all devices.
 */

document.addEventListener("DOMContentLoaded", function() {
  // Initial adjustment
  adjustContentHeight();
  
  // Adjust on window resize
  window.addEventListener('resize', adjustContentHeight);
  
  // Adjust on orientation change for mobile devices
  window.addEventListener('orientationchange', adjustContentHeight);
});

/**
 * Adjusts the height of map and timeline containers based on actual header height
 */
function adjustContentHeight() {
  // Get the actual header height
  const header = document.querySelector('.gh-head');
  if (!header) return;
  
  const headerHeight = header.offsetHeight;
  console.log('Detected header height:', headerHeight);
  
  // Add a small buffer to prevent content from being cut off
  const buffer = 5;
  const totalOffset = headerHeight + buffer;
  
  // Adjust map height if on map template
  const mapElement = document.getElementById('map');
  if (mapElement) {
    const newHeight = `calc(100vh - ${totalOffset}px)`;
    mapElement.style.height = newHeight;
    mapElement.style.minHeight = newHeight;
    console.log('Set map height to:', newHeight);
    
    // Force Leaflet to update its container size
    if (window.map) {
      setTimeout(() => {
        window.map.invalidateSize();
      }, 100);
    }
  }
  
  // Adjust timeline height if on timeline template
  const timelineElement = document.getElementById('timeline-embed');
  if (timelineElement) {
    const newHeight = `calc(100vh - ${totalOffset}px)`;
    timelineElement.style.height = newHeight;
    console.log('Set timeline height to:', newHeight);
    
    // Force timeline to update if available
    if (window.timeline) {
      setTimeout(() => {
        window.timeline.updateDisplay();
      }, 100);
    }
  }
  
  // Also adjust any access message containers
  const mapAccessMessage = document.querySelector('.map-access-message');
  if (mapAccessMessage) {
    mapAccessMessage.style.height = `calc(100vh - ${totalOffset}px)`;
  }
  
  const timelineContainer = document.querySelector('.timeline-container');
  if (timelineContainer) {
    timelineContainer.style.height = `calc(100vh - ${totalOffset}px)`;
  }
}

