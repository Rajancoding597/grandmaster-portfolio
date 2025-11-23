import * as THREE from 'three';

/**
 * Creates a LatheGeometry for a chess piece based on a profile of points.
 * The points define the silhouette of the piece from the center axis outwards.
 */

// Helper to create points from simple x,y pairs
// Increased scale to 0.5 for slightly wider, more substantial look
const createPoints = (pairs) => {
  return pairs.map(([x, y]) => new THREE.Vector2(x * 0.50, y * 0.55)); 
};

// Refined Aesthetic Staunton Profiles (Wider & More Detailed)
export const PIECE_PROFILES = {
  pawn: createPoints([
    [0, 0], [0.45, 0.05], [0.45, 0.15], [0.4, 0.2], [0.3, 0.3], // Base
    [0.18, 0.6], [0.15, 0.9], // Slender stem
    [0.3, 0.95], [0.3, 1.05], [0.2, 1.1], [0.25, 1.2], [0, 1.25] // Head
  ]),
  
  rook: createPoints([
    [0, 0], [0.5, 0.1], [0.5, 0.2], [0.4, 0.3], // Base
    [0.35, 0.8], // Stem
    [0.45, 0.85], [0.45, 1.05], [0.35, 1.05], [0.35, 0.95], [0.25, 0.95], [0.25, 1.05], [0, 1.05] // Turret
  ]),
  
  bishop: createPoints([
    [0, 0], [0.5, 0.1], [0.5, 0.2], [0.35, 0.3], // Base
    [0.2, 0.7], [0.2, 0.85], // Neck
    [0.35, 0.9], [0.35, 1.0], [0.2, 1.1], [0.25, 1.35], [0.05, 1.45], [0, 1.5] // Mitre
  ]),
  
  queen: createPoints([
    [0, 0], [0.55, 0.1], [0.55, 0.2], [0.45, 0.3], // Base
    [0.25, 0.4], [0.2, 0.8], [0.25, 1.0], // Body with curve
    [0.35, 1.05], [0.35, 1.15], [0.2, 1.25], // Neck ring
    [0.35, 1.35], [0.4, 1.5], [0.2, 1.6], [0.25, 1.7], [0, 1.8] // Detailed Crown
  ]),
  
  king: createPoints([
    [0, 0], [0.55, 0.1], [0.55, 0.2], [0.45, 0.3], // Base
    [0.25, 0.4], [0.2, 0.9], [0.25, 1.0], // Body with curve
    [0.35, 1.05], [0.35, 1.15], [0.25, 1.25], // Neck ring
    [0.35, 1.4], [0.4, 1.5], // Head base
    [0.2, 1.6], [0.2, 1.7], [0.1, 1.7], [0.1, 1.9], [0.25, 1.9], [0.25, 2.0], [0, 2.0] // Ornate Cross
  ]),
  
  // Knight Base
  knightBase: createPoints([
    [0, 0], [0.5, 0.1], [0.5, 0.2], [0.4, 0.3], [0.35, 0.5], [0, 0.5]
  ])
};
