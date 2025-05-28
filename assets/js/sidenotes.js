/**
 * sidenotes.js - Transform footnotes into sidenotes for Ghost themes
 * Based on Mark Llobrera's implementation (https://github.com/dirtystylus/eleventy-test/blob/master/js/sidenotes.js)
 * and inspired by jQuery.sidenotes (https://github.com/acdlite/jquery.sidenotes)
 */

// Configuration
const articleSelector = '.gh-content';
const notesWrapperClass = 'sidenote-wrapper';
const notesWrapperSelector = '.sidenote-wrapper';
const footnoteRefClass = 'footnote-ref';
const footnoteRefSelector = '.footnote-ref';
const footnoteContainerSelector = '.footnotes';
const footnoteSelector = 'li';

// Debounce function to limit how often a function can be called
function debounce(func, wait, immediate) {
  var timeout;
  return function() {
    var context = this, args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

// Show sidenotes
function showSidenotes() {
  document.querySelector(articleSelector).classList.remove("hide-sidenotes");
}

// Hide sidenotes
function hideSidenotes() {
  document.querySelector(articleSelector).classList.add("hide-sidenotes");
}

// Show endnotes (regular footnotes)
function showEndnotes() {
  document.querySelector(articleSelector).classList.remove("hide-endnotes");
}

// Hide endnotes (regular footnotes)
function hideEndnotes() {
  document.querySelector(articleSelector).classList.add("hide-endnotes");
}

// Insert sidenotes into the DOM
function insertSidenotes() {
  const articleContent = document.querySelector(articleSelector);
  if (!articleContent) return;
  
  const footnoteContainer = articleContent.querySelector(footnoteContainerSelector);
  if (!footnoteContainer) return;
  
  const footnotes = footnoteContainer.querySelectorAll(footnoteSelector);
  if (!footnotes.length) return;
  
  // Process each paragraph or element in the article
  for (const child of articleContent.children) {
    if (child.classList.contains(notesWrapperClass)) {
      continue;
    }
    
    // Find footnote references in this element
    const anchors = child.querySelectorAll('a[href^="#fn"]');
    if (anchors.length) {
      const sidenoteContainer = document.createElement("div");
      sidenoteContainer.setAttribute("class", notesWrapperClass);
      
      for (const anchor of anchors) {
        const id = anchor.getAttribute('href').substring(1); // Remove the # from the href
        const content = document.getElementById(id);
        if (!content) continue;
        
        const sidenoteWrapper = document.createElement("aside");
        sidenoteWrapper.setAttribute("id", id.replace("fn", "sn"));
        sidenoteWrapper.setAttribute("class", "sidenote");
        sidenoteWrapper.setAttribute("role", "note");
        sidenoteWrapper.setAttribute("data-anchor-id", anchor.id || "fn-ref-" + id.substring(2));
        
        sidenoteWrapper.innerHTML = content.innerHTML;
        
        // Remove "jump back to text" link, since it'll be right next to the anchor
        const links = sidenoteWrapper.querySelectorAll("a");
        for (const link of links) {
          if (link.textContent === "↩" || link.textContent === "↩︎") {
            link.remove();
          }
        }
        
        // Add the footnote number at the beginning of the sidenote
        sidenoteWrapper.insertAdjacentHTML("afterbegin", `<div class='sidenote-number'>${anchor.textContent}</div>`);
        sidenoteContainer.insertAdjacentElement("beforeend", sidenoteWrapper);
      }
      
      child.insertAdjacentElement("afterend", sidenoteContainer);
    }
  }
}

// Position sidenotes vertically aligned with their references
function positionSidenotes() {
  const sidenotes = document.querySelectorAll("aside.sidenote");
  for (let i = 0; i < sidenotes.length; i++) {
    const sidenote = sidenotes[i];
    const anchorId = sidenote.getAttribute("data-anchor-id");
    let anchor;
    
    // Try to find the anchor by ID first
    if (anchorId) {
      anchor = document.getElementById(anchorId);
    }
    
    // If no anchor found by ID, try to find by href
    if (!anchor) {
      const footnoteId = sidenote.id.replace("sn", "fn");
      anchor = document.querySelector(`a[href="#${footnoteId}"]`);
    }
    
    if (!anchor) continue;
    
    const anchorParent = anchor.parentNode;
    const anchorPosition = anchor.getBoundingClientRect().top;
    const anchorParentPosition = anchorParent.getBoundingClientRect().top;
    
    // Bump down sidenote if it would overlap with the previous one
    let newPosition = anchorPosition;
    if (i > 0) {
      const prevSideNote = sidenotes[i - 1];
      const prevSidenoteEnd = prevSideNote.getBoundingClientRect().bottom;
      if (anchorPosition < prevSidenoteEnd) {
        newPosition = prevSidenoteEnd + 20;
      }
    }
    
    sidenote.style.top = `${Math.round(newPosition - anchorParentPosition)}px`;
  }
}

// Insert and position sidenotes
function insertAndPositionSidenotes() {
  const mediaQuery = window.matchMedia("(min-width: 1200px)");
  if (mediaQuery.matches) {
    insertSidenotes();
    positionSidenotes();
    hideEndnotes();
    // Reposition after a short delay to ensure proper layout
    setTimeout(() => positionSidenotes(), 200);
  }
}

// Handle window resize
function onResize() {
  const sidenotesInDom = Boolean(document.querySelector(notesWrapperSelector));
  const mediaQuery = window.matchMedia("(min-width: 1200px)");
  
  if (mediaQuery.matches) {
    if (!sidenotesInDom) {
      insertSidenotes();
    }
    showSidenotes();
    hideEndnotes();
    positionSidenotes();
  } else {
    if (sidenotesInDom) {
      hideSidenotes();
      showEndnotes();
    }
  }
}

// Handle clicking on a footnote reference
function onAnchorClick(evt) {
  const mediaQuery = window.matchMedia("(min-width: 1200px)");
  dehighlightNotes();
  
  if (mediaQuery.matches) {
    const href = evt.target.getAttribute('href');
    if (href && href.startsWith('#fn')) {
      const sidenoteId = href.replace('#fn', '#sn');
      const sidenote = document.querySelector(sidenoteId);
      
      if (sidenote) {
        evt.preventDefault();
        evt.stopPropagation();
        evt.target.classList.add("active-sidenote");
        sidenote.classList.add("active-sidenote");
      }
    }
  }
}

// Remove highlighting from all notes
function dehighlightNotes() {
  const highlighted = document.querySelectorAll(".active-sidenote");
  for (let highlight of highlighted) {
    highlight.classList.remove("active-sidenote");
  }
}

// Initialize sidenotes
function initSidenotes() {
  // Only run on post pages that have footnotes
  const articleContent = document.querySelector(articleSelector);
  const footnoteContainer = articleContent?.querySelector(footnoteContainerSelector);
  
  if (articleContent && footnoteContainer) {
    // Set up event listeners
    window.addEventListener("resize", debounce(onResize, 100));
    
    // Add click handlers to footnote references
    const anchors = document.querySelectorAll('a[href^="#fn"]');
    for (const anchor of anchors) {
      anchor.addEventListener("click", onAnchorClick);
    }
    
    // Handle clicks outside of sidenotes to dehighlight
    document.addEventListener("click", (evt) => {
      if (evt.target.nodeName !== "A") {
        dehighlightNotes();
      }
    });
    
    // Initial setup
    insertAndPositionSidenotes();
  }
}

// Run when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Only initialize on post pages
  if (document.body.classList.contains('post-template')) {
    initSidenotes();
  }
});

