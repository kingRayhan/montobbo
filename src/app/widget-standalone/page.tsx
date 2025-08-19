'use client';

import { render } from '../../lib/widget';
import { useEffect } from 'react';

// Standalone development page for testing widget components
export default function WidgetStandalonePage() {
  const config = {
    dom: '#widget-root',
    theme: 'light',
    apiUrl: 'http://localhost:3000',
    foo: 'bar'
  };

  useEffect(() => {
    const container = document.getElementById('widget-root');
    if (container) {
      render(container, config);
    }
  }, []);

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1>Widget Development Page</h1>
      <p>This page is for developing and testing the widget components directly.</p>
      <p>Changes to <code>src/lib/widget.tsx</code> will be reflected here with hot reload.</p>
      
      <hr style={{ margin: '40px 0', border: '1px solid #eee' }} />
      
      <div id="widget-root"></div>
    </div>
  );
}