(function () {
  "use strict";

  // Global handles so we can clear our backup routines on End Session.
  let forceHideInterval;
  let focusCSSObserver;
  let searchLogoObserver;

  // =====================================================================
  // Helper: Expand the video area (remove sidebar spacing)
  // =====================================================================
  function fullyExpandContentArea() {
    const appContainer = document.querySelector("ytd-app");
    if (appContainer) {
      appContainer.style.setProperty("--ytd-guide-width", "0px");
      appContainer.style.setProperty("--ytd-margin-start", "0px");
    }

    const mainContent = document.getElementById("primary");
    if (mainContent) {
      mainContent.style.marginLeft = "0px";
      mainContent.style.maxWidth = "100%";
      mainContent.style.width = "100%";
    }

    const pageManager = document.querySelector("ytd-page-manager");
    if (pageManager) {
      pageManager.style.marginLeft = "0px";
      pageManager.style.width = "100%";
    }

    const wrapper = document.querySelector("ytd-browse, ytd-search");
    if (wrapper) {
      wrapper.style.marginLeft = "0px";
      wrapper.style.maxWidth = "100%";
      wrapper.style.width = "100%";
    }

    const grid = document.querySelector(
      "ytd-rich-grid-renderer, ytd-two-column-browse-results-renderer"
    );
    if (grid) {
      grid.style.marginLeft = "0px";
      grid.style.maxWidth = "100%";
      grid.style.width = "100%";
    }
  }

  // =====================================================================
  // Functions to forcefully hide search bar and sidebar
  // =====================================================================

  // Inject a style block with !important rules that hide target elements.
  function injectFocusCSS() {
    if (document.getElementById("focus-mode-css")) return; // Already injected.
    const style = document.createElement("style");
    style.id = "focus-mode-css";
    style.innerHTML = `
      /* Force hide search bar elements */
      #search-container,
      ytd-searchbox,
      #search,
      button#search-icon-legacy,
      /* Force hide sidebar elements */
      #guide,
      ytd-mini-guide-renderer,
      #guide-button,
      tp-yt-paper-icon-button#guide-button {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  // Set up a MutationObserver on document.head to ensure our CSS isn’t removed.
  function observeFocusCSS() {
    focusCSSObserver = new MutationObserver(() => {
      if (!document.getElementById("focus-mode-css")) {
        injectFocusCSS();
      }
    });
    focusCSSObserver.observe(document.head, { childList: true });
  }

  // Backup: Force inline style updates on our target elements.
  function forceHideElements() {
    const selectors = [
      "#search-container",
      "ytd-searchbox",
      "#search",
      "button#search-icon-legacy",
      "#guide",
      "ytd-mini-guide-renderer",
      "#guide-button",
      "tp-yt-paper-icon-button#guide-button"
    ];
    selectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        el.style.display = "none";
      });
    });
  }

  // Additionally, we have our previous hiding function.
  function hideSearchAndLogo() {
    const searchContainer = document.getElementById("search-container");
    if (searchContainer) searchContainer.style.display = "none";
    const searchBox = document.querySelector("ytd-searchbox");
    if (searchBox) searchBox.style.display = "none";
    const searchInput = document.getElementById("search");
    if (searchInput) searchInput.style.display = "none";
    const searchButton = document.querySelector("button#search-icon-legacy");
    if (searchButton) searchButton.style.display = "none";
    const logoLink = document.querySelector("a#logo");
    if (logoLink) logoLink.style.display = "none";
  }
  function observeSearchAndLogoHiding() {
    searchLogoObserver = new MutationObserver(() => {
      hideSearchAndLogo();
    });
    searchLogoObserver.observe(document.body, { childList: true, subtree: true });
    hideSearchAndLogo();
  }

  // =====================================================================
  // End Focus Mode: Remove our injected CSS, clear observers/intervals, remove storage keys, reload.
  // =====================================================================
  function endFocusMode() {
    // Remove injected style element.
    const injectedCSS = document.getElementById("focus-mode-css");
    if (injectedCSS) {
      injectedCSS.remove();
    }
    // Disconnect observers.
    if (focusCSSObserver) {
      focusCSSObserver.disconnect();
    }
    if (searchLogoObserver) {
      searchLogoObserver.disconnect();
    }
    // Clear the backup inline style interval.
    if (forceHideInterval) {
      clearInterval(forceHideInterval);
    }
    // Remove focus mode keys from storage and clear redirect flags.
    chrome.storage.local.remove(["focusSessionActive", "userGoal"], () => {
      sessionStorage.removeItem("alreadyRedirected");
      sessionStorage.removeItem("redirectedFocusMode");
      // Reload the page so default YouTube appears.
      location.reload();
    });
  }

  // =====================================================================
  // Main Focus Mode Application (homepage redirection, hiding feed, etc.)
  // =====================================================================
  chrome.storage.local.get("userGoal", ({ userGoal }) => {
    if (!userGoal) return;
    const query = encodeURIComponent(userGoal);
    const path = window.location.pathname;

    // Force-hide our key elements while focus mode is active.
    injectFocusCSS();
    observeFocusCSS();
    forceHideInterval = setInterval(forceHideElements, 500);
    observeSearchAndLogoHiding();

    // Homepage handling: if the user is on the homepage, redirect to search results.
    if (path === "/") {
      if (!sessionStorage.getItem("alreadyRedirected")) {
        sessionStorage.setItem("alreadyRedirected", "true");
        window.location.href = `https://www.youtube.com/results?search_query=${query}`;
        return;
      }
      const hideHomepageFeed = () => {
        const selectorsToHide = [
          "#contents",
          "ytd-rich-grid-renderer",
          "ytd-rich-section-renderer",
          "ytd-reel-shelf-renderer",
          "#primary"
        ];
        selectorsToHide.forEach(selector => {
          document.querySelectorAll(selector).forEach(el => {
            el.style.display = "none";
          });
        });
        // Hide sidebars
        const fullSidebar = document.getElementById("guide");
        if (fullSidebar) fullSidebar.style.display = "none";
        const miniSidebar = document.querySelector("ytd-mini-guide-renderer");
        if (miniSidebar) miniSidebar.style.display = "none";
        fullyExpandContentArea();
        // Show a focus banner.
        if (!document.getElementById("focus-banner")) {
          const banner = document.createElement("div");
          banner.id = "focus-banner";
          banner.textContent = `🎯 Focus Mode Active: "${userGoal}" — Homepage feed hidden to keep you focused.`;
          banner.style = `
            color: white;
            font-size: 18px;
            text-align: center;
            margin: 30px auto;
            padding: 12px;
            background: #1f1f1f;
            border-radius: 8px;
            max-width: 95%;
            z-index: 9999;
          `;
          const container = document.querySelector("ytd-browse") || document.body;
          container.prepend(banner);
        }
      };

      const maxDuration = 15000;
      const interval = 300;
      const start = Date.now();
      const homepageObserver = new MutationObserver(hideHomepageFeed);
      homepageObserver.observe(document.body, { childList: true, subtree: true });
      const hardKill = setInterval(() => {
        hideHomepageFeed();
        if (Date.now() - start > maxDuration) clearInterval(hardKill);
      }, interval);
      hideHomepageFeed();
    }
  });

  // =====================================================================
  // Search Results & Video Session Handling
  // =====================================================================
  chrome.storage.local.get("userGoal", ({ userGoal }) => {
    if (!userGoal) return;
    const path = window.location.pathname;
    const isSearchPage = (path === "/results");
    if (isSearchPage) {
      const cleanupSearchLayout = () => {
        const masthead = document.getElementById("masthead-container");
        const secondaryNav = document.getElementById("secondary");
        const chipsBar = document.querySelector("ytd-feed-filter-chip-bar-renderer");
        if (masthead) masthead.style.display = "none";
        if (secondaryNav) secondaryNav.style.display = "none";
        if (chipsBar) chipsBar.style.display = "none";
        document.querySelectorAll("ytd-reel-shelf-renderer").forEach(el => {
          el.style.display = "none";
        });
        const resultsContainer = document.getElementById("contents");
        if (resultsContainer) {
          resultsContainer.style.display = "grid";
          resultsContainer.style.gridTemplateColumns = "repeat(auto-fill, minmax(300px, 1fr))";
          resultsContainer.style.gap = "20px";
          resultsContainer.style.padding = "20px";
          document.querySelectorAll("ytd-video-renderer").forEach(card => {
            card.style.maxWidth = "100%";
            card.style.borderRadius = "10px";
            card.style.overflow = "hidden";
            card.style.boxShadow = "0 0 10px rgba(0,0,0,0.2)";
            card.style.backgroundColor = "#1e1e1e";
          });
        }
        const fullSidebar = document.getElementById("guide");
        if (fullSidebar) fullSidebar.style.display = "none";
        const miniSidebar = document.querySelector("ytd-mini-guide-renderer");
        if (miniSidebar) miniSidebar.style.display = "none";
        fullyExpandContentArea();
      };
      cleanupSearchLayout();
      const searchObserver = new MutationObserver(cleanupSearchLayout);
      searchObserver.observe(document.body, { childList: true, subtree: true });
    }

    let currentVideo = null;
    let sessionTimeout = null;

    // Show a popup when the video session ends.
    function showSessionPopup() {
      if (document.getElementById("focus-session-popup")) return;
      const popup = document.createElement("div");
      popup.id = "focus-session-popup";
      popup.innerHTML = `
        <div style="
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(30, 30, 30, 0.95);
          color: white;
          padding: 30px 40px;
          z-index: 999999;
          border-radius: 12px;
          box-shadow: 0 0 20px rgba(0,0,0,0.5);
          text-align: center;
          width: 400px;
          font-family: 'Segoe UI', sans-serif;
          backdrop-filter: blur(8px);
        ">
          <h2 style="margin-bottom: 15px; font-size: 22px;">⏳ Focus Session Ended</h2>
          <p style="font-size: 15px;">Do you want to continue or end this session?</p>
          <div style="margin-top: 25px;">
            <button id="continueBtn" style="margin-right: 10px; padding: 8px 18px; background: #3498db; border: none; color: white; border-radius: 6px; cursor: pointer;">Continue</button>
            <button id="endBtn" style="padding: 8px 18px; background: #e74c3c; border: none; color: white; border-radius: 6px; cursor: pointer;">End Session</button>
          </div>
        </div>
      `;
      document.body.appendChild(popup);
      document.getElementById("continueBtn").onclick = () => {
        popup.remove();
        waitForNextVideo();
      };
      // End Session handler calls endFocusMode() to stop focus mode.
      document.getElementById("endBtn").onclick = () => {
        popup.remove();
        endFocusMode();
      };
    }

    // Setup a timer based on video duration and playback speed.
    function setupSessionTimer(video) {
      if (!video || !video.duration || !video.playbackRate || isNaN(video.duration)) return;
      const duration = video.duration;
      const speed = video.playbackRate;
      const estimated = (duration / speed) * 2 * 1000;
      console.log(`🎯 Session started | Duration: ${duration}s | Speed: ${speed}x | Wait: ${estimated / 1000}s`);
      if (sessionTimeout) clearTimeout(sessionTimeout);
      sessionTimeout = setTimeout(() => {
        showSessionPopup();
      }, estimated);
    }

    // Monitor when a video starts and set up the session timer.
    function waitForNextVideo() {
      const check = () => {
        const video = document.querySelector("video");
        if (video && video !== currentVideo && !isNaN(video.duration)) {
          currentVideo = video;
          setupSessionTimer(video);
        }
      };
      check();
      const interval = setInterval(() => {
        check();
        if (window.location.pathname !== "/watch") {
          clearTimeout(sessionTimeout);
          clearInterval(interval);
        }
      }, 1000);
    }

    // Observe URL changes (for SPA navigation) and restart monitoring if needed.
    let lastUrl = location.href;
    new MutationObserver(() => {
      const currentUrl = location.href;
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        if (currentUrl.includes("/watch")) {
          waitForNextVideo();
        }
      }
    }).observe(document, { subtree: true, childList: true });

    if (location.pathname.includes("/watch")) {
      waitForNextVideo();
    }
  });
})();