// ============================================================================
// Gardens by the Bay — Pathways, Plazas & Walkable Bridges Builder
// (src/world/PathwaysAndBridgesBuilder.js)
// Extracted from PeninsulaTerrainBuilder.js to keep world builders concise (<450 lines).
// ============================================================================

import { WORLD_BRIDGES } from './WorldPhysicsEngine.js';

export const PLAZA_NODES = [
  { x: 0, z: 0, r: 15.0 },      // #6 Supertree Grove Central Plaza
  { x: 24, z: -26, r: 12.0 },   // #2 The Canopy & Conservatories Plaza
  { x: -20, z: -16, r: 9.6 },   // #20 Heritage Gardens Plaza
  { x: -33, z: 24, r: 12.2 },   // #23 The Meadow Amphitheater Bowl
  { x: -54, z: 32, r: 8.5 },    // #21 Serene Garden SW Plaza
  { x: -50, z: -11, r: 8.2 },   // Bayfront Plaza & #26 Floral Fantasy
  { x: -39, z: -24, r: 8.0 },   // #27 Active Garden & #37 IMBA Theatre Plaza
  { x: 16.5, z: 14.5, r: 7.0 }, // #8-#14 World of Plants Plaza
  { x: 35.5, z: -7.5, r: 4.8 }, // #22 Sun Pavilion West Shore Plaza (dry shore, zero pond overlap)
  { x: 50.0, z: 9.5, r: 3.1 },  // #16 Kingfisher West Boardwalk Entry Plaza (dry shore, zero pond overlap)
  { x: 74, z: 15, r: 5.6 }      // Satay by the Bay Coastal Plaza (clear of Lotus Pond east shore)
];

export const PATHWAY_POLYLINES = [
  // 0: Waterfront Promenade along the North & East Marina Reservoir shore (pulled inland clear of water)
  [
    { x: -22, z: -16 },
    { x: -19, z: -28 },
    { x: -12, z: -34 },
    { x: -4, z: -34.5 },
    { x: 6, z: -37 },
    { x: 24, z: -26 },
    { x: 44, z: -18 },
    { x: 56, z: -4 },
    { x: 76, z: 16 },
    { x: 72, z: 24 }
  ],
  // 1: Supertree Grove (0,0) -> Silver Garden (-1,-24) -> Conservatories & The Canopy (24,-26)
  [
    { x: 0, z: 0 },
    { x: -1, z: -24 },
    { x: 14, z: -26 },
    { x: 24, z: -26 }
  ],
  // 2: Supertree Grove (0,0) -> Golden Garden & Main Entrance Drop-Off (28.5, 1.5)
  [
    { x: 0, z: 0 },
    { x: 15, z: -2 },
    { x: 28.5, z: 1.5 }
  ],
  // 3: Supertree Grove (0,0) -> Heritage Gardens (-22,-15) -> Dragonfly Bridge East Bank (-28,-6.5)
  [
    { x: 0, z: 0 },
    { x: -12, z: -10 },
    { x: -22, z: -15 },
    { x: -28, z: -6.5 }
  ],
  // 4: Dragonfly Bridge West Bank (-40,-11.5) -> Bayfront Plaza (-50,-11) -> IMBA Theatre (-42,-20) -> Active Garden (-37,-28)
  [
    { x: -40, z: -11.5 },
    { x: -50, z: -11 },
    { x: -42, z: -20 },
    { x: -37, z: -28 }
  ],
  // 5: Supertree Grove (0,0) -> The Meadow (-33, 24) -> Garden Pod (-42, 38)
  [
    { x: 0, z: 0 },
    { x: -11, z: 14.5 },
    { x: -21, z: 17.5 },
    { x: -33, z: 24 },
    { x: -42, z: 38 }
  ],
  // 6: Serene Garden (-54, 32) -> The Meadow (-33, 24) -> South Meadow Bridge East Bank (-39.5, 14.0)
  [
    { x: -54, z: 32 },
    { x: -43, z: 27 },
    { x: -33, z: 24 },
    { x: -39.5, z: 14.0 }
  ],
  // 7: South Meadow Bridge West Bank (-58.5, 16.0) -> West Lawn (-56, 2) -> Bayfront Plaza (-50, -11)
  [
    { x: -58.5, z: 16.0 },
    { x: -56.0, z: 2.0 },
    { x: -50.0, z: -11.0 }
  ],
  // 8: Supertree Grove (0,0) -> World of Plants (14,15) -> West Shore of Water Lily Pond (35,9.5)
  [
    { x: 0, z: 0 },
    { x: 14, z: 15 },
    { x: 28, z: 12 },
    { x: 35, z: 9.5 }
  ],
  // 9: Conservatory Plaza (24,-26) -> Sun Pavilion Shore (35.5,-7.5) -> The Canyon (47,-13.5) -> Kingfisher Shore (50.8,9.5) -> Satay by the Bay (74,15)
  [
    { x: 24, z: -26 },
    { x: 36, z: -18 },
    { x: 35.5, z: -7.5 },
    { x: 47, z: -13.5 },
    { x: 50.8, z: 1.5 },
    { x: 50.8, z: 9.5 },
    { x: 53, z: 19 },
    { x: 66, z: 22 },
    { x: 74, z: 15 }
  ]
];

export function buildPathwaysPlazasAndBridges(THREE, terrainGroup, pathwayMat, meadowLawnMat) {
  // 4. Cream Sandstone Pedestrian Pathway Network (top y = 0.064) & Plazas (top y = 0.050)
  for (const node of PLAZA_NODES) {
    const discGeo = new THREE.CylinderGeometry(node.r, node.r * 1.03, 0.05, 40);
    const plaza = new THREE.Mesh(discGeo, pathwayMat);
    plaza.position.set(node.x, 0.025, node.z);
    plaza.receiveShadow = true;
    terrainGroup.add(plaza);
  }

  const meadowBowlGeo = new THREE.CylinderGeometry(9.4, 9.4, 0.06, 36);
  const meadowBowlMesh = new THREE.Mesh(meadowBowlGeo, meadowLawnMat);
  meadowBowlMesh.position.set(-33, 0.028, 24);
  meadowBowlMesh.receiveShadow = true;
  terrainGroup.add(meadowBowlMesh);

  const pathPairs = PATHWAY_POLYLINES.map((poly) =>
    poly.map((pt) => new THREE.Vector3(pt.x, 0, pt.z))
  );

  for (const pts of pathPairs) {
    const curve = new THREE.CatmullRomCurve3(pts);
    const tubeGeo = new THREE.TubeGeometry(curve, 44, 0.58, 8, false);
    const tubeMesh = new THREE.Mesh(tubeGeo, pathwayMat);
    tubeMesh.scale.y = 0.08;
    tubeMesh.position.y = 0.018;
    tubeMesh.receiveShadow = true;
    terrainGroup.add(tubeMesh);
  }

  // 4b. Walkable 3D Pedestrian Bridges & Timber Boardwalks Over Waterways
  const bridgeCedarMat = new THREE.MeshStandardMaterial({ color: 0xB45309, roughness: 0.58, metalness: 0.08 });
  const bridgeRailMat = new THREE.MeshStandardMaterial({ color: 0xF97316, roughness: 0.35, metalness: 0.55 });
  const bridgeWoodRailMat = new THREE.MeshStandardMaterial({ color: 0xD97706, roughness: 0.52, metalness: 0.15 });
  const bridgeGlowPostMat = new THREE.MeshStandardMaterial({
    color: 0xFEF08A,
    emissive: 0xFACC15,
    emissiveIntensity: 1.35,
    roughness: 0.2
  });
  const sharedPostGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.68, 8);
  const sharedCapGeo = new THREE.SphereGeometry(0.10, 10, 8);

  const extraIslandBridges = [
    {
      id: 'nibong_island_footbridge',
      name: 'Nibong Island Stepping-Stone Bridge',
      ax: -27.5,
      az: -18.0,
      bx: -31.5,
      bz: -18.0,
      halfWidth: 1.4,
      archHeight: 0.25,
      buildVisualDeck: true,
      style: 'boardwalk'
    },
    {
      id: 'dragonfly_island_footbridge',
      name: 'Dragonfly Island Stepping-Stone Bridge',
      ax: -34.5,
      az: 0.0,
      bx: -39.0,
      bz: 0.0,
      halfWidth: 1.5,
      archHeight: 0.28,
      buildVisualDeck: true,
      style: 'boardwalk'
    }
  ];
  const allVisualBridges = [
    ...WORLD_BRIDGES,
    ...extraIslandBridges.filter((eb) => !WORLD_BRIDGES.some((wb) => wb.id === eb.id))
  ];

  for (const br of allVisualBridges) {
    // Skip procedural deck/railings for dragonfly_main_bridge so it never double-stacks with the Blender Dragonfly_Bridge landmark
    if (!br.buildVisualDeck || br.id === 'dragonfly_main_bridge') continue;
    const brGroup = new THREE.Group();
    brGroup.name = `WalkableBridge_${br.id}`;
    const dx = br.bx - br.ax;
    const dz = br.bz - br.az;
    const totalLen = Math.hypot(dx, dz);
    const yaw = Math.atan2(dx, dz);
    const nx = dz / totalLen;
    const nz = -dx / totalLen;

    const numPlanks = Math.max(18, Math.floor(totalLen * 1.6));
    const deckWidth = br.halfWidth * 1.95;
    const plankGeo = new THREE.BoxGeometry(deckWidth, 0.12, (totalLen / numPlanks) * 0.92);

    for (let i = 0; i <= numPlanks; i++) {
      const t = i / numPlanks;
      const px = br.ax + dx * t;
      const pz = br.az + dz * t;
      const py = 0.08 + Math.sin(t * Math.PI) * br.archHeight;

      const plank = new THREE.Mesh(plankGeo, bridgeCedarMat);
      plank.position.set(px, py, pz);
      plank.rotation.y = yaw;
      plank.castShadow = true;
      plank.receiveShadow = true;
      brGroup.add(plank);

      // Side railings & glowing guide bollards
      if (i % 3 === 0) {
        const railMatToUse = br.style === 'coral_arch' ? bridgeRailMat : bridgeWoodRailMat;
        for (const side of [-1, 1]) {
          const rx = px + nx * (deckWidth * 0.47 * side);
          const rz = pz + nz * (deckWidth * 0.47 * side);
          const post = new THREE.Mesh(sharedPostGeo, railMatToUse);
          post.position.set(rx, py + 0.34, rz);
          brGroup.add(post);

          if (i % 6 === 0) {
            const cap = new THREE.Mesh(sharedCapGeo, bridgeGlowPostMat);
            cap.position.set(rx, py + 0.72, rz);
            brGroup.add(cap);
          }
        }
      }
    }

    // Continuous top handrail tubes along both sides of the bridge
    for (const side of [-1, 1]) {
      const railPts = [];
      for (let s = 0; s <= 12; s++) {
        const t = s / 12;
        const px = br.ax + dx * t + nx * (deckWidth * 0.47 * side);
        const pz = br.az + dz * t + nz * (deckWidth * 0.47 * side);
        const py = 0.62 + Math.sin(t * Math.PI) * br.archHeight;
        railPts.push(new THREE.Vector3(px, py, pz));
      }
      const rCurve = new THREE.CatmullRomCurve3(railPts);
      const rTube = new THREE.Mesh(
        new THREE.TubeGeometry(rCurve, 24, 0.055, 8, false),
        br.style === 'coral_arch' ? bridgeRailMat : bridgeWoodRailMat
      );
      brGroup.add(rTube);
    }

    terrainGroup.add(brGroup);
  }
}
