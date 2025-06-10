// Map print helper functions
document.addEventListener('DOMContentLoaded', function() {
    // Add a custom print button as a fallback
    setTimeout(function() {
        const mapElement = document.getElementById('map');
        if (mapElement) {
            const printButton = document.createElement('button');
            printButton.className = 'custom-print-button';
            printButton.innerHTML = 'Print Map (Fallback)';
            printButton.addEventListener('click', function() {
                // Custom print function to ensure the map is properly scaled
                const originalWidth = mapElement.style.width;
                const originalHeight = mapElement.style.height;
                
                // Set the map to 100% width and height for printing
                mapElement.style.width = '100%';
                mapElement.style.height = '100%';
                
                // Force a resize of the map
                if (window.map) {
                    window.map.invalidateSize({pan: false});
                }
                
                // Print the map
                window.print();
                
                // Restore the original dimensions after printing
                setTimeout(function() {
                    mapElement.style.width = originalWidth;
                    mapElement.style.height = originalHeight;
                    if (window.map) {
                        window.map.invalidateSize({pan: false});
                    }
                }, 500);
            });
            
            document.body.appendChild(printButton);
        }
    }, 1000);
    
    // Store a reference to the map for the print button
    window.storeMapReference = function(mapInstance) {
        window.map = mapInstance;
    };
});

