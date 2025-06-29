// Table scroll effects
document.addEventListener('DOMContentLoaded', function() {
    // Find the table container and content
    const contentSection = document.querySelector('.gh-content');
    const tables = contentSection ? contentSection.querySelectorAll('table') : [];
    
    // Only proceed if we have tables
    if (tables.length === 0) return;
    
    // Get the first table (main table for the page)
    const table = tables[0];
    
    // Create background sigil element
    const backgroundSigil = document.createElement('div');
    backgroundSigil.className = 'background-sigil';
    backgroundSigil.innerHTML = document.querySelector('.partials-sigil-template').innerHTML;
    document.body.appendChild(backgroundSigil);
    
    // Create progress indicator
    const progressIndicator = document.createElement('div');
    progressIndicator.className = 'table-scroll-progress';
    document.body.appendChild(progressIndicator);
    
    // Variables to track scroll state
    let lastScrollTop = 0;
    let scrollDirection = 'down';
    let ticking = false;
    let tableTop = table.getBoundingClientRect().top + window.pageYOffset;
    let tableBottom = tableTop + table.offsetHeight;
    let windowHeight = window.innerHeight;
    let documentHeight = Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.clientHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight
    );
    
    // Calculate if the table is long enough to warrant sigil effect
    // We'll consider "long" as more than 2x the viewport height
    const isLongTable = table.offsetHeight > (windowHeight * 2);
    
    // Calculate if the table is long enough for progress indicator
    // We'll show progress indicator for tables with height > viewport
    const showProgressIndicator = table.offsetHeight > windowHeight;
    
    // Function to handle scroll effects
    function handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Determine scroll direction
        scrollDirection = scrollTop > lastScrollTop ? 'down' : 'up';
        lastScrollTop = scrollTop;
        
        // Calculate scroll position relative to table
        const scrollPosition = scrollTop + windowHeight;
        const tableVisibleStart = Math.max(0, scrollTop - tableTop);
        const tableVisibleEnd = Math.min(table.offsetHeight, scrollPosition - tableTop);
        
        // Calculate scroll percentage through the table
        const tableScrollPercentage = Math.min(100, Math.max(0, 
            ((scrollTop - tableTop) / (tableBottom - tableTop - windowHeight)) * 100
        ));
        
        // Update progress indicator for tables with height > viewport
        // Only show when table is in view
        if (showProgressIndicator && scrollTop < tableBottom && scrollTop + windowHeight > tableTop) {
            progressIndicator.style.width = `${tableScrollPercentage}%`;
        } else {
            progressIndicator.style.width = '0%';
        }
        
        // Only show sigil effect if the table is long enough
        if (isLongTable) {
            // Show background sigil when scrolled past first viewport of table
            // AND hide it when scrolled past the table
            if (scrollTop > tableTop + (windowHeight / 2) && scrollTop < tableBottom) {
                backgroundSigil.classList.add('visible');
                
                // More dramatic rotation based on scroll position
                const rotation = (tableScrollPercentage / 100) * 80 - 20; // -20 to +60 degrees
                backgroundSigil.querySelector('svg').style.transform = 
                    `scale(1.2) rotate(${rotation}deg)`;
            } else {
                backgroundSigil.classList.remove('visible');
            }
        }
        
        ticking = false;
    }
    
    // Listen for scroll events with requestAnimationFrame for performance
    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(handleScroll);
            ticking = true;
        }
    });
    
    // Update dimensions on window resize
    window.addEventListener('resize', function() {
        windowHeight = window.innerHeight;
        tableTop = table.getBoundingClientRect().top + window.pageYOffset;
        tableBottom = tableTop + table.offsetHeight;
        documentHeight = Math.max(
            document.body.scrollHeight,
            document.body.offsetHeight,
            document.documentElement.clientHeight,
            document.documentElement.scrollHeight,
            document.documentElement.offsetHeight
        );
        
        // Recalculate if the table is long enough for effects
        isLongTable = table.offsetHeight > (windowHeight * 2);
        showProgressIndicator = table.offsetHeight > windowHeight;
    });
    
    // Initial call to set up the state
    handleScroll();
});
