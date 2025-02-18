import dagre from '@dagrejs/dagre';

const HORIZONTAL_SPACING = 350;
const VERTICAL_SPACING = 200;

export const autoLayoutNodes = (nodes, edges) => {
  // First, create a map of nodes that have multiple incoming edges
  const incomingEdges = edges.reduce((acc, edge) => {
    if (!acc[edge.target]) {
      acc[edge.target] = [];
    }
    acc[edge.target].push(edge);
    return acc;
  }, {});

  // Calculate total width needed for each node's incoming instructions
  const getRequiredWidth = (nodeId) => {
    const edges = incomingEdges[nodeId] || [];
    if (edges.length <= 1) return 250; // Base width for single edge

    // Calculate total width needed for all instructions
    const totalInstructionsWidth = edges.reduce((total, edge) => {
      const instructionLength = edge.data?.instructions?.length || 0;
      return total + (instructionLength * 8) + 60; // 8px per character + padding
    }, 0);

    return Math.max(250, totalInstructionsWidth + ((edges.length - 1) * 100));
  };

  // Create dagre graph
  const g = new dagre.graphlib.Graph();
  
  // Adjust the graph settings for better centering
  g.setGraph({
    rankdir: 'TB',
    // align: 'UL',          // Align nodes to upper left within their ranks
    nodesep: 150,         // Increased horizontal spacing between nodes
    ranksep: 150,         // Vertical spacing between ranks
    edgesep: 80,          // Edge spacing
    marginx: 50,          // Margin from the left and right
    marginy: 50,          // Margin from the top and bottom
  });
  
  g.setDefaultEdgeLabel(() => ({}));

  // Add nodes with width based on incoming instructions
  nodes.forEach((node) => {
    g.setNode(node.id, {
      width: getRequiredWidth(node.id),
      height: 100
    });
  });

  // Add edges
  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  // Apply layout
  dagre.layout(g);

  // Get graph dimensions
  const graphWidth = g.graph().width;
  const graphHeight = g.graph().height;

  // Get the laid out nodes with positions and center them
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = g.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWithPosition.width / 2,
        y: nodeWithPosition.y - nodeWithPosition.height / 2
      }
    };
  });

  return { nodes: layoutedNodes };
}; 