import { NextResponse } from 'next/server';

export async function GET() {
  // This serves the widget JavaScript bundle
  // In production, you'd build and bundle the widget
  
  const widgetCode = `
// Widget bundle - simplified version
(function() {
  'use strict';
  
  // React createElement function (simplified)
  function h(tag, props, ...children) {
    const element = document.createElement(tag);
    
    if (props) {
      Object.keys(props).forEach(key => {
        if (key.startsWith('on') && typeof props[key] === 'function') {
          element.addEventListener(key.slice(2).toLowerCase(), props[key]);
        } else if (key === 'className') {
          element.className = props[key];
        } else {
          element.setAttribute(key, props[key]);
        }
      });
    }
    
    children.forEach(child => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else if (child) {
        element.appendChild(child);
      }
    });
    
    return element;
  }

  // Simple state management
  function useState(initial) {
    let value = initial;
    const listeners = [];
    
    return [
      () => value,
      (newValue) => {
        value = newValue;
        listeners.forEach(fn => fn());
      },
      (fn) => listeners.push(fn)
    ];
  }

  // Widget component
  function createWidget(container, config) {
    const [comments, setComments, onCommentsChange] = useState([
      {
        id: '1',
        author: 'Demo User',
        body: 'This is a demo comment from the embedded widget!',
        createdAt: 'Just now'
      }
    ]);
    
    function render() {
      container.innerHTML = '';
      
      const widget = h('div', { className: 'lc-widget' },
        h('h3', null, \`Comments (\${comments().length})\`),
        
        // Comment form
        h('div', { className: 'lc-comment-form' },
          h('textarea', {
            className: 'lc-textarea',
            placeholder: 'Write a comment...',
            id: 'comment-input'
          }),
          h('button', {
            className: 'lc-button',
            onclick: () => {
              const input = document.getElementById('comment-input');
              if (input.value.trim()) {
                const newComment = {
                  id: String(Date.now()),
                  author: 'Anonymous',
                  body: input.value.trim(),
                  createdAt: 'Just now'
                };
                setComments([newComment, ...comments()]);
                input.value = '';
              }
            }
          }, 'Post Comment')
        ),
        
        // Comments list
        h('div', { className: 'lc-comments' },
          ...comments().map(comment =>
            h('div', { className: 'lc-comment' },
              h('div', { className: 'lc-comment-author' }, comment.author),
              h('div', { className: 'lc-comment-body' }, comment.body),
              h('div', { className: 'lc-comment-time' }, comment.createdAt)
            )
          )
        )
      );
      
      container.appendChild(widget);
    }
    
    onCommentsChange(render);
    render();
  }

  // Global API
  window.LiveCommentsWidget = {
    render: createWidget
  };
})();
`;

  return new NextResponse(widgetCode, {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    },
  });
}