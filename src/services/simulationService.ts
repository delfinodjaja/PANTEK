import { Node, Supplier, Warehouse, Route, Disruption } from '../context/ChainContext';

export interface ProbabilisticDisruption extends Disruption {
  variance: number;
}

export interface SimulationStep {
  day: number;
  nodeStress: Record<string, number>;
  confidenceBands: {
    p50: Record<string, number>;
    p90: Record<string, number>;
    p99: Record<string, number>;
  };
}

/**
 * Monte Carlo Stress Engine
 * Runs multiple stochastic passes to determine probability distributions
 */
export interface CorrelatedCluster {
  name: string;
  nodeIds: string[];
}

export const runMonteCarloSimulation = (
  nodes: (Supplier | Warehouse)[] = [],
  routes: Route[] = [],
  disruptions: Disruption[] = [],
  iterations: number = 500,
  days: number = 30
): { steps: SimulationStep[], clusters: CorrelatedCluster[] } => {
  const steps: SimulationStep[] = [];
  const safeNodes = nodes || [];
  const safeRoutes = routes || [];
  const safeDisruptions = disruptions || [];

  // Cluster detection: Group nodes by region or shared lanes
  const clusters = detectCorrelatedClusters(safeNodes, safeRoutes);

  for (let d = 0; d < days; d++) {
    const iterationResults: Record<string, number[]> = {};
    safeNodes.forEach(n => iterationResults[n.id] = []);

    for (let i = 0; i < iterations; i++) {
      const currentStress: Record<string, number> = {};
      
      // 1. Apply primary disruptions with random variance
      safeDisruptions.forEach(dis => {
        const variance = Math.random() * 0.2 - 0.1; // +/- 10% noise
        currentStress[dis.targetId] = Math.min(100, (dis.severity * 100) * (1 + variance));
      });

      // 2. Correlated Failure Sampling
      clusters.forEach(cluster => {
        if (cluster.nodeIds.some(id => (currentStress[id] || 0) > 70)) {
          cluster.nodeIds.forEach(id => {
            currentStress[id] = Math.max(currentStress[id] || 0, 40 + Math.random() * 30);
          });
        }
      });

      // 3. Bidirectional Propagation
      safeRoutes.forEach(route => {
        const fromStress = currentStress[route.from] || 0;
        const toStress = currentStress[route.to] || 0;

        if (fromStress > 30) {
          const leak = (fromStress * 0.4) * (1 - route.reliability / 100);
          currentStress[route.to] = Math.min(100, (currentStress[route.to] || 0) + leak);
        }

        if (toStress > 50) {
          const distortion = (toStress * 0.2);
          currentStress[route.from] = Math.min(100, (currentStress[route.from] || 0) + distortion);
        }
      });

      Object.entries(currentStress).forEach(([id, val]) => {
        if (iterationResults[id]) iterationResults[id].push(val);
      });
    }

    const p50: Record<string, number> = {};
    const p90: Record<string, number> = {};
    const p99: Record<string, number> = {};

    Object.entries(iterationResults).forEach(([id, values]) => {
      const sorted = values.sort((a, b) => a - b);
      p50[id] = sorted[Math.floor(sorted.length * 0.5)] || 0;
      p90[id] = sorted[Math.floor(sorted.length * 0.9)] || 0;
      p99[id] = sorted[Math.floor(sorted.length * 0.99)] || 0;
    });

    steps.push({
      day: d,
      nodeStress: p50,
      confidenceBands: { p50, p90, p99 }
    });
  }

  return { steps, clusters };
};

const detectCorrelatedClusters = (nodes: (Supplier | Warehouse)[] = [], routes: Route[] = []): CorrelatedCluster[] => {
  const safeNodes = nodes || [];
  const byRegion: Record<string, string[]> = {};
  safeNodes.forEach(n => {
    if (!byRegion[n.region]) byRegion[n.region] = [];
    byRegion[n.region].push(n.id);
  });
  
  return Object.entries(byRegion)
    .filter(([_, ids]) => ids.length > 1)
    .map(([region, ids]) => ({
      name: `${region} Cluster`,
      nodeIds: ids
    }));
};
