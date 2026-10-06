import React, { useCallback, useRef, useState, useEffect } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Maximize, Minimize } from 'lucide-react';
import type { GraphData, NodeData } from '../../services/contracts';
import skillsData from './skillsData.json';

// We will fetch UserSkillProgress and map it over the initial graph
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../services/api/apiClient';

const getInitialGraphData = (): GraphData => {
  const nodes: NodeData[] = [];
  const links: { source: string; target: string }[] = [];

  skillsData.forEach((skill) => {
    nodes.push({
      id: skill.id,
      name: skill.habilidad,
      mastery: 0,
      isInitialized: false,
    });

    skill.prerrequisitos.forEach((prereq) => {
      links.push({
        source: prereq,
        target: skill.id,
      });
    });
  });

  return { nodes, links };
};

export default function GraphVisualization() {
  const fgRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { data: progressData } = useQuery({
    queryKey: ['skillProgress'],
    queryFn: async () => {
      const res = await apiClient.get<any[]>('/skills/progress/');
      return res.data;
    }
  });

  // Merge real data with static graph
  const graphData = React.useMemo(() => {
    const baseGraph = getInitialGraphData();
    if (progressData) {
      const dataArr = Array.isArray(progressData) ? progressData : (progressData.results || []);
      baseGraph.nodes = baseGraph.nodes.map(node => {
        const p = dataArr.find((x: any) => x.skill.name === node.name);
        if (p) {
          return { ...node, mastery: p.mastery_percentage / 100, isInitialized: p.is_initialized };
        }
        return node;
      });
    }
    return baseGraph;
  }, [progressData]);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect;
        setDimensions({ width, height });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [isFullscreen]); // Re-bind observer if ref changes due to fullscreen

  const getNodeColor = (node: NodeData) => {
    if (!node.isInitialized) return '#d1d5db';
    if (node.mastery > 0.8) return '#10b981';
    if (node.mastery > 0.4) return '#f59e0b';
    return '#ef4444';
  };

  const handleNodeClick = useCallback((node: any) => {
    if (fgRef.current) {
       fgRef.current.centerAt(node.x, node.y, 1000);
       fgRef.current.zoom(4, 2000);
    }
  }, []);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Custom drawing for nodes to make text always visible
  const paintNode = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const label = node.name;
    const fontSize = 12 / globalScale;
    ctx.font = `${fontSize}px Sans-Serif`;
    const textWidth = ctx.measureText(label).width;
    const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); // padding

    // Draw node circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI, false);
    ctx.fillStyle = getNodeColor(node);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Draw text background slightly below the node
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillRect(
      node.x - bckgDimensions[0] / 2,
      node.y + 6,
      bckgDimensions[0],
      bckgDimensions[1]
    );

    // Draw text
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#1f2937'; // gray-800
    ctx.fillText(label, node.x, node.y + 6 + (fontSize * 0.1));
  }, []);

  const containerClasses = isFullscreen 
    ? "fixed inset-0 z-50 bg-white flex flex-col" 
    : "h-full w-full bg-white rounded-xl shadow-sm border border-brand-border flex flex-col overflow-hidden";

  return (
    <div className={containerClasses}>
      <div className="p-4 sm:p-6 border-b border-brand-border flex justify-between items-start bg-white">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Mapa de Conocimiento (Grafo de Habilidades)</h2>
          <p className="text-sm text-gray-500 mt-1">
            Visualiza tu progreso y dominio de los conceptos de programación de acuerdo al modelo DKT.
          </p>
          <div className="flex flex-wrap items-center gap-4 mt-4 text-xs font-medium">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#10b981]"></div> Dominado (&gt;80%)</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#f59e0b]"></div> En progreso (40-80%)</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#ef4444]"></div> Por mejorar (&lt;40%)</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#d1d5db]"></div> No iniciado</div>
          </div>
        </div>
        <button 
          onClick={toggleFullscreen}
          className="p-2 text-gray-500 hover:text-brand-blue hover:bg-blue-50 rounded-lg transition-colors"
          title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
        >
          {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
        </button>
      </div>
      <div className="flex-1 relative w-full h-full bg-gray-50 min-h-[500px]" ref={containerRef}>
        <ForceGraph2D
          ref={fgRef}
          graphData={graphData}
          nodeLabel={(node: any) => `${(node.mastery * 100).toFixed(0)}% Dominio`}
          nodeCanvasObject={paintNode}
          onNodeClick={handleNodeClick}
          linkColor={() => '#cbd5e1'}
          linkDirectionalArrowLength={3.5}
          linkDirectionalArrowRelPos={1}
          width={dimensions.width}
          height={dimensions.height}
        />
      </div>
    </div>
  );
}
