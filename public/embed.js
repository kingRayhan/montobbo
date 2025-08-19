(function () {
  "use strict";

  // Prevent multiple loads
  if (window.LiveCommentsLoaded) return;
  window.LiveCommentsLoaded = true;

  // Default configuration
  const defaultConfig = {
    dom: "#livecomments",
    apiUrl: "http://localhost:3000",
    theme: "light",
  };

  // Merge user config with defaults
  const config = Object.assign(
    {},
    defaultConfig,
    window.livecommentsConfig || {}
  );

  // Find target element
  const container = document.querySelector(config.dom);
  if (!container) {
    console.error("LiveComments: Container element not found:", config.dom);
    return;
  }

  // Load CSS styles
  function loadStyles() {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `${config.apiUrl}/widget.css`;
    document.head.appendChild(link);
  }

  // Create and render the widget
  function createWidget() {
    // Create widget container
    const widgetDiv = document.createElement("div");
    widgetDiv.id = "livecomments-widget";
    widgetDiv.className = `livecomments-container theme-${config.theme}`;

    // Initial loading state
    // widgetDiv.innerHTML = `
    //   <div class="lc-loading">
    //     <div class="lc-spinner"></div>
    //     <p>Loading comments...</p>
    //   </div>
    // `;

    container.appendChild(widgetDiv);

    // Load the actual React widget
    loadReactWidget(widgetDiv, config);
  }

  // Load React widget in iframe
  function loadReactWidget(container, config) {
    // Create iframe for the widget
    const iframe = document.createElement("iframe");
    const params = new URLSearchParams({
      theme: config.theme,
      apiUrl: config.apiUrl,
      foo: config.foo || "",
    });

    iframe.src = `${config.apiUrl}/widget?${params.toString()}`;
    iframe.style.width = "100%";
    iframe.style.border = "none";
    iframe.style.minHeight = "200px";
    iframe.style.height = "200px"; // Initial height
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute("allowtransparency", "true");
    iframe.setAttribute("scrolling", "no");
    iframe.setAttribute(
      "allow",
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    );
    iframe.setAttribute("loading", "lazy");

    // Handle iframe resizing from widget
    function handleMessage(event) {
      // Check if message is from our iframe
      if (event.source === iframe.contentWindow) {
        if (event.data.type === "resize") {
          // console.log("Resizing iframe to:", event.data.height + "px");
          iframe.style.height = event.data.height + "px";
        } else if (event.data.type === "trigger") {
          console.log("Trigger event:", event);
        }
      }
    }

    window.addEventListener("message", handleMessage);

    // Cleanup on widget removal
    iframe.onload = function () {
      // Send initial config to iframe if needed
      iframe.contentWindow.postMessage(
        {
          type: "config",
          config: config,
        },
        "*"
      );
    };

    container.appendChild(iframe);
  }

  // Load when DOM is ready
  function init() {
    loadStyles();
    createWidget();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
