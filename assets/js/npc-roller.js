// NPC Roller functionality
document.addEventListener('DOMContentLoaded', function() {
    // Find all NPC roller containers on the page
    const npcRollerContainers = document.querySelectorAll('.npc-roller-container');
    
    // Initialize each NPC roller
    npcRollerContainers.forEach(function(container) {
        const rollerButton = container.querySelector('.npc-roller-button');
        const rollerResult = container.querySelector('.npc-roller-result');
        const rollerIcon = container.querySelector('.d20-icon');
        const tableContainer = document.querySelector('.npc-table-container');
        
        if (rollerButton && rollerResult && tableContainer) {
            rollerButton.addEventListener('click', function() {
                // Extract NPC data from the markdown table
                const npcData = extractNPCData(tableContainer);
                
                if (npcData.length === 0) {
                    rollerResult.textContent = 'No NPC data found. Please add a markdown table to your post.';
                    return;
                }
                
                // Clear previous result and show loading state
                rollerResult.textContent = 'Rolling...';
                rollerResult.classList.remove('result-fade-in');
                
                // Add rolling animation to the d20 icon
                if (rollerIcon) {
                    rollerIcon.classList.add('rolling');
                    setTimeout(() => {
                        rollerIcon.classList.remove('rolling');
                    }, 800);
                }
                
                // Roll for a random NPC
                const randomIndex = Math.floor(Math.random() * npcData.length);
                const selectedNPC = npcData[randomIndex];
                
                // Create the result HTML
                let resultHTML = `<div class="npc-roll-card">`;
                
                // Add image if available
                if (selectedNPC.artwork && selectedNPC.artwork.url) {
                    resultHTML += `<div class="npc-roll-image-container">
                        <img src="${selectedNPC.artwork.url}" alt="${selectedNPC.name}" class="npc-roll-image">
                    </div>`;
                }
                
                // Add name with optional wiki link
                resultHTML += `<div class="npc-roll-content">`;
                if (selectedNPC.wiki && selectedNPC.wiki.url) {
                    resultHTML += `<h3 class="npc-roll-name"><a href="${selectedNPC.wiki.url}" target="_blank" rel="noopener noreferrer">${selectedNPC.name}</a></h3>`;
                } else {
                    resultHTML += `<h3 class="npc-roll-name">${selectedNPC.name}</h3>`;
                }
                
                // Add description
                resultHTML += `<p class="npc-roll-description">${selectedNPC.description}</p>`;
                
                // Add download link
                if (selectedNPC.file && selectedNPC.file.url) {
                    resultHTML += `<a href="${selectedNPC.file.url}" class="npc-roll-download" target="_blank" rel="noopener noreferrer">Download</a>`;
                }
                
                resultHTML += `</div></div>`;
                
                // Display the result with a slight delay and animation
                setTimeout(() => {
                    rollerResult.innerHTML = resultHTML;
                    rollerResult.classList.add('result-fade-in');
                    
                    // Highlight the corresponding card in the grid using the index
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
        });
        
        // Highlight the card at the specified index
        if (allCards.length > index) {
            const cardToHighlight = allCards[index];
            cardToHighlight.classList.add('npc-card-highlighted');
            
            // Scroll to the card
            cardToHighlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
});

