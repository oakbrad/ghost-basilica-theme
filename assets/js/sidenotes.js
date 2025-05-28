/**
 * Sidenotes.js - Transform footnotes into sidenotes
 * A direct DOM manipulation approach for Ghost themes
 */

(function() {
    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', function() {
        console.log("Sidenotes.js: DOM content loaded");
        initSidenotes();
    });

    function initSidenotes() {
        // Check if we're on a post or page
        if (!document.querySelector('.post') && !document.querySelector('article')) {
            console.log("Sidenotes.js: Not on a post or page, exiting");
            return;
        }

        // Find the content container
        var contentContainer = findContentContainer();
        if (!contentContainer) {
            console.log("Sidenotes.js: Could not find content container, exiting");
            return;
        }
        console.log("Sidenotes.js: Found content container", contentContainer);

        // Find footnotes section
        var footnotesSection = document.querySelector('.footnotes');
        if (!footnotesSection) {
            console.log("Sidenotes.js: No footnotes section found, exiting");
            return;
        }
        console.log("Sidenotes.js: Found footnotes section", footnotesSection);

        // Find all footnote references
        var footnoteRefs = document.querySelectorAll('sup[id^="fnref"] a');
        if (footnoteRefs.length === 0) {
            console.log("Sidenotes.js: No footnote references found, exiting");
            return;
        }
        console.log("Sidenotes.js: Found " + footnoteRefs.length + " footnote references");

        // Add event listeners
        window.addEventListener('resize', debounce(onResize, 100));
        
        // Add click handlers to footnote references
        for (var i = 0; i < footnoteRefs.length; i++) {
            footnoteRefs[i].addEventListener('click', onFootnoteClick);
        }
        
        // Add click handler to document to remove highlights
        document.addEventListener('click', function(evt) {
            if (evt.target.nodeName !== 'A') {
                dehighlightNotes();
            }
        });
        
        // Initial setup
        processFootnotes(contentContainer, footnotesSection);
    }

    function findContentContainer() {
        // Try different selectors used in Ghost themes
        var selectors = [
            '.gh-content',
            '.post-content',
            '.post-full-content',
            'article .post-content',
            'article .content',
            '.article-content',
            'article'
        ];
        
        for (var i = 0; i < selectors.length; i++) {
            var container = document.querySelector(selectors[i]);
            if (container) {
                return container;
            }
        }
        
        return null;
    }

    function processFootnotes(contentContainer, footnotesSection) {
        var mediaQuery = window.matchMedia('(min-width: 1200px)');
        if (!mediaQuery.matches) {
            console.log("Sidenotes.js: Screen width too small for sidenotes");
            return;
        }
        
        console.log("Sidenotes.js: Processing footnotes");
        
        // Create sidenotes container
        var sidenoteContainer = document.createElement('div');
        sidenoteContainer.setAttribute('class', 'sidenotes-container');
        contentContainer.appendChild(sidenoteContainer);
        
        // Get all footnotes
        var footnotes = footnotesSection.querySelectorAll('li[id^="fn:"]');
        console.log("Sidenotes.js: Found " + footnotes.length + " footnotes");
        
        // Process each footnote
        for (var i = 0; i < footnotes.length; i++) {
            var footnote = footnotes[i];
            var footnoteId = footnote.id;
            var refId = 'fnref:' + footnoteId.split(':')[1];
            var reference = document.getElementById(refId);
            
            if (reference) {
                console.log("Sidenotes.js: Processing footnote " + footnoteId + " with reference " + refId);
                
                // Create sidenote element
                var sidenote = document.createElement('aside');
                sidenote.setAttribute('class', 'sidenote');
                sidenote.setAttribute('id', 'sidenote-' + footnoteId);
                sidenote.setAttribute('data-ref-id', refId);
                
                // Clone footnote content
                var footnoteContent = footnote.cloneNode(true);
                
                // Remove backref
                var backref = footnoteContent.querySelector('.footnote-backref');
                if (backref) {
                    backref.remove();
                }
                
                // Add footnote number
                var refNumber = reference.querySelector('a').textContent;
                sidenote.innerHTML = '<span class="sidenote-number">' + refNumber + '</span>' + footnoteContent.innerHTML;
                
                // Add to container
                sidenoteContainer.appendChild(sidenote);
                
                // Position sidenote
                positionSidenote(sidenote, reference);
            } else {
                console.log("Sidenotes.js: Could not find reference for footnote " + footnoteId);
            }
        }
        
        // Hide footnotes section
        footnotesSection.style.display = 'none';
    }

    function positionSidenote(sidenote, reference) {
        // Get positions
        var refRect = reference.getBoundingClientRect();
        var containerRect = findContentContainer().getBoundingClientRect();
        
        // Calculate top position relative to container
        var topPosition = refRect.top - containerRect.top;
        
        // Set position
        sidenote.style.top = topPosition + 'px';
        console.log("Sidenotes.js: Positioned sidenote at top: " + topPosition + "px");
        
        // Check for overlaps with previous sidenotes
        checkAndFixOverlaps();
    }

    function checkAndFixOverlaps() {
        var sidenotes = document.querySelectorAll('.sidenote');
        
        for (var i = 1; i < sidenotes.length; i++) {
            var currentNote = sidenotes[i];
            var previousNote = sidenotes[i - 1];
            
            var currentTop = parseInt(currentNote.style.top);
            var previousBottom = parseInt(previousNote.style.top) + previousNote.offsetHeight + 10; // 10px buffer
            
            if (currentTop < previousBottom) {
                currentNote.style.top = previousBottom + 'px';
                console.log("Sidenotes.js: Fixed overlap, moved sidenote to " + previousBottom + "px");
            }
        }
    }

    function onResize() {
        var mediaQuery = window.matchMedia('(min-width: 1200px)');
        var sidenoteContainer = document.querySelector('.sidenotes-container');
        var footnotesSection = document.querySelector('.footnotes');
        
        if (mediaQuery.matches) {
            if (!sidenoteContainer) {
                // Recreate sidenotes if they don't exist
                if (footnotesSection) {
                    processFootnotes(findContentContainer(), footnotesSection);
                }
            } else {
                // Reposition existing sidenotes
                var sidenotes = document.querySelectorAll('.sidenote');
                for (var i = 0; i < sidenotes.length; i++) {
                    var sidenote = sidenotes[i];
                    var refId = sidenote.getAttribute('data-ref-id');
                    var reference = document.getElementById(refId);
                    
                    if (reference) {
                        positionSidenote(sidenote, reference);
                    }
                }
            }
            
            // Hide footnotes section
            if (footnotesSection) {
                footnotesSection.style.display = 'none';
            }
        } else {
            // Show footnotes section on small screens
            if (footnotesSection) {
                footnotesSection.style.display = 'block';
            }
            
            // Hide sidenotes container
            if (sidenoteContainer) {
                sidenoteContainer.style.display = 'none';
            }
        }
    }

    function onFootnoteClick(evt) {
        var mediaQuery = window.matchMedia('(min-width: 1200px)');
        dehighlightNotes();
        
        if (mediaQuery.matches) {
            var refId = this.parentNode.id;
            var footnoteId = this.getAttribute('href').replace('#', '');
            var sidenote = document.getElementById('sidenote-' + footnoteId);
            
            if (sidenote) {
                evt.preventDefault();
                evt.stopPropagation();
                
                // Highlight both the reference and the sidenote
                this.classList.add('active-sidenote');
                sidenote.classList.add('active-sidenote');
                
                // Scroll to sidenote if needed
                sidenote.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }

    function dehighlightNotes() {
        var highlighted = document.querySelectorAll('.active-sidenote');
        for (var i = 0; i < highlighted.length; i++) {
            highlighted[i].classList.remove('active-sidenote');
        }
    }

    // Utility function for debouncing events
    function debounce(func, wait) {
        var timeout;
        return function() {
            var context = this;
            var args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                func.apply(context, args);
            }, wait);
        };
    }
})();

