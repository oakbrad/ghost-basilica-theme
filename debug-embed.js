// Debug script to help understand how Ghost embeds Google Sheets
document.addEventListener("DOMContentLoaded", function() {
    console.log("Debug script loaded");
    
    // Log the entire post content for inspection
    const postContent = document.querySelector('.post-content');
    if (postContent) {
        console.log("Post content found:", postContent);
        console.log("Post content HTML:", postContent.innerHTML);
        
        // Look for various potential embed formats
        
        // 1. Check for iframes
        const iframes = postContent.querySelectorAll('iframe');
        console.log("Iframes found:", iframes.length);
        iframes.forEach((iframe, index) => {
            console.log(`Iframe ${index} src:`, iframe.getAttribute('src'));
        });
        
        // 2. Check for figure elements (Ghost often wraps embeds in figures)
        const figures = postContent.querySelectorAll('figure');
        console.log("Figures found:", figures.length);
        figures.forEach((figure, index) => {
            console.log(`Figure ${index} class:`, figure.className);
            console.log(`Figure ${index} HTML:`, figure.innerHTML);
        });
        
        // 3. Check for Ghost card elements
        const cards = postContent.querySelectorAll('.kg-card');
        console.log("Ghost cards found:", cards.length);
        cards.forEach((card, index) => {
            console.log(`Card ${index} class:`, card.className);
            console.log(`Card ${index} HTML:`, card.innerHTML);
        });
        
        // 4. Check for embed cards specifically
        const embedCards = postContent.querySelectorAll('.kg-embed-card');
        console.log("Embed cards found:", embedCards.length);
        embedCards.forEach((card, index) => {
            console.log(`Embed card ${index} HTML:`, card.innerHTML);
            
            // Check for iframes within embed cards
            const cardIframes = card.querySelectorAll('iframe');
            cardIframes.forEach((iframe, i) => {
                console.log(`Embed card ${index} iframe ${i} src:`, iframe.getAttribute('src'));
            });
        });
        
        // 5. Look for any elements with Google Sheets URL in attributes
        const allElements = postContent.querySelectorAll('*');
        console.log("Searching all elements for Google Sheets references...");
        allElements.forEach((el, index) => {
            const attributes = el.attributes;
            for (let i = 0; i < attributes.length; i++) {
                const attr = attributes[i];
                if (attr.value.includes('docs.google.com/spreadsheets')) {
                    console.log(`Element with Google Sheets reference:`, el);
                    console.log(`Attribute: ${attr.name}, Value: ${attr.value}`);
                }
            }
            
            // Also check for text content with Google Sheets URLs
            if (el.textContent && el.textContent.includes('docs.google.com/spreadsheets')) {
                console.log(`Element with Google Sheets in text:`, el);
                console.log(`Text content: ${el.textContent}`);
            }
        });
    } else {
        console.log("Post content not found");
    }
    
    // Check if the timeline element exists
    const timelineEmbed = document.getElementById('timeline-embed');
    if (timelineEmbed) {
        console.log("Timeline embed element found");
    } else {
        console.log("Timeline embed element not found");
    }
});

