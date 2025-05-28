/**
 * sidenotes.js - Transform footnotes into sidenotes for Ghost themes
 * Based on Mark Llobrera's implementation (https://github.com/dirtystylus/eleventy-test/blob/master/js/sidenotes.js)
 * and inspired by jQuery.sidenotes (https://github.com/acdlite/jquery.sidenotes)
 */

// Configuration
const articleSelector = '.gh-content';
const notesWrapperClass = 'sidenote-wrapper';
const notesWrapperSelector = '.sidenote-wrapper';
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
  console.log("Inserting sidenotes...");
  const articleContent = document.querySelector(articleSelector);
  if (!articleContent) {
    console.log("No article content found");
    return;
  }
  
  const footnoteContainer = articleContent.querySelector(footnoteContainerSelector);
  if (!footnoteContainer) {
    console.log("No footnote container found");
    return;
  }
  
  const footnotes = footnoteContainer.querySelectorAll(footnoteSelector);
  if (!footnotes.length) {
    console.log("No footnotes found");
    return;
  }
  
  console.log(`Found ${footnotes.length} footnotes`);
  
  // Process each paragraph or element in the article
  for (const child of articleContent.children) {
    if (child.classList.contains(notesWrapperClass) || child === footnoteContainer) {
      continue;
    }
    
    // Find footnote references in this element
    const anchors = child.querySelectorAll('sup[id^="fnref"] a');
    if (anchors.length) {
      console.log(`Found ${anchors.length} footnote references in element`);
      const sidenoteContainer = document.createElement("div");
      sidenoteContainer.setAttribute("class", notesWrapperClass);
      
      for (const anchor of anchors) {
        const href = anchor.getAttribute('href');
        if (!href || !href.startsWith('#fn:')) continue;
        
        const id = href.substring(1); // Remove the # from the href
        const footnoteId = id;
        const footnote = document.getElementById(footnoteId);
        
        if (!footnote) {
          console.log(`No footnote found for ID: ${footnoteId}`);
          continue;
        }
        
        const sidenoteWrapper = document.createElement("aside");
        sidenoteWrapper.setAttribute("id", id.replace("fn:", "sn:"));
        sidenoteWrapper.setAttribute("class", "sidenote");
        sidenoteWrapper.setAttribute("role", "note");
        sidenoteWrapper.setAttribute("data-ref-id", anchor.parentNode.id);
        
        // Clone the footnote content
        sidenoteWrapper.innerHTML = footnote.innerHTML;
        
        // Remove "jump back to text" link, since it'll be right next to the anchor
        const backLinks = sidenoteWrapper.querySelectorAll("a[href^='#fnref']");
        for (const link of backLinks) {
          link.remove();
        }
        
        // Add the footnote number at the beginning of the sidenote
        sidenoteWrapper.insertAdjacentHTML("afterbegin", `<div class='sidenote-number'>${anchor.textContent}</div>`);
        sidenoteContainer.insertAdjacentElement("beforeend", sidenoteWrapper);
      }
      
      if (sidenoteContainer.children.length > 0) {
        child.insertAdjacentElement("afterend", sidenoteContainer);
      }
    }
  }
}

// Position sidenotes vertically aligned with their references
function positionSidenotes() {
  console.log("Positioning sidenotes...");
  const sidenotes = document.querySelectorAll("aside.sidenote");
  console.log(`Found ${sidenotes.length} sidenotes to position`);
  
  for (let i = 0; i < sidenotes.length; i++) {
    const sidenote = sidenotes[i];
    const refId = sidenote.getAttribute("data-ref-id");
    const reference = document.getElementById(refId);
    
    if (!reference) {
      console.log(`No reference found for ID: ${refId}`);
      continue;
    }
    
    const referenceParent = reference.parentNode;
    const referencePosition = reference.getBoundingClientRect().top;
    const referenceParentPosition = referenceParent.getBoundingClientRect().top;
    
    // Bump down sidenote if it would overlap with the previous one
    let newPosition = referencePosition;
    if (i > 0) {
      const prevSideNote = sidenotes[i - 1];
      const prevSidenoteEnd = prevSideNote.getBoundingClientRect().bottom;
      if (referencePosition < prevSidenoteEnd) {
        newPosition = prevSidenoteEnd + 20;
      }
    }
    
    sidenote.style.top = `${Math.round(newPosition - referenceParentPosition)}px`;
    console.log(`Positioned sidenote ${i+1} at ${sidenote.style.top}`);
  }
}

// Insert and position sidenotes
function insertAndPositionSidenotes() {
  console.log("Checking if we should insert sidenotes...");
  const mediaQuery = window.matchMedia("(min-width: 1200px)");
  if (mediaQuery.matches) {
    console.log("Screen is wide enough, inserting sidenotes");
    insertSidenotes();
    positionSidenotes();
    hideEndnotes();
    // Reposition after a short delay to ensure proper layout
    setTimeout(() => positionSidenotes(), 200);
  } else {
    console.log("Screen is not wide enough for sidenotes");
  }
}

// Handle window resize
function onResize() {
  const sidenotesInDom = Boolean(document.querySelector(notesWrapperSelector));
  console.log(`Resize event, sidenotes in DOM: ${sidenotesInDom}`);
  const mediaQuery = window.matchMedia("(min-width: 1200px)");
  
  if (mediaQuery.matches) {
    console.log("Screen is wide enough for sidenotes");
    if (!sidenotesInDom) {
      insertSidenotes();
    }
    showSidenotes();
    hideEndnotes();
    positionSidenotes();
  } else {
    console.log("Screen is not wide enough for sidenotes");
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
    if (href && href.startsWith('#fn:')) {
      const sidenoteId = href.replace('#fn:', '#sn:');
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
  console.log("Initializing sidenotes...");
  // Only run on post pages that have footnotes
  const articleContent = document.querySelector(articleSelector);
  const footnoteContainer = articleContent?.querySelector(footnoteContainerSelector);
  
  if (articleContent && footnoteContainer) {
    console.log("Found article content and footnote container");
    // Set up event listeners
    window.addEventListener("resize", debounce(onResize, 100));
    
    // Add click handlers to footnote references
    const anchors = document.querySelectorAll('sup[id^="fnref"] a');
    console.log(`Found ${anchors.length} footnote reference anchors`);
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
  } else {
    console.log("No article content or footnote container found");
  }
}

// Run when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM loaded, checking if we should initialize sidenotes");
  // Initialize on all pages that might have footnotes
  initSidenotes();
});
