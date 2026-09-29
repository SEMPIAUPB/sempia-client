import React, { useCallback, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import type { GraphData, NodeData } from '../../services/contracts';

const dummyData: GraphData = {
  nodes: [
    { id: '1', name: 'Variables', mastery: 0.9, isInitialized: true },
    { id: '2', name: 'Bucles', mastery: 0.5, isInitialized: true },
    { id: '3', name: 'Listas', mastery: 0.1, isInitialized: true },
    { id: '4', name: 'Recursión', mastery: 0.0, isInitialized: false },
  ],
  links: [
    { source: '1', target: '2' },
    { source: '2', target: '3' },
    { source: '2', target: '4' },
  ]
};

export default function GraphVisualization() {
  const fgRef = useRef();

  const getNodeColor = (node: NodeData) => {
    if (!node.isInitialized) return '#d1d5db'; // gray-300
    if (node.mastery > 0.8) return '#10b981'; // emerald-500
    if (node.mastery > 0.4) return '#f59e0b'; // amber-500
    return '#ef4444'; // red-500
  };

  const handleNodeClick = useCallback((node: any) => {
    // Zoom in on node
    if (fgRef.current) {
       // @ts-ignore
       fgRef.current.centerAt(node.x, node.y, 1000);
       // @ts-ignore
       fgRef.current.zoom(8, 2000);
    }
  }, []);

  return (
    <div className="h-full w-full bg-white rounded shadow flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-bold text-gray-800">Grafo de Habilidades</h2>
        <p className="text-sm text-gray-500">Visualiza tu progreso y dominio estimado (DKT) de los conceptos de programación.</p>
      </div>
      <div className="flex-1 min-h-[500px] relative">
        <ForceGraph2D
          ref={fgRef}
          graphData={dummyData}
          nodeLabel="name"
          nodeColor={getNodeColor}
          onNodeClick={handleNodeClick}
          nodeRelSize={6}
          linkColor={() => '#9ca3af'}
          width={800}
          height={500}
        />
      </div>
    </div>
  );
}
