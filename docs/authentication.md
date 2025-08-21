# LiveComments Authentication System

## Overview

LiveComments implements a **hybrid authentication system** that supports multiple authentication sources while maintaining a unified user experience. The system is designed to be flexible, secure, and easy to integrate with existing websites and applications.

## Authentication Architecture

### Core Philosophy: **Universal Identity Layer**

LiveComments acts as a universal comment layer that can authenticate users from multiple sources:

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Social    │    │  External   │    │   Guest     │
│   OAuth     │    │   System    │    │ Anonymous   │
│ (Google,etc)│    │(WordPress,  │    │(Name+Email) │
│             │    │ NextAuth)   │    │             │
└─────┬───────┘    └─────┬───────┘    └─────┬───────┘
      │                  │                  │
      └──────────────────┼──────────────────┘
                         │
              ┌──────────▼─────────┐
              │   LiveComments     │
              │  Identity Layer    │
              │                    │
              │ ┌─────────────────┐│
              │ │ Unified User    ││
              │ │   Database      ││
              │ └─────────────────┘│
              └────────────────────┘
```

## Authentication Methods

### 1. External System Integration (Primary Focus)

External system integration allows LiveComments to seamlessly work with existing user authentication systems.

#### Configuration Example
```html
<div id="comments"></div>
<script>
  window.livecommentsConfig = {
    dom: "#comments",
    ownerIdentifier: "post-123",
    appKey: "your-app-key",
    // currentUser: {
    //   identifier: "wp-{{user_id}}",           // External user ID
    //   displayName: "{{user_display_name}}",   // User's display name
    //   email: "{{user_email}}",                // User's email
    // },
  };
</script>
<script src="https://livecomments.com/embed.js" async></script>
```
