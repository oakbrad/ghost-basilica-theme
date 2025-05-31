/**
 * sidenote.js - Convert footnotes to sidenotes in Ghost themes
 * 
 * This script looks for footnotes in a Ghost post and converts them to sidenotes
 * that appear in the margin of the page when there's enough horizontal space.
 * At smaller screen sizes, it falls back to the default footnote behavior.
 * 
 * Based on Molly White's implementation for Citation Needed.
 */

function getAnchorParentContainer(anchor) {
    let el = anchor;
    while (el.parentNode && !el.parentNode.classList.contains("gh-content")) {
        el = el.parentNode;
    }
    return el;
}

function insertSidenotes() {
    const articleContent = document.querySelector("article .gh-content");
    if (!articleContent) return;

    for (const child of articleContent.children) {
        if (
            child.classList.contains("gh-notes-wrapper") ||
            child.classList.contains("footnotes")
        ) {
            // Don't add sidenotes for refs used within sidenotes
            continue;
        }
        
        const anchors = child.querySelectorAll(".footnote-ref a");
        if (anchors.length) {
            // Extra wrapper helps with initial positioning
            const sidenoteContainer = document.createElement("div");
            sidenoteContainer.setAttribute("class", "gh-notes-wrapper");
            
            for (const anchor of anchors) {
                const id = anchor.id || anchor.getAttribute("href").substring(1);
                const contentId = id.replace("fnref", "fn");
                const content = document.getElementById(contentId);
                
                if (!content) continue;
                
                const sidenoteWrapper = document.createElement("aside");
                sidenoteWrapper.setAttribute("id", id.replace("fnref", "sidenote"));
                sidenoteWrapper.setAttribute("class", "gh-note");
                sidenoteWrapper.setAttribute("role", "note");
                sidenoteWrapper.setAttribute("data-anchor-id", id);

                // Remove "jump back to text" link, since it'll be right next to the anchor
                sidenoteWrapper.innerHTML = content.innerHTML;
                const links = sidenoteWrapper.querySelectorAll("a");
                for (const link of links) {
                    if (link.textContent === "↩" || link.getAttribute("href").startsWith("#fnref")) {
                        link.remove();
                    }
                }

                // Add sidenote to DOM
                sidenoteWrapper.insertAdjacentHTML("afterbegin", `${anchor.textContent}. `);
                sidenoteContainer.insertAdjacentElement("beforeend", sidenoteWrapper);
            }
            
            child.insertAdjacentElement("afterend", sidenoteContainer);
        }
    }
}

function positionSidenotes() {
    const sidenotes = document.querySelectorAll("aside.gh-note");
    for (let i = 0; i < sidenotes.length; i++) {
        const sidenote = sidenotes[i];
        const anchorId = sidenote.getAttribute("data-anchor-id");
        const anchor = document.querySelector(
            `.gh-content > *:not(.gh-notes-wrapper, .footnotes) #${anchorId}, .gh-content > *:not(.gh-notes-wrapper, .footnotes) a[href="#${anchorId.replace("fnref", "fn")}"]`
        );
        
        if (!anchor) continue;
        
        const anchorParent = getAnchorParentContainer(anchor);

        const anchorPosition = anchor.getBoundingClientRect().top;
        const anchorParentPosition = anchorParent.getBoundingClientRect().top;

        // Bump down sidenote if it would overlap with the previous one
        let newPosition = anchorPosition;
        if (i > 0) {
            const prevSideNote = sidenotes[i - 1];
            const prevSidenoteEnd = prevSideNote.getBoundingClientRect().bottom;
            if (anchorPosition < prevSidenoteEnd) {
                newPosition = prevSidenoteEnd;
            }
        }

        sidenote.style.top = `${Math.round(newPosition - anchorParentPosition)}px`;
    }
}

function showSidenotes() {
    const article = document.querySelector(".article");
    if (article) {
        article.classList.remove("hide-sidenotes");
    }
}

function hideSidenotes() {
    const article = document.querySelector(".article");
    if (article) {
        article.classList.add("hide-sidenotes");
    }
}

function removeSidenotes() {
    document.querySelectorAll("div.gh-notes-wrapper").forEach((e) => e.remove());
}

function insertAndPositionSidenotes() {
    const mediaQuery = window.matchMedia("(min-width: 1349px)");
    if (mediaQuery.matches) {
        insertSidenotes();
        positionSidenotes();
        // Janky, but this will help with issue where sidenotes don't repaint during for loop
        setTimeout(() => positionSidenotes(), 200);
    }
}

function onResize() {
    const sidenotesInDom = Boolean(document.querySelector("div.gh-notes-wrapper"));
    const mediaQuery = window.matchMedia("(min-width: 1349px)");
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

function onAnchorClick(evt) {
    const mediaQuery = window.matchMedia("(min-width: 1349px)");
    dehilightNotes();
    if (mediaQuery.matches) {
        const anchorId = evt.target.id || evt.target.getAttribute("href").substring(1);
        const sidenote = document.getElementById(anchorId.replace("fnref", "sidenote"));
        if (sidenote) {
            evt.preventDefault();
            evt.stopPropagation();
            evt.target.classList.add("active-sidenote");
            sidenote.classList.add("active-sidenote");
        }
    }
}

function dehilightNotes() {
    const highlighted = document.querySelectorAll(".active-sidenote");
    for (let highlight of highlighted) {
        highlight.classList.remove("active-sidenote");
    }
}

// Debounce function to limit how often a function is called
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

// Initialize sidenotes
function initSidenotes() {
    if (document.body.classList.contains("post-template")) {
        window.addEventListener("resize", debounce(onResize, 100));
        window.addEventListener("beforeprint", hideSidenotes);
        window.addEventListener("afterprint", showSidenotes);
        
        // Add click handlers to footnote references
        const anchors = document.querySelectorAll(".footnote-ref a");
        for (const anchor of anchors) {
            anchor.addEventListener("click", onAnchorClick);
        }
        
        // Hide sidenotes when clicking elsewhere
        document.addEventListener("click", (evt) => {
            if (evt.target.nodeName !== "A") {
                dehilightNotes();
            }
        });
        
        insertAndPositionSidenotes();
    }
}

// Run when DOM is fully loaded
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSidenotes);
} else {
    initSidenotes();
}

