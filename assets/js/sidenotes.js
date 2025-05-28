/**
 * sidenotes.js - Transform footnotes into sidenotes for Ghost themes
 * Based on Mark Llobrera's implementation (https://github.com/dirtystylus/eleventy-test/blob/master/js/sidenotes.js)
 * and inspired by jQuery.sidenotes (https://github.com/acdlite/jquery.sidenotes)
 */

// Configuration
var articleSelector = '.gh-content';
var notesWrapperClass = 'sidenote-wrapper';
var notesWrapperSelector = '.sidenote-wrapper';
var footnoteContainerSelector = '.footnotes';
var footnoteSelector = 'li';

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
  var article = document.querySelector(articleSelector);
  if (article) {
    article.classList.remove("hide-sidenotes");
    console.log("Showing sidenotes");
  }
}

// Hide sidenotes
function hideSidenotes() {
  var article = document.querySelector(articleSelector);
  if (article) {
    article.classList.add("hide-sidenotes");
    console.log("Hiding sidenotes");
  }
}

// Show endnotes (regular footnotes)
function showEndnotes() {
  var article = document.querySelector(articleSelector);
  if (article) {
    article.classList.remove("hide-endnotes");
    console.log("Showing endnotes");
  }
}

// Hide endnotes (regular footnotes)
function hideEndnotes() {
  var article = document.querySelector(articleSelector);
  if (article) {
    article.classList.add("hide-endnotes");
    console.log("Hiding endnotes");
  }
}

// Insert sidenotes into the DOM
function insertSidenotes() {
  console.log("Inserting sidenotes...");
  var articleContent = document.querySelector(articleSelector);
  if (!articleContent) {
    console.log("No article content found");
    return;
  }
  
  var footnoteContainer = articleContent.querySelector(footnoteContainerSelector);
  if (!footnoteContainer) {
    console.log("No footnote container found");
    return;
  }
  
  var footnotes = footnoteContainer.querySelectorAll(footnoteSelector);
  if (!footnotes.length) {
    console.log("No footnotes found");
    return;
  }
  
  console.log("Found " + footnotes.length + " footnotes");
  
  // Process each paragraph or element in the article
  for (var i = 0; i < articleContent.children.length; i++) {
    var child = articleContent.children[i];
    if (child.classList.contains(notesWrapperClass) || child === footnoteContainer) {
      continue;
    }
    
    // Find footnote references in this element
    var anchors = child.querySelectorAll('sup[id^="fnref"] a');
    if (anchors.length) {
      console.log("Found " + anchors.length + " footnote references in element");
      var sidenoteContainer = document.createElement("div");
      sidenoteContainer.setAttribute("class", notesWrapperClass);
      
      for (var j = 0; j < anchors.length; j++) {
        var anchor = anchors[j];
        var href = anchor.getAttribute('href');
        if (!href || !href.startsWith('#fn:')) continue;
        
        var id = href.substring(1); // Remove the # from the href
        var footnoteId = id;
        var footnote = document.getElementById(footnoteId);
        
        if (!footnote) {
          console.log("No footnote found for ID: " + footnoteId);
          continue;
        }
        
        var sidenoteWrapper = document.createElement("aside");
        sidenoteWrapper.setAttribute("id", id.replace("fn:", "sn:"));
        sidenoteWrapper.setAttribute("class", "sidenote");
        sidenoteWrapper.setAttribute("role", "note");
        sidenoteWrapper.setAttribute("data-ref-id", anchor.parentNode.id);
        
        // Clone the footnote content
        sidenoteWrapper.innerHTML = footnote.innerHTML;
        
        // Remove "jump back to text" link, since it'll be right next to the anchor
        var backLinks = sidenoteWrapper.querySelectorAll("a[href^='#fnref']");
        for (var k = 0; k < backLinks.length; k++) {
          backLinks[k].remove();
        }
        
        // Add the footnote number at the beginning of the sidenote
        sidenoteWrapper.insertAdjacentHTML("afterbegin", '<div class="sidenote-number">' + anchor.textContent + '</div>');
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
  var sidenotes = document.querySelectorAll("aside.sidenote");
  console.log("Found " + sidenotes.length + " sidenotes to position");
  
  for (var i = 0; i < sidenotes.length; i++) {
    var sidenote = sidenotes[i];
    var refId = sidenote.getAttribute("data-ref-id");
    var reference = document.getElementById(refId);
    
    if (!reference) {
      console.log("No reference found for ID: " + refId);
      continue;
    }
    
    var referenceParent = reference.parentNode;
    var referencePosition = reference.getBoundingClientRect().top;
    var referenceParentPosition = referenceParent.getBoundingClientRect().top;
    
    // Bump down sidenote if it would overlap with the previous one
    var newPosition = referencePosition;
    if (i > 0) {
      var prevSideNote = sidenotes[i - 1];
      var prevSidenoteEnd = prevSideNote.getBoundingClientRect().bottom;
      if (referencePosition < prevSidenoteEnd) {
        newPosition = prevSidenoteEnd + 20;
      }
    }
    
    sidenote.style.top = Math.round(newPosition - referenceParentPosition) + "px";
    console.log("Positioned sidenote " + (i+1) + " at " + sidenote.style.top);
  }
}

// Insert and position sidenotes
function insertAndPositionSidenotes() {
  console.log("Checking if we should insert sidenotes...");
  var mediaQuery = window.matchMedia("(min-width: 1200px)");
  if (mediaQuery.matches) {
    console.log("Screen is wide enough, inserting sidenotes");
    insertSidenotes();
    positionSidenotes();
    hideEndnotes();
    showSidenotes();
    // Reposition after a short delay to ensure proper layout
    setTimeout(function() {
      positionSidenotes();
    }, 200);
  } else {
    console.log("Screen is not wide enough for sidenotes");
    showEndnotes();
  }
}

// Handle window resize
function onResize() {
  var sidenotesInDom = Boolean(document.querySelector(notesWrapperSelector));
  console.log("Resize event, sidenotes in DOM: " + sidenotesInDom);
  var mediaQuery = window.matchMedia("(min-width: 1200px)");
  
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
    hideSidenotes();
    showEndnotes();
  }
}

// Handle clicking on a footnote reference
function onAnchorClick(evt) {
  var mediaQuery = window.matchMedia("(min-width: 1200px)");
  dehighlightNotes();
  
  if (mediaQuery.matches) {
    var href = evt.target.getAttribute('href');
    if (href && href.startsWith('#fn:')) {
      var sidenoteId = href.replace('#fn:', '#sn:');
      var sidenote = document.querySelector(sidenoteId);
      
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
  var highlighted = document.querySelectorAll(".active-sidenote");
  for (var i = 0; i < highlighted.length; i++) {
    highlighted[i].classList.remove("active-sidenote");
  }
}

// Initialize sidenotes
function initSidenotes() {
  console.log("Initializing sidenotes...");
  // Only run on post pages that have footnotes
  var articleContent = document.querySelector(articleSelector);
  var footnoteContainer = articleContent ? articleContent.querySelector(footnoteContainerSelector) : null;
  
  if (articleContent && footnoteContainer) {
    console.log("Found article content and footnote container");
    
    // Make sure footnotes are visible by default
    showEndnotes();
    
    // Set up event listeners
    window.addEventListener("resize", debounce(onResize, 100));
    
    // Add click handlers to footnote references
    var anchors = document.querySelectorAll('sup[id^="fnref"] a');
    console.log("Found " + anchors.length + " footnote reference anchors");
    for (var i = 0; i < anchors.length; i++) {
      anchors[i].addEventListener("click", onAnchorClick);
    }
    
    // Handle clicks outside of sidenotes to dehighlight
    document.addEventListener("click", function(evt) {
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
