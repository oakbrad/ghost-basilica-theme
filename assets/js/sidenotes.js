/**
 * Sidenotes.js - Transform footnotes into sidenotes
 * Based on Molly White's implementation for Citation Needed
 */

(function() {
    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', function() {
        // Only run on post pages
        if (document.body.classList.contains('post-template')) {
            initSidenotes();
        }
    });

    function initSidenotes() {
        // Add event listeners
        window.addEventListener('resize', debounce(onResize, 100));
        window.addEventListener('beforeprint', hideSidenotes);
        window.addEventListener('afterprint', showSidenotes);
        
        // Add click handlers to footnote references
        var footnoteRefs = document.querySelectorAll('sup[id^="fnref"] a');
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
        insertAndPositionSidenotes();
    }

    function getAnchorParentContainer(anchor) {
        var el = anchor;
        while (el.parentNode && !el.parentNode.classList.contains('gh-content')) {
            el = el.parentNode;
        }
        return el;
    }

    function insertSidenotes() {
        var articleContent = document.querySelector('.gh-content');
        if (!articleContent) return;
        
        for (var i = 0; i < articleContent.children.length; i++) {
            var child = articleContent.children[i];
            
            // Skip footnotes section and existing sidenote wrappers
            if (child.classList.contains('sidenote-wrapper') || 
                child.classList.contains('footnotes')) {
                continue;
            }
            
            // Find footnote references in this element
            var footnoteRefs = child.querySelectorAll('sup[id^="fnref"] a');
            if (footnoteRefs.length) {
                // Create sidenote container
                var sidenoteContainer = document.createElement('div');
                sidenoteContainer.setAttribute('class', 'sidenote-wrapper');
                
                // Process each footnote reference
                for (var j = 0; j < footnoteRefs.length; j++) {
                    var footnoteRef = footnoteRefs[j];
                    var refId = footnoteRef.getAttribute('href').replace('#', '');
                    var footnote = document.getElementById(refId);
                    
                    if (footnote) {
                        // Create sidenote element
                        var sidenoteEl = document.createElement('aside');
                        sidenoteEl.setAttribute('id', 'sidenote-' + refId);
                        sidenoteEl.setAttribute('class', 'sidenote');
                        sidenoteEl.setAttribute('role', 'note');
                        sidenoteEl.setAttribute('data-ref-id', footnoteRef.parentNode.id);
                        
                        // Get footnote content (excluding the backref)
                        var footnoteContent = footnote.cloneNode(true);
                        var backref = footnoteContent.querySelector('.footnote-backref');
                        if (backref) backref.remove();
                        
                        // Add footnote number and content
                        sidenoteEl.innerHTML = '<span class="sidenote-number">' + 
                                              footnoteRef.textContent + 
                                              '</span>' + 
                                              footnoteContent.innerHTML;
                        
                        // Add to container
                        sidenoteContainer.appendChild(sidenoteEl);
                    }
                }
                
                // Add sidenote container after the current element
                if (sidenoteContainer.children.length > 0) {
                    child.insertAdjacentElement('afterend', sidenoteContainer);
                    i++; // Skip the container we just added
                }
            }
        }
    }

    function positionSidenotes() {
        var sidenotes = document.querySelectorAll('aside.sidenote');
        for (var i = 0; i < sidenotes.length; i++) {
            var sidenote = sidenotes[i];
            var refId = sidenote.getAttribute('data-ref-id');
            var reference = document.getElementById(refId);
            
            if (reference) {
                var referenceParent = getAnchorParentContainer(reference);
                var referencePosition = reference.getBoundingClientRect().top;
                var parentPosition = referenceParent.getBoundingClientRect().top;
                
                // Adjust position if it would overlap with previous sidenote
                var newPosition = referencePosition;
                if (i > 0) {
                    var prevSidenote = sidenotes[i - 1];
                    var prevBottom = prevSidenote.getBoundingClientRect().bottom;
                    if (referencePosition < prevBottom) {
                        newPosition = prevBottom;
                    }
                }
                
                // Set the top position
                sidenote.style.top = Math.round(newPosition - parentPosition) + 'px';
            }
        }
    }

    function showSidenotes() {
        document.body.classList.remove('hide-sidenotes');
    }

    function hideSidenotes() {
        document.body.classList.add('hide-sidenotes');
    }

    function removeSidenotes() {
        var wrappers = document.querySelectorAll('div.sidenote-wrapper');
        for (var i = 0; i < wrappers.length; i++) {
            wrappers[i].remove();
        }
    }

    function insertAndPositionSidenotes() {
        var mediaQuery = window.matchMedia('(min-width: 1200px)');
        if (mediaQuery.matches) {
            insertSidenotes();
            positionSidenotes();
            // Reposition after a short delay to ensure proper layout
            setTimeout(positionSidenotes, 200);
        }
    }

    function redoSidenotes() {
        removeSidenotes();
        insertAndPositionSidenotes();
    }

    function onResize() {
        var sidenotesInDom = document.querySelector('div.sidenote-wrapper') !== null;
        var mediaQuery = window.matchMedia('(min-width: 1200px)');
        
        if (mediaQuery.matches) {
            if (!sidenotesInDom) {
                insertSidenotes();
            }
            showSidenotes();
            positionSidenotes();
        } else {
            if (sidenotesInDom) {
                hideSidenotes();
            }
        }
    }

    function onFootnoteClick(evt) {
        var mediaQuery = window.matchMedia('(min-width: 1200px)');
        dehighlightNotes();
        
        if (mediaQuery.matches) {
            var refId = this.parentNode.id;
            var sidenote = document.getElementById('sidenote-' + this.getAttribute('href').replace('#', ''));
            
            if (sidenote) {
                evt.preventDefault();
                evt.stopPropagation();
                
                // Highlight both the reference and the sidenote
                this.classList.add('active-sidenote');
                sidenote.classList.add('active-sidenote');
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

