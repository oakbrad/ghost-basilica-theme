// NPC Roller functionality
document.addEventListener('DOMContentLoaded', function() {
    // Find all NPC roller containers on the page
    const npcRollerContainers = document.querySelectorAll('.npc-roller-container');
    
    // Initialize each NPC roller
    npcRollerContainers.forEach(function(container) {
        const rollerButton = container.querySelector('.npc-roller-button');
        const rollerIcon = container.querySelector('.d20-icon');
        const tableContainer = document.querySelector('.npc-table-container');
        
        if (rollerButton && tableContainer) {
            rollerButton.addEventListener('click', function() {
                // Extract NPC data from the markdown table
                const npcData = extractNPCData(tableContainer);
                
                if (npcData.length === 0) {
                    console.error('No NPC data found. Please add a markdown table to your post.');
                    return;
                }
                
                // Add rolling animation to the d20 icon
                if (rollerIcon) {
                    rollerIcon.classList.add('rolling');
                    setTimeout(() => {
                        rollerIcon.classList.remove('rolling');
                    }, 800);
                }
                
                // Roll for a random NPC
                const randomIndex = Math.floor(Math.random() * npcData.length);
                
                // Highlight the corresponding card in the grid using the index after a slight delay
                setTimeout(() => {
                    highlightNPCCardByIndex(randomIndex);
                }, 800);
            });
        }
    });
    
    // Function to extract NPC data from markdown table
    function extractNPCData(contentSection) {
        const npcData = [];
        
        if (contentSection) {
            // Find all tables in the content section
            const tables = contentSection.querySelectorAll('table');
            
            if (tables.length > 0) {
                // Use the first table found
                const table = tables[0];
                
                // Get the header row to identify column indices
                const headerRow = table.querySelector('thead tr');
                if (!headerRow) return npcData;
                
                const headers = Array.from(headerRow.querySelectorAll('th')).map(th => th.textContent.trim().toLowerCase());
                
                // Find the index of each column
                const nameIndex = headers.indexOf('name');
                const descriptionIndex = headers.indexOf('description');
                const artworkIndex = headers.indexOf('artwork');
                const fileIndex = headers.indexOf('file');
                const wikiIndex = headers.indexOf('wiki');
                
                // Make sure we have the required columns
                if (nameIndex === -1 || descriptionIndex === -1 || artworkIndex === -1 || fileIndex === -1) {
                    console.error('Required columns missing from NPC table. Need Name, Description, Artwork, and File columns.');
                    return npcData;
                }
                
                // Get all rows except the header row
                const rows = table.querySelectorAll('tbody tr');
                
                // Extract data from each row
                rows.forEach(row => {
                    const cells = row.querySelectorAll('td');
                    if (cells.length > Math.max(nameIndex, descriptionIndex, artworkIndex, fileIndex)) {
                        const npc = {
                            name: cells[nameIndex].textContent.trim(),
                            description: cells[descriptionIndex].textContent.trim(),
                            artwork: extractUrl(cells[artworkIndex]),
                            file: extractUrl(cells[fileIndex]),
                            wiki: wikiIndex !== -1 ? extractUrl(cells[wikiIndex]) : null
                        };
                        npcData.push(npc);
                    }
                });
            }
        }
        
        return npcData;
    }
    
    // Function to extract URL from a cell (handles both text URLs and <a> tags)
    function extractUrl(cell) {
        // Check if the cell contains an <a> tag
        const link = cell.querySelector('a');
        if (link) {
            return {
                url: link.getAttribute('href'),
                text: link.textContent.trim()
            };
        }
        
        // Otherwise, use the text content as the URL
        const url = cell.textContent.trim();
        return {
            url: url,
            text: url
        };
    }
    
    // Function to highlight the corresponding NPC card in the grid by index
    function highlightNPCCardByIndex(index) {
        // Remove highlight from all cards
        const allCards = document.querySelectorAll('.npc-card');
        allCards.forEach(card => {
            card.classList.remove('npc-card-highlighted');
            card.classList.remove('card-highlighted');
        });
        
        // Highlight the card at the specified index
        if (allCards.length > index) {
            const cardToHighlight = allCards[index];
            cardToHighlight.classList.add('card-highlighted');
            
            // Scroll to the card
            cardToHighlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
});
