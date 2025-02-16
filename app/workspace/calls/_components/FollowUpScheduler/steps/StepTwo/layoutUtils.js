const HORIZONTAL_SPACING = 300;
const VERTICAL_SPACING = 150;

export function autoLayoutNodes(nodes, edges) {
  // Create a map of node levels
  const nodeLevels = new Map();
  const processed = new Set();
  
  // Find root nodes (nodes with no incoming edges)
  const hasIncoming = new Set(edges.map(e => e.target));
  const roots = nodes.filter(n => !hasIncoming.has(n.id));
  
  // Assign levels through BFS
  let currentLevel = roots;
  let level = 0;
  
  while (currentLevel.length > 0) {
    nodeLevels.set(level, currentLevel);
    processed.add(...currentLevel.map(n => n.id));
    
    // Find next level nodes
    const nextLevel = [];
    currentLevel.forEach(node => {
      const childEdges = edges.filter(e => e.source === node.id);
      childEdges.forEach(edge => {
        const targetNode = nodes.find(n => n.id === edge.target);
        if (targetNode && !processed.has(targetNode.id)) {
          nextLevel.push(targetNode);
        }
      });
    });
    
    currentLevel = nextLevel;
    level++;
  }
  
  // Position nodes
  const layoutedNodes = nodes.map(node => {
    const nodeLevel = Array.from(nodeLevels.entries())
      .find(([_, levelNodes]) => levelNodes.includes(node))
      ?.[0] ?? 0;
      
    const levelNodes = nodeLevels.get(nodeLevel) ?? [];
    const nodeIndex = levelNodes.indexOf(node);
    const levelWidth = levelNodes.length * HORIZONTAL_SPACING;
    
    return {
      ...node,
      position: {
        x: (nodeIndex * HORIZONTAL_SPACING) - (levelWidth / 2) + (HORIZONTAL_SPACING / 2),
        y: nodeLevel * VERTICAL_SPACING
      }
    };
  });
  
  return { nodes: layoutedNodes };
} 