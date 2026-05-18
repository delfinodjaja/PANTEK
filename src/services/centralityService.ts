import { Node, Route } from '../context/ChainContext';

/**
 * Calculates Betweenness Centrality for all nodes in the network.
 * Betweenness measures how many shortest paths pass through a node.
 */
export const calculateBetweennessCentrality = (nodes: any[] = [], routes: Route[] = []): Record<string, number> => {
  const safeNodes = nodes || [];
  const safeRoutes = routes || [];
  const nodeIds = safeNodes.map(n => n.id);
  const betweenness: Record<string, number> = {};
  nodeIds.forEach(id => betweenness[id] = 0);

  // Simple BFS-based shortest path counting for unweighted graph logic
  // (In a real system, we'd use Brandes' Algorithm or similar)
  nodeIds.forEach(startNode => {
    nodeIds.forEach(endNode => {
      if (startNode === endNode) return;

      const paths = findAllShortestPaths(startNode, endNode, safeRoutes);
      if (paths.length === 0) return;

      const pathCount = paths.length;
      paths.forEach(path => {
        // Exclude start and end nodes
        path.slice(1, -1).forEach(nodeId => {
          betweenness[nodeId] += (1 / pathCount);
        });
      });
    });
  });

  // Normalize 0-100
  const max = Math.max(...Object.values(betweenness), 1);
  Object.keys(betweenness).forEach(id => {
    betweenness[id] = Math.round((betweenness[id] / max) * 100);
  });

  return betweenness;
};

const findAllShortestPaths = (start: string, end: string, routes: Route[] = []): string[][] => {
  const safeRoutes = routes || [];
  const queue: string[][] = [[start]];
  const shortestPaths: string[][] = [];
  let minLen = Infinity;

  while (queue.length > 0) {
    const path = queue.shift()!;
    if (path.length > minLen) continue;

    const lastNode = path[path.length - 1];

    if (lastNode === end) {
      if (path.length < minLen) {
        minLen = path.length;
        shortestPaths.length = 0;
        shortestPaths.push(path);
      } else if (path.length === minLen) {
        shortestPaths.push(path);
      }
      continue;
    }

    const neighbors = safeRoutes.filter(r => r.from === lastNode).map(r => r.to);
    neighbors.forEach(neighbor => {
      if (!path.includes(neighbor)) {
        queue.push([...path, neighbor]);
      }
    });
  }

  return shortestPaths;
};
