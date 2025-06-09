// Map Print Handler
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if a map exists on the page
    if (typeof L !== 'undefined' && document.getElementById('map')) {
        // Store a reference to the map
        const mapElement = document.getElementById('map');
        
        // Function to check if the map is initialized
        function isMapInitialized() {
            return mapElement && mapElement._leaflet_id;
        }
        
        // Get the Leaflet map instance
        function getMapInstance() {
            // This assumes the map is stored in a global variable or can be accessed through the element
            if (window.map) {
                return window.map;
            } else if (isMapInitialized()) {
                // Try to get the map instance from the element
                return L.map.instances[mapElement._leaflet_id];
            }
            return null;
        }
        
        // Before print handler
        window.addEventListener('beforeprint', function() {
            console.log('Preparing map for printing...');
            
            const map = getMapInstance();
            if (!map) {
                console.warn('Map instance not found');
                return;
            }
            
            // Store current map state to restore after printing
            window._mapPrintState = {
                zoom: map.getZoom(),
                center: map.getCenter(),
                bounds: map.getBounds()
            };
            
            // Make sure the map container is visible and sized appropriately
            mapElement.style.display = 'block';
            mapElement.style.width = '100%';
            mapElement.style.height = '100%';
            
            // Force the map to update its size
            map.invalidateSize();
            
            // Fit the map to its bounds with some padding
            // This ensures all markers and features are visible
            map.fitBounds(map.getBounds(), {
                padding: [50, 50],
                animate: false
            });
            
            // Disable animations and transitions for printing
            document.body.classList.add('leaflet-print-mode');
            
            console.log('Map prepared for printing');
        });
        
        // After print handler
        window.addEventListener('afterprint', function() {
            console.log('Restoring map after printing...');
            
            const map = getMapInstance();
            if (!map || !window._mapPrintState) {
                console.warn('Map instance or print state not found');
                return;
            }
            
            // Restore the map to its previous state
            map.setView(window._mapPrintState.center, window._mapPrintState.zoom, {
                animate: false
            });
            
            // Re-enable animations and transitions
            document.body.classList.remove('leaflet-print-mode');
            
            // Clean up
            delete window._mapPrintState;
            
            console.log('Map restored after printing');
        });
        
        // Add a print button to the map (optional)
        if (map && L.Control) {
            const PrintControl = L.Control.extend({
                options: {
                    position: 'topleft'
                },
                
                onAdd: function(map) {
                    const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-print');
                    const link = L.DomUtil.create('a', 'leaflet-control-print-button', container);
                    
                    link.href = '#';
                    link.title = 'Print Map';
                    link.innerHTML = '🖨️';
                    link.style.fontSize = '18px';
                    
                    L.DomEvent.on(link, 'click', L.DomEvent.stopPropagation)
                        .on(link, 'click', L.DomEvent.preventDefault)
                        .on(link, 'click', function() {
                            window.print();
                        });
                    
                    return container;
                }
            });
            
            // Try to add the print control if the map is available
            setTimeout(function() {
                const map = getMapInstance();
                if (map) {
                    map.addControl(new PrintControl());
                }
            }, 1000); // Delay to ensure map is initialized
        }
    }
});

