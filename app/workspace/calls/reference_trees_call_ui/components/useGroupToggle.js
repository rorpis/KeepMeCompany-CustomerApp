// File: app/[locale]/ui/components/useNodeVisibilityManager.js
import { useState, useCallback, useEffect, useMemo } from 'react';
import { getHiddenNodes, buildRelationshipMaps } from './layoutUtils';

/**
 * Computes the order in which hidden nodes should be revealed.
 * Parent nodes come before their children.
 */
function computeRevealOrder(hiddenNodes, parentToChildren, childToParents) {
  const order = [];
  const hidden = new Set(hiddenNodes); // copy to process
  // Find "roots": nodes with no hidden parent.
  const roots = Array.from(hidden).filter(nId => {
    const parents = childToParents[nId] || [];
    return parents.every(p => !hidden.has(p));
  });
  const queue = [...roots];
  while (queue.length) {
    const nodeId = queue.shift();
    if (hidden.has(nodeId)) {
      order.push(nodeId);
      hidden.delete(nodeId);
    }
    const children = parentToChildren[nodeId] || [];
    children.forEach(child => {
      if (hidden.has(child) && !queue.includes(child)) {
        queue.push(child);
      }
    });
  }
  // Append any remaining nodes.
  return order.concat(Array.from(hidden));
}

export default function useNodeVisibilityManager(nodes, edges) {
  const [hiddenNodeIds, setHiddenNodeIds] = useState(new Set());
  const [appearingNodes, setAppearingNodes] = useState(new Set());
  const [revealedEdges, setRevealedEdges] = useState(new Set());

  // Animation configuration
  const pulseDuration = 300;     // Node pulse duration (ms)
  const nodeRevealDelay = 150;   // Delay between revealing nodes (ms)
  const edgeRevealDelay = 150;   // Delay before revealing an edge (ms)

  const toggleNodeVisibility = useCallback((nodeId) => {
    if (hiddenNodeIds.has(nodeId)) {
      // Unhide: reveal nodes sequentially in calculated order.
      const { parentToChildren, childToParents } = buildRelationshipMaps(edges);
      const order = computeRevealOrder(hiddenNodeIds, parentToChildren, childToParents);
      let delayOffset = 0;
      order.forEach(nId => {
        setTimeout(() => {
          // Remove this node from the hidden set.
          setHiddenNodeIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(nId);
            return newSet;
          });
          // Trigger its pulse animation.
          setAppearingNodes(prev => new Set(prev).add(nId));
          setTimeout(() => {
            setAppearingNodes(prev => {
              const newSet = new Set(prev);
              newSet.delete(nId);
              return newSet;
            });
          }, pulseDuration);
        }, delayOffset);
        delayOffset += nodeRevealDelay;
      });
    } else {
      // Hide: compute branch to hide.
      const newHiddenNodes = getHiddenNodes(nodeId, nodes, edges);
      setHiddenNodeIds(newHiddenNodes);
      setAppearingNodes(new Set());
      // Instead of wiping all revealed edges, only remove those with a hidden endpoint.
      setRevealedEdges(prev => {
        const newSet = new Set();
        for (const edgeId of prev) {
          const edge = edges.find(e => e.id === edgeId);
          if (edge && !newHiddenNodes.has(edge.source) && !newHiddenNodes.has(edge.target)) {
            newSet.add(edgeId);
          }
        }
        return newSet;
      });
    }
  }, [hiddenNodeIds, nodes, edges, pulseDuration, nodeRevealDelay]);

  // New: toggle group visibility based on a group name (stored in node.data.group)
  const toggleGroupVisibility = useCallback((groupName) => {
    // Get node IDs in the group.
    const groupNodeIds = nodes
      .filter(node => node.data.group === groupName)
      .map(node => node.id);
    // Check if the entire group is currently hidden.
    const allHidden = groupNodeIds.every(id => hiddenNodeIds.has(id));
    if (allHidden) {
      // Unhide each node in the group sequentially.
      let delayOffset = 0;
      groupNodeIds.forEach(nId => {
        setTimeout(() => {
          setHiddenNodeIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(nId);
            return newSet;
          });
          setAppearingNodes(prev => new Set(prev).add(nId));
          setTimeout(() => {
            setAppearingNodes(prev => {
              const newSet = new Set(prev);
              newSet.delete(nId);
              return newSet;
            });
          }, pulseDuration);
        }, delayOffset);
        delayOffset += nodeRevealDelay;
      });
    } else {
      // Hide all nodes in the group.
      let newHidden = new Set(hiddenNodeIds);
      groupNodeIds.forEach(nId => {
        const branchHidden = getHiddenNodes(nId, nodes, edges);
        branchHidden.forEach(id => newHidden.add(id));
      });
      setHiddenNodeIds(newHidden);
      setAppearingNodes(new Set());
      setRevealedEdges(prev => {
        const newSet = new Set();
        for (const edgeId of prev) {
          const edge = edges.find(e => e.id === edgeId);
          if (edge && !newHidden.has(edge.source) && !newHidden.has(edge.target)) {
            newSet.add(edgeId);
          }
        }
        return newSet;
      });
    }
  }, [nodes, edges, hiddenNodeIds, pulseDuration, nodeRevealDelay]);

  // Reveal edges once both endpoints are visible.
  useEffect(() => {
    edges.forEach(edge => {
      if (
        !hiddenNodeIds.has(edge.source) &&
        !hiddenNodeIds.has(edge.target) &&
        !appearingNodes.has(edge.source) &&
        !appearingNodes.has(edge.target) &&
        !revealedEdges.has(edge.id)
      ) {
        setTimeout(() => {
          setRevealedEdges(prev => new Set(prev).add(edge.id));
        }, edgeRevealDelay);
      }
    });
  }, [edges, hiddenNodeIds, appearingNodes, revealedEdges, edgeRevealDelay]);

  // Visible nodes: those not hidden.
  const visibleNodes = useMemo(() => {
    return nodes.filter(node => !hiddenNodeIds.has(node.id));
  }, [nodes, hiddenNodeIds]);

  // Visible edges: those that have been revealed.
  const visibleEdges = useMemo(() => {
    return edges.filter(edge => revealedEdges.has(edge.id));
  }, [edges, revealedEdges]);

  return { 
    hiddenNodeIds, 
    appearingNodes, 
    toggleNodeVisibility, 
    toggleGroupVisibility,
    visibleNodes, 
    visibleEdges 
  };
}
