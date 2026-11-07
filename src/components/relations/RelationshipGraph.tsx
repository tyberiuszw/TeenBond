'use client';

import React, { useState } from 'react';
import { RelationshipNode, RelationshipEdge } from '@/types/relationship';
import { calculateMidpoint } from '@/lib/relations/graphLayout';

interface RelationshipGraphProps {
  nodes: RelationshipNode[];
  edges: RelationshipEdge[];
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  onSelectNode: (nodeId: string) => void;
  onSelectEdge: (edgeId: string) => void;
}

export function RelationshipGraph({
  nodes,
  edges,
  selectedNodeId,
  selectedEdgeId,
  onSelectNode,
  onSelectEdge,
}: RelationshipGraphProps) {
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  return (
    <div className="relative w-full h-[380px] sm:h-[460px] flex items-center justify-center overflow-hidden select-none">
      <svg
        viewBox="0 0 700 500"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Emerald Neon Glow Filter for Class 4 Edges */}
          <filter id="neon-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Soft Shadow for Nodes */}
          <filter id="node-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000000" floodOpacity="0.5" />
          </filter>
        </defs>

        {/* ----------------- RENDER EDGES ----------------- */}
        {edges.map((edge) => {
          const sourceNode = nodeMap.get(edge.source);
          const targetNode = nodeMap.get(edge.target);
          if (!sourceNode || !targetNode) return null;

          const isSelected = selectedEdgeId === edge.id;
          const isHovered = hoveredEdgeId === edge.id;
          const midpoint = calculateMidpoint(sourceNode, targetNode);

          const strokeWidth = isSelected || isHovered
            ? edge.strokeWidth + 2
            : edge.strokeWidth;

          return (
            <g
              key={edge.id}
              onClick={() => onSelectEdge(edge.id)}
              onMouseEnter={() => setHoveredEdgeId(edge.id)}
              onMouseLeave={() => setHoveredEdgeId(null)}
              className="cursor-pointer group"
            >
              {/* Invisible wider hit area for easy hover on thin lines */}
              <line
                x1={sourceNode.x}
                y1={sourceNode.y}
                x2={targetNode.x}
                y2={targetNode.y}
                stroke="transparent"
                strokeWidth={Math.max(14, strokeWidth + 8)}
              />

              {/* Visible edge line with smooth CSS transitions */}
              <line
                x1={sourceNode.x}
                y1={sourceNode.y}
                x2={targetNode.x}
                y2={targetNode.y}
                stroke={isHovered ? '#FFFFFF' : edge.color}
                strokeWidth={strokeWidth}
                strokeDasharray={edge.style === 'dashed' ? '6 6' : undefined}
                filter={edge.hasGlow ? 'url(#neon-glow)' : undefined}
                style={{
                  transition: 'stroke-width 0.4s ease, stroke 0.3s ease',
                }}
              />

              {/* Weight Badge in midpoint */}
              <circle
                cx={midpoint.x}
                cy={midpoint.y}
                r={isSelected || isHovered ? 13 : 11}
                fill="#0F172A"
                stroke={isHovered ? '#FFFFFF' : edge.color}
                strokeWidth="1.5"
                style={{ transition: 'all 0.2s ease' }}
              />
              <text
                x={midpoint.x}
                y={midpoint.y + 4}
                fill={isHovered ? '#FFFFFF' : edge.color}
                fontSize="10"
                fontWeight="bold"
                textAnchor="middle"
              >
                {edge.weight > 0 ? `+${edge.weight}` : edge.weight}
              </text>
            </g>
          );
        })}

        {/* ----------------- RENDER NODES ----------------- */}
        {nodes.map((node) => {
          const isSelected = selectedNodeId === node.id;
          const isHovered = hoveredNodeId === node.id;
          const isLeader = node.role === 'leader';

          return (
            <g
              key={node.id}
              onClick={() => onSelectNode(node.id)}
              onMouseEnter={() => setHoveredNodeId(node.id)}
              onMouseLeave={() => setHoveredNodeId(null)}
              className="cursor-pointer group"
            >
              {/* Outer Selection Ring */}
              {isSelected && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="34"
                  fill="none"
                  stroke={node.color}
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  className="animate-spin"
                  style={{
                    transformOrigin: `${node.x}px ${node.y}px`,
                    animationDuration: '8s',
                  }}
                />
              )}

              {/* Leader Halo Ring */}
              {isLeader && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="30"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="1.5"
                  strokeOpacity="0.4"
                />
              )}

              {/* Main Node Circle */}
              <circle
                cx={node.x}
                cy={node.y}
                r={isSelected || isHovered ? 26 : 23}
                fill="#0F172A"
                stroke={node.color}
                strokeWidth={isSelected ? 3.5 : isHovered ? 3 : 2.5}
                filter="url(#node-shadow)"
                style={{
                  transition: 'r 0.2s ease, stroke-width 0.2s ease',
                  filter: `drop-shadow(0 0 12px ${node.color}50)`,
                }}
              />

              {/* Monogram Initial */}
              <text
                x={node.x}
                y={node.y + 5}
                fill={node.color}
                fontSize="14"
                fontWeight="black"
                textAnchor="middle"
              >
                {node.name.charAt(0)}
              </text>

              {/* Name label under node */}
              <text
                x={node.x}
                y={node.y + 38}
                fill="#F8FAFC"
                fontSize="11"
                fontWeight="bold"
                textAnchor="middle"
              >
                {node.name}
              </text>

              {/* Small role pill below name */}
              {isLeader && (
                <text
                  x={node.x}
                  y={node.y + 50}
                  fill="#F59E0B"
                  fontSize="9"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  ★ LIDER
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
