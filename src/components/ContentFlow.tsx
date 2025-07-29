import { useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  Connection,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

interface Project {
  id: string;
  name: string;
  description: string;
  platforms: string[];
  contentSources: number;
  lastGenerated: string;
  status: 'active' | 'paused' | 'draft';
}

interface ContentFlowProps {
  project: Project;
}

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Content Sources' },
    position: { x: 50, y: 100 },
    style: {
      background: 'hsl(262 83% 58%)',
      color: 'white',
      border: '1px solid hsl(262 83% 58%)',
      borderRadius: '8px',
    },
  },
  {
    id: '2',
    data: { label: 'GPT-4 Content Generator' },
    position: { x: 300, y: 100 },
    style: {
      background: 'hsl(203 89% 53%)',
      color: 'white',
      border: '1px solid hsl(203 89% 53%)',
      borderRadius: '8px',
    },
  },
  {
    id: '3',
    data: { label: 'Platform Formatter' },
    position: { x: 550, y: 100 },
    style: {
      background: 'hsl(201 100% 35%)',
      color: 'white',
      border: '1px solid hsl(201 100% 35%)',
      borderRadius: '8px',
    },
  },
  {
    id: '4',
    type: 'output',
    data: { label: 'Export Destinations' },
    position: { x: 800, y: 100 },
    style: {
      background: 'hsl(315 100% 65%)',
      color: 'white',
      border: '1px solid hsl(315 100% 65%)',
      borderRadius: '8px',
    },
  },
  // Platform-specific nodes
  {
    id: '5',
    data: { label: 'Twitter/X Format' },
    position: { x: 450, y: 200 },
    style: {
      background: 'hsl(203 89% 53%)',
      color: 'white',
      border: '1px solid hsl(203 89% 53%)',
      borderRadius: '6px',
      fontSize: '12px',
    },
  },
  {
    id: '6',
    data: { label: 'LinkedIn Format' },
    position: { x: 550, y: 200 },
    style: {
      background: 'hsl(201 100% 35%)',
      color: 'white',
      border: '1px solid hsl(201 100% 35%)',
      borderRadius: '6px',
      fontSize: '12px',
    },
  },
  {
    id: '7',
    data: { label: 'Instagram Format' },
    position: { x: 650, y: 200 },
    style: {
      background: 'hsl(315 100% 65%)',
      color: 'white',
      border: '1px solid hsl(315 100% 65%)',
      borderRadius: '6px',
      fontSize: '12px',
    },
  },
];

const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    animated: true,
    style: { stroke: 'hsl(262 83% 58%)' },
  },
  {
    id: 'e2-3',
    source: '2',
    target: '3',
    animated: true,
    style: { stroke: 'hsl(203 89% 53%)' },
  },
  {
    id: 'e3-4',
    source: '3',
    target: '4',
    animated: true,
    style: { stroke: 'hsl(201 100% 35%)' },
  },
  {
    id: 'e3-5',
    source: '3',
    target: '5',
    style: { stroke: 'hsl(203 89% 53%)' },
  },
  {
    id: 'e3-6',
    source: '3',
    target: '6',
    style: { stroke: 'hsl(201 100% 35%)' },
  },
  {
    id: 'e3-7',
    source: '3',
    target: '7',
    style: { stroke: 'hsl(315 100% 65%)' },
  },
];

export default function ContentFlow({ project }: ContentFlowProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  return (
    <div className="h-96 w-full border border-border rounded-lg overflow-hidden bg-muted/20">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Controls />
        <MiniMap 
          nodeStrokeColor="#000"
          nodeColor="#fff"
          nodeBorderRadius={8}
        />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}