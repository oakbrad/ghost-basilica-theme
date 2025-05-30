/**
 * Spreadsheet Embed - Automatically transforms Google Spreadsheet bookmark cards into embedded timelines
 * 
 * This script detects Google Spreadsheet bookmark cards in the post content and transforms them
 * into embedded timelines using TimelineJS.
 */

(function() {
    // Function to initialize TimelineJS for a specific container
    function initializeTimeline(container, spreadsheetUrl) {
        // Create a unique ID for the timeline container
        const timelineId = 'timeline-' + Math.random().toString(36).substr(2, 9);
        
        // Create the timeline container
        const timelineContainer = document.createElement('div');
        timelineContainer.id = timelineId;
        timelineContainer.className = 'embedded-timeline';
        
        // Replace the container with the timeline container
        container.parentNode.replaceChild(timelineContainer, container);
        
        // Initialize TimelineJS
        if (window.TL && window.TL.Timeline) {
            new TL.Timeline(timelineId, spreadsheetUrl, {
                timenav_position: "bottom",
                initial_zoom: 4,
                scale_factor: 2,
                zoom_sequence: [1,2,3],
                start_at_slide: 0,
                use_bc: false,
                hash_bookmark: false,
                lang: "/assets/timelinejs/timeline-locale.json",
            });
        } else {
            console.error('TimelineJS not loaded');
            timelineContainer.innerHTML = '<p>Error: TimelineJS library not loaded.</p>';
            
            // Try to load TimelineJS
            loadTimelineJS(function() {
                if (window.TL && window.TL.Timeline) {
                    new TL.Timeline(timelineId, spreadsheetUrl, {
                        timenav_position: "bottom",
                        initial_zoom: 4,
                        scale_factor: 2,
                        zoom_sequence: [1,2,3],
                        start_at_slide: 0,
                        use_bc: false,
                        hash_bookmark: false,
                        lang: "/assets/timelinejs/timeline-locale.json",
                    });
                }
            });
        }
    }
    
    // Function to load TimelineJS
    function loadTimelineJS(callback) {
        // Load TimelineJS CSS
        const timelineCSS = document.createElement('link');
        timelineCSS.rel = 'stylesheet';
        timelineCSS.href = '/assets/timelinejs/css/timeline.css';
        document.head.appendChild(timelineCSS);
        
        // Load TimelineJS JavaScript
        const timelineJS = document.createElement('script');
        timelineJS.src = '/assets/timelinejs/js/timeline.js';
        timelineJS.onload = callback;
        document.head.appendChild(timelineJS);
    }
    
    // Function to extract spreadsheet ID from Google Spreadsheet URL
    function extractSpreadsheetId(url) {
        // Match Google Spreadsheet URLs
        // This regex handles both the standard and the /d/ format
        const regex = /https:\/\/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/;
        const match = url.match(regex);
        
        if (match && match[1]) {
            return match[1];
        }
        
        return null;
    }
    
    // Function to process all Google Spreadsheet bookmark cards in the content
    function processSpreadsheetBookmarks() {
        // Look for bookmark cards with Google Spreadsheet links
        const bookmarkCards = document.querySelectorAll('.kg-bookmark-card');
        
        bookmarkCards.forEach(card => {
            const link = card.querySelector('.kg-bookmark-container');
            if (!link || !link.href) return;
            
            // Check if it's a Google Spreadsheet link
            if (link.href.includes('docs.google.com/spreadsheets/d/')) {
                const spreadsheetId = extractSpreadsheetId(link.href);
                
                if (spreadsheetId) {
                    // Create the spreadsheet URL for TimelineJS
                    const spreadsheetUrl = 'https://docs.google.com/spreadsheets/d/' + spreadsheetId + '/pubhtml';
                    
                    // Initialize the timeline
                    initializeTimeline(card, spreadsheetUrl);
                }
            }
        });
    }
    
    // Run when the DOM is fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        // Check if we're on a post or page
        const isPostOrPage = document.querySelector('.post') || document.querySelector('.page');
        
        if (isPostOrPage) {
            // If TimelineJS is already loaded, process the bookmarks
            if (window.TL && window.TL.Timeline) {
                processSpreadsheetBookmarks();
            } else {
                // Otherwise, load TimelineJS first
                loadTimelineJS(processSpreadsheetBookmarks);
            }
        }
    });
})();
