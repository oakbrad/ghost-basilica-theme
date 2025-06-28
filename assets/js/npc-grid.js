// NPC Grid functionality
document.addEventListener('DOMContentLoaded', function() {
    // Find the post content section
    const postContent = document.querySelector('.npc-post-content');
    
    if (postContent) {
        // Extract NPC data from the markdown table
        const npcData = extractNPCData(postContent);
        
        if (npcData.length > 0) {
            // Create the grid container
            const gridContainer = document.createElement('div');
            gridContainer.className = 'npc-grid-container';
            
            // Create a card for each NPC
            npcData.forEach((npc, index) => {
                const card = createNPCCard(npc, index);
                gridContainer.appendChild(card);
            });
            
            // Add the grid after the post content
            postContent.parentNode.insertBefore(gridContainer, postContent.nextSibling);
            
            // Animate cards in with a staggered delay
            setTimeout(() => {
                const cards = document.querySelectorAll('.npc-card');
                cards.forEach((card, index) => {
                    setTimeout(() => {
                        card.classList.add('animate-in');
                    }, index * 100);
                });
            }, 100);
        }
    }
    
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
    
    // Function to create an NPC card
    function createNPCCard(npc, index) {
        const card = document.createElement('div');
        card.className = 'npc-card';
        card.setAttribute('data-npc-index', index);
        
        // Image container
        const imageContainer = document.createElement('div');
        imageContainer.className = 'npc-image-container';
        
        const image = document.createElement('img');
        image.className = 'npc-image';
        image.src = npc.artwork.url;
        image.alt = npc.name;
        imageContainer.appendChild(image);
        
        // Content container
        const contentContainer = document.createElement('div');
        contentContainer.className = 'npc-content-container';
        
        // Name
        const nameElement = document.createElement('h3');
        nameElement.className = 'npc-name';
        
        if (npc.wiki && npc.wiki.url) {
            const nameLink = document.createElement('a');
            nameLink.href = npc.wiki.url;
            nameLink.textContent = npc.name;
            nameLink.target = '_blank';
            nameElement.appendChild(nameLink);
        } else {
            nameElement.textContent = npc.name;
        }
        
        // Description
        const descriptionElement = document.createElement('p');
        descriptionElement.className = 'npc-description';
        descriptionElement.textContent = npc.description;
        
        // Download link
        const downloadLink = document.createElement('a');
        downloadLink.className = 'npc-download';
        downloadLink.href = npc.file.url;
        downloadLink.textContent = 'Download';
        downloadLink.target = '_blank';
        
        // Assemble the card
        contentContainer.appendChild(nameElement);
        contentContainer.appendChild(descriptionElement);
        contentContainer.appendChild(downloadLink);
        
        card.appendChild(imageContainer);
        card.appendChild(contentContainer);
        
        return card;
    }
});

