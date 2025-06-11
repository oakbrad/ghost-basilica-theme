// Table roller functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check if 3D dice libraries are available
    const checkLibraries = function() {
        const threeLoaded = typeof THREE !== 'undefined';
        const cannonLoaded = typeof CANNON !== 'undefined';
        const diceManagerLoaded = typeof DiceManager !== 'undefined';
        const diceRollerLoaded = typeof DiceRoller !== 'undefined';
        
        console.log('Library check:', {
            THREE: threeLoaded,
            CANNON: cannonLoaded,
            DiceManager: diceManagerLoaded,
            DiceRoller: diceRollerLoaded
        });
        
        return threeLoaded && cannonLoaded && diceManagerLoaded && diceRollerLoaded;
    };
    
    // Try to load the dice libraries if they're not already loaded
    const loadDiceLibraries = function() {
        if (checkLibraries()) {
            console.log('All 3D dice libraries already loaded');
            return true;
        }
        
        console.log('Attempting to load missing 3D dice libraries');
        
        // Try to load Three.js if not already loaded
        if (typeof THREE === 'undefined') {
            console.log('Loading Three.js');
            const threeScript = document.createElement('script');
            threeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
            document.head.appendChild(threeScript);
        }
        
        // Try to load Cannon.js if not already loaded
        if (typeof CANNON === 'undefined') {
            console.log('Loading Cannon.js');
            const cannonScript = document.createElement('script');
            cannonScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/cannon.js/0.6.2/cannon.min.js';
            document.head.appendChild(cannonScript);
        }
        
        // Try to load threejs-dice if not already loaded
        if (typeof DiceManager === 'undefined') {
            console.log('Loading threejs-dice');
            const diceScript = document.createElement('script');
            diceScript.src = 'https://cdn.jsdelivr.net/npm/threejs-dice@1.1.0/lib/dice.min.js';
            document.head.appendChild(diceScript);
        }
        
        // Check again after a short delay
        setTimeout(checkLibraries, 500);
        
        // Return false for now, the check will happen asynchronously
        return false;
    };
    
    // Try to load the libraries
    loadDiceLibraries();
    
    // Find all table roller containers on the page
    const tableRollerContainers = document.querySelectorAll('.table-roller-container');
    
    // Initialize each table roller
    tableRollerContainers.forEach(function(container, index) {
        const tableRollerButton = container.querySelector('.table-roller-button');
        const tableRollerResult = container.querySelector('.table-roller-result');
        const tableRollerIcon = container.querySelector('.d20-icon');
        
        // Find the associated content section for this roller
        // If there's a data-content-selector attribute, use that to find the content
        // Otherwise, use the default selector
        const contentSelector = container.getAttribute('data-content-selector') || '.gh-content';
        const contentSection = document.querySelector(contentSelector);
        
        if (tableRollerButton && tableRollerResult && contentSection) {
            tableRollerButton.addEventListener('click', function() {
                console.log('Table roller button clicked');
                
                // Extract table data from the markdown table
                const tableData = extractTableData(contentSection);
                
                if (tableData.length === 0) {
                    tableRollerResult.textContent = 'No table data found. Please add a markdown table to your post.';
                    return;
                }
                
                // Clear previous result and show loading state
                tableRollerResult.textContent = 'Rolling...';
                tableRollerResult.classList.remove('result-fade-in');
                
                // Roll on the table (random selection)
                const randomIndex = Math.floor(Math.random() * tableData.length);
                const result = tableData[randomIndex];
                
                console.log('Random index:', randomIndex, 'Result:', result);
                
                // Check if 3D dice libraries are available
                const use3DDice = checkLibraries();
                
                console.log('Using 3D dice:', use3DDice);
                
                if (use3DDice) {
                    // Roll the die with the appropriate number of sides
                    // Use randomIndex + 1 as the target value (since dice values start at 1)
                    try {
                        DiceRoller.roll(tableData.length, randomIndex + 1, function(diceResult) {
                            console.log('Dice roll completed with result:', diceResult);
                            // Display the result with animation
                            displayResult(result);
                        });
                    } catch (error) {
                        console.error('Error using 3D dice:', error);
                        // Fall back to traditional method
                        fallbackToTraditional();
                    }
                } else {
                    // Fall back to traditional method
                    fallbackToTraditional();
                }
                
                // Traditional method as fallback
                function fallbackToTraditional() {
                    // Add rolling animation to the d20 icon
                    if (tableRollerIcon) {
                        tableRollerIcon.classList.add('rolling');
                        setTimeout(() => {
                            tableRollerIcon.classList.remove('rolling');
                        }, 800);
                    }
                    
                    // Use the traditional method with a slight delay
                    setTimeout(() => {
                        displayResult(result);
                    }, 800);
                }
            });
            
            // Function to display the result
            function displayResult(result) {
                console.log('Displaying result:', result);
                
                // Use innerHTML to preserve HTML links
                tableRollerResult.innerHTML = result;
                
                // Add target="_blank" to all links in the result
                const links = tableRollerResult.querySelectorAll('a');
                links.forEach(link => {
                    link.setAttribute('target', '_blank');
                    link.setAttribute('rel', 'noopener noreferrer');
                });
                
                tableRollerResult.classList.add('result-fade-in');
            }
        }
    });
    
    // Function to extract table data from markdown table
    function extractTableData(contentSection) {
        const tableData = [];
        
        if (contentSection) {
            // Find all tables in the content section
            const tables = contentSection.querySelectorAll('table');
            
            if (tables.length > 0) {
                // Use the first table found
                const table = tables[0];
                
                // Get all rows except the header row
                const rows = table.querySelectorAll('tbody tr');
                
                // Extract data from each row
                rows.forEach(row => {
                    // Get the second column (index 1) if it exists, otherwise get the first column
                    const cells = row.querySelectorAll('td');
                    if (cells.length > 1) {
                        // Use innerHTML instead of textContent to preserve links
                        tableData.push(cells[1].innerHTML.trim());
                    } else if (cells.length > 0) {
                        tableData.push(cells[0].innerHTML.trim());
                    }
                });
            }
        }
        
        return tableData;
    }
});
