// Table roller functionality
document.addEventListener('DOMContentLoaded', function() {
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
                
                // If 3D dice is available, use it
                if (typeof DiceRoller !== 'undefined' && typeof THREE !== 'undefined' && typeof CANNON !== 'undefined') {
                    // Roll the die with the appropriate number of sides
                    // Use randomIndex + 1 as the target value (since dice values start at 1)
                    DiceRoller.roll(tableData.length, randomIndex + 1, function(diceResult) {
                        // Display the result with animation
                        displayResult(result);
                    });
                } else {
                    // Add rolling animation to the d20 icon if not using 3D dice
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
