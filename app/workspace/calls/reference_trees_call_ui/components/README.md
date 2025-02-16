# Conversation Flow Editor Project

This project is a React Flow-based conversation flow editor with support for group toggling, automated layout, and a demo sequence feature.

---

## 📂 Folder Structure

### `components/`
This folder contains all core components, utilities, and configuration files for the flow editor.

---

### 📄 DemoFlow.jsx
- Purpose: Handles the demo version of the flow editor.
- Details:  
  - Contains the timed demo sequence that highlights nodes and edges.  
  - Provides `Start Demo` and `Stop Demo` controls.  
  - Uses the `useFlowDemo` hook to manage animations and viewport changes.  
  - Passes `activeNodeId` and `activePathId` to `FlowEditor.js` for highlighting during the demo.
- Used For: Development demos, presentations, and testing.

---

### 📄 Config.js
- Purpose: Centralized configuration for the flow data.
- Details:  
  - Exports `initialNodes` and `initialEdges` for the conversation flow.  
  - Acts as the source of truth for the flow structure.
- Used For: Initializing and managing the flow’s data.

---

### 📄 FlowEditor.js
- Purpose: The main flow editor component.
- Details:  
  - Renders the React Flow graph with nodes, edges, and background.  
  - Supports group toggling via `useGroupToggle.js`.  
  - Handles animations when used with the demo.  
  - Runs `autoLayoutNodes` to position nodes automatically.
- Used For: Core flow editing functionality in both production and demo modes.

---

### 📄 layoutUtils.js
- Purpose: Utility functions for managing the layout of nodes.
- Details:  
  - `autoLayoutNodes`: Automatically positions nodes based on parent-child relationships.  
  - Handles the spacing and layout adjustments for the flow.
- Used For: Maintaining proper node layout and spacing.

---

### 📄 Nodes.js
- Purpose: React components for individual nodes.
- Details:  
  - Defines different node types (e.g., conversation, verification).  
  - Adds animations such as pulse and appearance effects.
- Used For: Rendering nodes in the flow with proper styles and animations.

---

### 📄 Paths.js
- Purpose: React components for the edges between nodes.
- Details:  
  - Manages the appearance of edges (dashed lines, highlighted paths).  
  - Supports animated edges during the demo sequence.
- Used For: Connecting nodes visually with custom styles and animations.

---

### 📄 useGroupToggle.js
- Purpose: A custom React hook to manage visibility toggling of node groups.
- Details:  
  - Tracks which groups are hidden.  
  - Provides functions to show/hide node groups dynamically.
- Used For: Group visibility management in the flow editor.

---

### 📄 page.js
- Purpose: Main page component that loads the flow editor.
- Details:  
  - Imports and renders either `FlowEditor` (for production) or `DemoFlow` (for demos).  

---

## 🚀 Getting Started

1. Install dependencies:  
   ```bash
   npm install
