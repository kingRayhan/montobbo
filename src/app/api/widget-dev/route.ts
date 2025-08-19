import { NextResponse } from 'next/server';

export async function GET() {
  // Development widget loader - points to the actual Next.js widget page
  const widgetCode = `
(function() {
  'use strict';
  
  // Development widget loader
  window.LiveCommentsWidget = {
    render: function(container, config) {
      // Clear container
      container.innerHTML = '';
      
      // Create iframe pointing to our Next.js widget page
      const iframe = document.createElement('iframe');
      const params = new URLSearchParams(config);
      
      iframe.src = config.apiUrl + '/widget?' + params.toString();
      iframe.style.width = '100%';
      iframe.style.border = 'none';
      iframe.style.minHeight = '400px';
      iframe.setAttribute('scrolling', 'no');
      iframe.setAttribute('frameborder', '0');
      
      // Handle resizing from iframe
      window.addEventListener('message', function(event) {
        if (event.data.type === 'resize') {
          iframe.style.height = event.data.height + 'px';
        }
      });
      
      container.appendChild(iframe);
      
      // Optional: Add hot reloading in development
      if (config.apiUrl.includes('localhost')) {
        console.log('LiveComments: Development mode - widget will hot reload');
      }
    }
  };
})();
`;

  return new NextResponse(widgetCode, {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'no-cache', // No cache in development
    },
  });
}