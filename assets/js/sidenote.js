/**
 * sidenote.js - Convert footnotes to sidenotes in Ghost themes
 * 
 * This script looks for footnotes in a Ghost post and converts them to sidenotes
 * that appear in the margin of the page when there's enough horizontal space.
 * At smaller screen sizes, it falls back to the default footnote behavior.
 * 
 * Inspired by Molly White's implementation for Citation Needed.
 */

(function() {
    // Only run on post pages
    if (!document.querySelector('.post-content')) {
        return;
    }

    // Media query to check if we have enough horizontal space for sidenotes
    const mediaQuery = window.matchMedia('(min-width: 1200px)');
    
    // Elements
    const article = document.querySelector('.post-content');
    const footnotes = document.querySelector('.footnotes');
    
    // If no footnotes, exit
    if (!footnotes) {
        return;
    }
    
    // Create container for sidenotes
    const sidenotesContainer = document.createElement('div');
    sidenotesContainer.className = 'sidenotes-container';
    article.appendChild(sidenotesContainer);
    
    // Get all footnote references and footnote content
    const footnoteRefs = article.querySelectorAll('sup[id^="fnref"]');
    const footnoteItems = footnotes.querySelectorAll('li[id^="fn"]');
    
    // Create sidenotes
    footnoteRefs.forEach((ref, index) => {
        // Get the footnote ID
        const id = ref.id.replace('fnref', '');
        const footnote = document.getElementById(`fn${id}`);
        
        if (!footnote) {
            return;
        }
        
        // Create sidenote
        const sidenote = document.createElement('div');
        sidenote.className = 'sidenote';
        sidenote.id = `sn${id}`;
        
        // Get footnote content (excluding the backlink)
        const footnoteContent = footnote.innerHTML.replace(/<a href="#fnref[^>]*>↩<\/a>/, '');
        sidenote.innerHTML = footnoteContent;
        
        // Position the sidenote
        positionSidenote(ref, sidenote);
        
        // Add sidenote to container
        sidenotesContainer.appendChild(sidenote);
    });
    
    // Function to position sidenotes
    function positionSidenote(reference, sidenote) {
        const refRect = reference.getBoundingClientRect();
        const articleRect = article.getBoundingClientRect();
        
        // Calculate top position relative to the article
        const top = refRect.top - articleRect.top;
        sidenote.style.top = `${top}px`;
    }
    
    // Function to check for collisions between sidenotes
    function checkCollisions() {
        const sidenotes = document.querySelectorAll('.sidenote');
        
        // Reset positions
        sidenotes.forEach((sidenote, index) => {
            const ref = document.getElementById(`fnref${sidenote.id.replace('sn', '')}`);
            if (ref) {
                positionSidenote(ref, sidenote);
            }
        });
        
        // Check for collisions
        for (let i = 0; i < sidenotes.length - 1; i++) {
            const current = sidenotes[i];
            const next = sidenotes[i + 1];
            
            const currentRect = current.getBoundingClientRect();
            const nextRect = next.getBoundingClientRect();
            
            // If there's a collision, move the next sidenote down
            if (currentRect.bottom > nextRect.top) {
                const overlap = currentRect.bottom - nextRect.top + 10; // 10px extra space
                const currentTop = parseInt(next.style.top, 10);
                next.style.top = `${currentTop + overlap}px`;
            }
        }
    }
    
    // Function to toggle sidenotes based on screen width
    function toggleSidenotes(e) {
        if (e.matches) {
            // Show sidenotes, hide footnotes
            sidenotesContainer.style.display = 'block';
            footnotes.style.display = 'none';
            
            // Check for collisions after a short delay to ensure layout is complete
            setTimeout(checkCollisions, 100);
        } else {
            // Hide sidenotes, show footnotes
            sidenotesContainer.style.display = 'none';
            footnotes.style.display = 'block';
        }
    }
    
    // Initial check
    toggleSidenotes(mediaQuery);
    
    // Listen for changes
    mediaQuery.addListener(toggleSidenotes);
    
    // Recalculate positions on window resize
    window.addEventListener('resize', function() {
        if (mediaQuery.matches) {
            checkCollisions();
        }
    });
})();

