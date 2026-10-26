/**
 * Predefined Transportation Benchmark Networks
 * Includes the canonical Sioux Falls 24-node transportation benchmark
 * and futuristic Cyber-Metropolis and Logistics Corridors.
 */

export const NETWORKS = {
  siouxFalls: {
    id: 'siouxFalls',
    name: 'Sioux Falls Benchmark',
    description: 'Canonical 24-node, 76-link transportation benchmark used in academic literature',
    nodes: [
      { id: 1, x: 120, y: 70, label: 'N1' },
      { id: 2, x: 120, y: 190, label: 'N2' },
      { id: 3, x: 230, y: 70, label: 'N3' },
      { id: 4, x: 230, y: 150, label: 'N4' },
      { id: 5, x: 230, y: 220, label: 'N5' },
      { id: 6, x: 230, y: 310, label: 'N6' },
      { id: 7, x: 370, y: 310, label: 'N7' },
      { id: 8, x: 370, y: 390, label: 'N8' },
      { id: 9, x: 370, y: 220, label: 'N9' },
      { id: 10, x: 370, y: 150, label: 'N10' },
      { id: 11, x: 490, y: 150, label: 'N11' },
      { id: 12, x: 230, y: 70, label: 'N12' }, // Sioux standard
      { id: 13, x: 120, y: 390, label: 'N13' },
      { id: 14, x: 120, y: 490, label: 'N14' },
      { id: 15, x: 230, y: 490, label: 'N15' },
      { id: 16, x: 370, y: 490, label: 'N16' },
      { id: 17, x: 370, y: 570, label: 'N17' },
      { id: 18, x: 490, y: 390, label: 'N18' },
      { id: 19, x: 580, y: 490, label: 'N19' },
      { id: 20, x: 580, y: 390, label: 'N20' },
      { id: 21, x: 670, y: 390, label: 'N21' },
      { id: 22, x: 670, y: 490, label: 'N22' },
      { id: 23, x: 490, y: 570, label: 'N23' },
      { id: 24, x: 580, y: 570, label: 'N24' },
    ],
    // Clean normalized layout scaled for 800x600 canvas
    layoutNodes: [
      { id: 1, x: 150, y: 60, label: 'N1 (North Industrial)' },
      { id: 2, x: 150, y: 180, label: 'N2' },
      { id: 3, x: 270, y: 60, label: 'N3' },
      { id: 4, x: 270, y: 140, label: 'N4' },
      { id: 5, x: 270, y: 220, label: 'N5' },
      { id: 6, x: 270, y: 310, label: 'N6' },
      { id: 7, x: 390, y: 310, label: 'N7' },
      { id: 8, x: 390, y: 390, label: 'N8 (Central Hub)' },
      { id: 9, x: 390, y: 220, label: 'N9' },
      { id: 10, x: 390, y: 140, label: 'N10' },
      { id: 11, x: 500, y: 140, label: 'N11' },
      { id: 12, x: 390, y: 60, label: 'N12' },
      { id: 13, x: 150, y: 390, label: 'N13' },
      { id: 14, x: 150, y: 490, label: 'N14' },
      { id: 15, x: 270, y: 490, label: 'N15' },
      { id: 16, x: 390, y: 490, label: 'N16' },
      { id: 17, x: 390, y: 560, label: 'N17' },
      { id: 18, x: 500, y: 390, label: 'N18' },
      { id: 19, x: 600, y: 490, label: 'N19' },
      { id: 20, x: 600, y: 390, label: 'N20 (East Gate)' },
      { id: 21, x: 700, y: 390, label: 'N21' },
      { id: 22, x: 700, y: 490, label: 'N22' },
      { id: 23, x: 500, y: 560, label: 'N23' },
      { id: 24, x: 600, y: 560, label: 'N24 (South Logistics)' },
    ],
    links: [
      { id: '1-2', from: 1, to: 2, t0: 6, capacity: 50 },
      { id: '2-1', from: 2, to: 1, t0: 6, capacity: 50 },
      { id: '1-3', from: 1, to: 3, t0: 4, capacity: 45 },
      { id: '3-1', from: 3, to: 1, t0: 4, capacity: 45 },
      { id: '2-6', from: 2, to: 6, t0: 5, capacity: 40 },
      { id: '6-2', from: 6, to: 2, t0: 5, capacity: 40 },
      { id: '3-4', from: 3, to: 4, t0: 4, capacity: 45 },
      { id: '4-3', from: 4, to: 3, t0: 4, capacity: 45 },
      { id: '3-12', from: 3, to: 12, t0: 4, capacity: 45 },
      { id: '12-3', from: 12, to: 3, t0: 4, capacity: 45 },
      { id: '4-5', from: 4, to: 5, t0: 3, capacity: 35 },
      { id: '5-4', from: 5, to: 4, t0: 3, capacity: 35 },
      { id: '4-11', from: 4, to: 11, t0: 6, capacity: 40 },
      { id: '11-4', from: 11, to: 4, t0: 6, capacity: 40 },
      { id: '5-6', from: 5, to: 6, t0: 4, capacity: 35 },
      { id: '6-5', from: 6, to: 5, t0: 4, capacity: 35 },
      { id: '5-9', from: 5, to: 9, t0: 5, capacity: 40 },
      { id: '9-5', from: 9, to: 5, t0: 5, capacity: 40 },
      { id: '6-8', from: 6, to: 8, t0: 4, capacity: 40 },
      { id: '8-6', from: 8, to: 6, t0: 4, capacity: 40 },
      { id: '7-8', from: 7, to: 8, t0: 3, capacity: 60 },
      { id: '8-7', from: 8, to: 7, t0: 3, capacity: 60 },
      { id: '7-18', from: 7, to: 18, t0: 5, capacity: 45 },
      { id: '18-7', from: 18, to: 7, t0: 5, capacity: 45 },
      { id: '8-9', from: 8, to: 9, t0: 6, capacity: 45 },
      { id: '9-8', from: 9, to: 8, t0: 6, capacity: 45 },
      { id: '8-16', from: 8, to: 16, t0: 5, capacity: 50 },
      { id: '16-8', from: 16, to: 8, t0: 5, capacity: 50 },
      { id: '9-10', from: 9, to: 10, t0: 3, capacity: 50 },
      { id: '10-9', from: 10, to: 9, t0: 3, capacity: 50 },
      { id: '10-11', from: 10, to: 11, t0: 4, capacity: 45 },
      { id: '11-10', from: 11, to: 10, t0: 4, capacity: 45 },
      { id: '10-15', from: 10, to: 15, t0: 6, capacity: 40 },
      { id: '15-10', from: 15, to: 10, t0: 6, capacity: 40 },
      { id: '11-12', from: 11, to: 12, t0: 5, capacity: 40 },
      { id: '12-11', from: 12, to: 11, t0: 5, capacity: 40 },
      { id: '12-13', from: 12, to: 13, t0: 6, capacity: 40 },
      { id: '13-12', from: 13, to: 12, t0: 6, capacity: 40 },
      { id: '13-14', from: 13, to: 14, t0: 4, capacity: 45 },
      { id: '14-13', from: 14, to: 13, t0: 4, capacity: 45 },
      { id: '14-15', from: 14, to: 15, t0: 5, capacity: 45 },
      { id: '15-14', from: 15, to: 14, t0: 5, capacity: 45 },
      { id: '15-16', from: 15, to: 16, t0: 4, capacity: 45 },
      { id: '16-15', from: 16, to: 15, t0: 4, capacity: 45 },
      { id: '15-19', from: 15, to: 19, t0: 6, capacity: 40 },
      { id: '19-15', from: 19, to: 15, t0: 6, capacity: 40 },
      { id: '16-17', from: 16, to: 17, t0: 3, capacity: 50 },
      { id: '17-16', from: 17, to: 16, t0: 3, capacity: 50 },
      { id: '16-18', from: 16, to: 18, t0: 4, capacity: 45 },
      { id: '18-16', from: 18, to: 16, t0: 4, capacity: 45 },
      { id: '17-19', from: 17, to: 19, t0: 4, capacity: 40 },
      { id: '19-17', from: 19, to: 17, t0: 4, capacity: 40 },
      { id: '18-20', from: 18, to: 20, t0: 4, capacity: 50 },
      { id: '20-18', from: 20, to: 18, t0: 4, capacity: 50 },
      { id: '19-20', from: 19, to: 20, t0: 4, capacity: 40 },
      { id: '20-19', from: 20, to: 19, t0: 4, capacity: 40 },
      { id: '20-21', from: 20, to: 21, t0: 3, capacity: 50 },
      { id: '21-20', from: 21, to: 20, t0: 3, capacity: 50 },
      { id: '20-22', from: 20, to: 22, t0: 5, capacity: 40 },
      { id: '22-20', from: 22, to: 20, t0: 5, capacity: 40 },
      { id: '21-22', from: 21, to: 22, t0: 3, capacity: 45 },
      { id: '22-21', from: 22, to: 21, t0: 3, capacity: 45 },
      { id: '21-24', from: 21, to: 24, t0: 4, capacity: 45 },
      { id: '24-21', from: 24, to: 21, t0: 4, capacity: 45 },
      { id: '22-23', from: 22, to: 23, t0: 4, capacity: 45 },
      { id: '23-22', from: 23, to: 22, t0: 4, capacity: 45 },
      { id: '23-24', from: 23, to: 24, t0: 3, capacity: 50 },
      { id: '24-23', from: 24, to: 23, t0: 3, capacity: 50 }
    ]
  },

  cyberMetropolis: {
    id: 'cyberMetropolis',
    name: 'Cyber-Metropolis Grid',
    description: 'High-density 16-node smart grid with dual highway ring and river bottleneck bridges',
    layoutNodes: [
      { id: 1, x: 160, y: 100, label: 'N1 (Tech District)' },
      { id: 2, x: 330, y: 100, label: 'N2 (North Bridge)' },
      { id: 3, x: 500, y: 100, label: 'N3 (Financial Core)' },
      { id: 4, x: 670, y: 100, label: 'N4 (East Hub)' },

      { id: 5, x: 160, y: 240, label: 'N5 (Cyber Port)' },
      { id: 6, x: 330, y: 240, label: 'N6 (River Island)' },
      { id: 7, x: 500, y: 240, label: 'N7 (Quantum Exchange)' },
      { id: 8, x: 670, y: 240, label: 'N8 (East Terminal)' },

      { id: 9, x: 160, y: 380, label: 'N9 (West Suburb)' },
      { id: 10, x: 330, y: 380, label: 'N10 (South Bridge)' },
      { id: 11, x: 500, y: 380, label: 'N11 (Medical Center)' },
      { id: 12, x: 670, y: 380, label: 'N12 (Industrial Park)' },

      { id: 13, x: 160, y: 520, label: 'N13 (South Bay)' },
      { id: 14, x: 330, y: 520, label: 'N14 (Intermodal Yard)' },
      { id: 15, x: 500, y: 520, label: 'N15 (Eco District)' },
      { id: 16, x: 670, y: 520, label: 'N16 (Energy Plant)' }
    ],
    links: [
      // Horizontals Row 1
      { id: '1-2', from: 1, to: 2, t0: 4, capacity: 50 },
      { id: '2-1', from: 2, to: 1, t0: 4, capacity: 50 },
      { id: '2-3', from: 2, to: 3, t0: 3, capacity: 60 },
      { id: '3-2', from: 3, to: 2, t0: 3, capacity: 60 },
      { id: '3-4', from: 3, to: 4, t0: 4, capacity: 50 },
      { id: '4-3', from: 4, to: 3, t0: 4, capacity: 50 },

      // Horizontals Row 2
      { id: '5-6', from: 5, to: 6, t0: 3, capacity: 35 },
      { id: '6-5', from: 6, to: 5, t0: 3, capacity: 35 },
      { id: '6-7', from: 6, to: 7, t0: 2, capacity: 30 }, // High-demand river bottleneck
      { id: '7-6', from: 7, to: 6, t0: 2, capacity: 30 },
      { id: '7-8', from: 7, to: 8, t0: 3, capacity: 45 },
      { id: '8-7', from: 8, to: 7, t0: 3, capacity: 45 },

      // Horizontals Row 3
      { id: '9-10', from: 9, to: 10, t0: 4, capacity: 40 },
      { id: '10-9', from: 10, to: 9, t0: 4, capacity: 40 },
      { id: '10-11', from: 10, to: 11, t0: 3, capacity: 55 },
      { id: '11-10', from: 11, to: 10, t0: 3, capacity: 55 },
      { id: '11-12', from: 11, to: 12, t0: 4, capacity: 45 },
      { id: '12-11', from: 12, to: 11, t0: 4, capacity: 45 },

      // Horizontals Row 4
      { id: '13-14', from: 13, to: 14, t0: 4, capacity: 50 },
      { id: '14-13', from: 14, to: 13, t0: 4, capacity: 50 },
      { id: '14-15', from: 14, to: 15, t0: 4, capacity: 50 },
      { id: '15-14', from: 15, to: 14, t0: 4, capacity: 50 },
      { id: '15-16', from: 15, to: 16, t0: 4, capacity: 50 },
      { id: '16-15', from: 16, to: 15, t0: 4, capacity: 50 },

      // Verticals Col 1
      { id: '1-5', from: 1, to: 5, t0: 4, capacity: 45 },
      { id: '5-1', from: 5, to: 1, t0: 4, capacity: 45 },
      { id: '5-9', from: 5, to: 9, t0: 4, capacity: 45 },
      { id: '9-5', from: 9, to: 5, t0: 4, capacity: 45 },
      { id: '9-13', from: 9, to: 13, t0: 4, capacity: 45 },
      { id: '13-9', from: 13, to: 9, t0: 4, capacity: 45 },

      // Verticals Col 2
      { id: '2-6', from: 2, to: 6, t0: 3, capacity: 35 },
      { id: '6-2', from: 6, to: 2, t0: 3, capacity: 35 },
      { id: '6-10', from: 6, to: 10, t0: 4, capacity: 35 },
      { id: '10-6', from: 10, to: 6, t0: 4, capacity: 35 },
      { id: '10-14', from: 10, to: 14, t0: 4, capacity: 40 },
      { id: '14-10', from: 14, to: 10, t0: 4, capacity: 40 },

      // Verticals Col 3
      { id: '3-7', from: 3, to: 7, t0: 3, capacity: 50 },
      { id: '7-3', from: 7, to: 3, t0: 3, capacity: 50 },
      { id: '7-11', from: 7, to: 11, t0: 3, capacity: 50 },
      { id: '11-7', from: 11, to: 7, t0: 3, capacity: 50 },
      { id: '11-15', from: 11, to: 15, t0: 4, capacity: 45 },
      { id: '15-11', from: 15, to: 11, t0: 4, capacity: 45 },

      // Verticals Col 4
      { id: '4-8', from: 4, to: 8, t0: 4, capacity: 45 },
      { id: '8-4', from: 8, to: 4, t0: 4, capacity: 45 },
      { id: '8-12', from: 8, to: 12, t0: 4, capacity: 45 },
      { id: '12-8', from: 12, to: 8, t0: 4, capacity: 45 },
      { id: '12-16', from: 12, to: 16, t0: 4, capacity: 45 },
      { id: '16-12', from: 16, to: 12, t0: 4, capacity: 45 },

      // Fast express diagonals (Quantum Highway bypasses)
      { id: '1-6', from: 1, to: 6, t0: 5, capacity: 40 },
      { id: '6-1', from: 6, to: 1, t0: 5, capacity: 40 },
      { id: '7-12', from: 7, to: 12, t0: 5, capacity: 40 },
      { id: '12-7', from: 12, to: 7, t0: 5, capacity: 40 },
      { id: '6-11', from: 6, to: 11, t0: 5, capacity: 35 },
      { id: '11-6', from: 11, to: 6, t0: 5, capacity: 35 }
    ]
  },

  logisticsCorridor: {
    id: 'logisticsCorridor',
    name: 'Tri-City Freight Corridor',
    description: '12-node arterial logistics backbone with multimodal freight hubs and harbor crossings',
    layoutNodes: [
      { id: 1, x: 120, y: 140, label: 'N1 (International Airport)' },
      { id: 2, x: 280, y: 140, label: 'N2 (Air Cargo Express)' },
      { id: 3, x: 440, y: 140, label: 'N3 (North Hub)' },
      { id: 4, x: 680, y: 140, label: 'N4 (Eastern Outpost)' },

      { id: 5, x: 120, y: 320, label: 'N5 (Deepwater Port)' },
      { id: 6, x: 280, y: 320, label: 'N6 (Container Terminal)' },
      { id: 7, x: 440, y: 320, label: 'N7 (Metro Distribution)' },
      { id: 8, x: 680, y: 320, label: 'N8 (East Freight Junction)' },

      { id: 9, x: 120, y: 500, label: 'N9 (Rail Intermodal)' },
      { id: 10, x: 280, y: 500, label: 'N10 (Freight Yards)' },
      { id: 11, x: 440, y: 500, label: 'N11 (Automated Warehousing)' },
      { id: 12, x: 680, y: 500, label: 'N12 (Regional Gateway)' },
    ],
    links: [
      { id: '1-2', from: 1, to: 2, t0: 3, capacity: 55 },
      { id: '2-1', from: 2, to: 1, t0: 3, capacity: 55 },
      { id: '2-3', from: 2, to: 3, t0: 4, capacity: 45 },
      { id: '3-2', from: 3, to: 2, t0: 4, capacity: 45 },
      { id: '3-4', from: 3, to: 4, t0: 6, capacity: 50 },
      { id: '4-3', from: 4, to: 3, t0: 6, capacity: 50 },

      { id: '5-6', from: 5, to: 6, t0: 3, capacity: 60 },
      { id: '6-5', from: 6, to: 5, t0: 3, capacity: 60 },
      { id: '6-7', from: 6, to: 7, t0: 3, capacity: 35 }, // Critical bottleneck corridor
      { id: '7-6', from: 7, to: 6, t0: 3, capacity: 35 },
      { id: '7-8', from: 7, to: 8, t0: 4, capacity: 50 },
      { id: '8-7', from: 8, to: 7, t0: 4, capacity: 50 },

      { id: '9-10', from: 9, to: 10, t0: 3, capacity: 50 },
      { id: '10-9', from: 10, to: 9, t0: 3, capacity: 50 },
      { id: '10-11', from: 10, to: 11, t0: 4, capacity: 45 },
      { id: '11-10', from: 11, to: 10, t0: 4, capacity: 45 },
      { id: '11-12', from: 11, to: 12, t0: 5, capacity: 55 },
      { id: '12-11', from: 12, to: 11, t0: 5, capacity: 55 },

      { id: '1-5', from: 1, to: 5, t0: 5, capacity: 40 },
      { id: '5-1', from: 5, to: 1, t0: 5, capacity: 40 },
      { id: '5-9', from: 5, to: 9, t0: 4, capacity: 40 },
      { id: '9-5', from: 9, to: 5, t0: 4, capacity: 40 },

      { id: '2-6', from: 2, to: 6, t0: 4, capacity: 45 },
      { id: '6-2', from: 6, to: 2, t0: 4, capacity: 45 },
      { id: '6-10', from: 6, to: 10, t0: 4, capacity: 45 },
      { id: '10-6', from: 10, to: 6, t0: 4, capacity: 45 },

      { id: '3-7', from: 3, to: 7, t0: 4, capacity: 45 },
      { id: '7-3', from: 7, to: 3, t0: 4, capacity: 45 },
      { id: '7-11', from: 7, to: 11, t0: 4, capacity: 45 },
      { id: '11-7', from: 11, to: 7, t0: 4, capacity: 45 },

      { id: '4-8', from: 4, to: 8, t0: 5, capacity: 40 },
      { id: '8-4', from: 8, to: 4, t0: 5, capacity: 40 },
      { id: '8-12', from: 8, to: 12, t0: 5, capacity: 40 },
      { id: '12-8', from: 12, to: 8, t0: 5, capacity: 40 },

      // High-speed bypass
      { id: '2-7', from: 2, to: 7, t0: 6, capacity: 40 },
      { id: '7-2', from: 7, to: 2, t0: 6, capacity: 40 },
      { id: '7-10', from: 7, to: 10, t0: 6, capacity: 40 },
      { id: '10-7', from: 10, to: 7, t0: 6, capacity: 40 },
    ]
  }
};
