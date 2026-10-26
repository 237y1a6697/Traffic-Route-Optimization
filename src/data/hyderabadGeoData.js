/**
 * Real-world Geographic Data for Hyderabad Metropolitan Region
 * Contains real coordinates for major nodes/landmarks and real arterial road geometries.
 */

// Key Geographic Landmarks & Junctions in Hyderabad
export const HYDERABAD_LOCATIONS = [
  {
    id: 'gachibowli',
    name: 'Gachibowli, Hyderabad',
    shortName: 'Gachibowli',
    type: 'Financial & IT Hub',
    lat: 17.4401,
    lng: 78.3489,
    keywords: ['gachibowli', 'financial district', 'orir', 'cyberabad']
  },
  {
    id: 'secunderabad',
    name: 'Secunderabad Junction, Hyderabad',
    shortName: 'Secunderabad',
    type: 'Railway Terminal & Cantonment',
    lat: 17.4399,
    lng: 78.4983,
    keywords: ['secunderabad', 'paradise', 'patny', 'railway station']
  },
  {
    id: 'hitec_city',
    name: 'HITEC City (Cyber Towers), Hyderabad',
    shortName: 'HITEC City',
    type: 'Technology District',
    lat: 17.4504,
    lng: 78.3808,
    keywords: ['hitec city', 'cyber towers', 'madhapur']
  },
  {
    id: 'jubilee_hills',
    name: 'Jubilee Hills Check Post, Hyderabad',
    shortName: 'Jubilee Hills',
    type: 'Urban Arterial Junction',
    lat: 17.4319,
    lng: 78.4073,
    keywords: ['jubilee hills', 'road no 36', 'kbr park']
  },
  {
    id: 'banjara_hills',
    name: 'Banjara Hills (Road No. 12), Hyderabad',
    shortName: 'Banjara Hills',
    type: 'Commercial & Residential Center',
    lat: 17.4156,
    lng: 78.4350,
    keywords: ['banjara hills', 'care hospital', 'taj krishna']
  },
  {
    id: 'begumpet',
    name: 'Begumpet Airport Flyover, Hyderabad',
    shortName: 'Begumpet',
    type: 'Transit Corridor',
    lat: 17.4441,
    lng: 78.4682,
    keywords: ['begumpet', 'lifestyle', 'prakash nagar']
  },
  {
    id: 'panjagutta',
    name: 'Panjagutta Circle, Hyderabad',
    shortName: 'Panjagutta',
    type: 'Central Junction',
    lat: 17.4256,
    lng: 78.4513,
    keywords: ['panjagutta', 'hyderabad central', 'nagarjuna circle']
  },
  {
    id: 'mehdipatnam',
    name: 'Mehdipatnam Junction, Hyderabad',
    shortName: 'Mehdipatnam',
    type: 'Intermodal Bus Terminal',
    lat: 17.3916,
    lng: 78.4418,
    keywords: ['mehdipatnam', 'rythu bazaar', 'pvnr expressway']
  },
  {
    id: 'charminar',
    name: 'Charminar (Old City), Hyderabad',
    shortName: 'Charminar',
    type: 'Historical Heritage Zone',
    lat: 17.3616,
    lng: 78.4747,
    keywords: ['charminar', 'old city', 'madina', 'laad bazaar']
  },
  {
    id: 'miyapur',
    name: 'Miyapur Metro Terminal, Hyderabad',
    shortName: 'Miyapur',
    type: 'North-West Transit Hub',
    lat: 17.4968,
    lng: 78.3548,
    keywords: ['miyapur', 'allwyn', 'nh65']
  },
  {
    id: 'kukatpally',
    name: 'Kukatpally Y-Junction, Hyderabad',
    shortName: 'Kukatpally',
    type: 'Commercial Corridor',
    lat: 17.4875,
    lng: 78.4089,
    keywords: ['kukatpally', 'jntu', 'y junction']
  },
  {
    id: 'balanagar',
    name: 'Balanagar Crossroads, Hyderabad',
    shortName: 'Balanagar',
    type: 'Industrial Arterial',
    lat: 17.4705,
    lng: 78.4485,
    keywords: ['balanagar', 'hal', 'industrial area']
  },
  {
    id: 'bowenpally',
    name: 'Bowenpally Check Post, Hyderabad',
    shortName: 'Bowenpally',
    type: 'North Gateway Junction',
    lat: 17.4789,
    lng: 78.4836,
    keywords: ['bowenpally', 'nh44', 'hasmathpet']
  },
  {
    id: 'tank_bund',
    name: 'Tank Bund (Hussain Sagar), Hyderabad',
    shortName: 'Tank Bund',
    type: 'Lake Arterial Road',
    lat: 17.4239,
    lng: 78.4738,
    keywords: ['tank bund', 'hussain sagar', 'secretariat']
  },
  {
    id: 'paradise',
    name: 'Paradise Circle, Secunderabad',
    shortName: 'Paradise',
    type: 'Core Secunderabad Hub',
    lat: 17.4428,
    lng: 78.4877,
    keywords: ['paradise', 'mg road', 'sp road']
  },
  {
    id: 'nanakramguda',
    name: 'Nanakramguda Financial District, Hyderabad',
    shortName: 'Nanakramguda',
    type: 'ORR Outer Interchange',
    lat: 17.4172,
    lng: 78.3438,
    keywords: ['nanakramguda', 'financial district', 'waverock']
  }
];

// Real Road Network Graph with Geometry Coordinates
// Links connecting junctions with actual road segments, lengths, speed limits, and capacities
export const HYDERABAD_ROAD_EDGES = [
  // 1. Gachibowli to Jubilee Hills (Via Bio-Diversity / Durgam Cheruvu Arterial)
  {
    id: 'rd_gachibowli_jubilee',
    name: 'Gachibowli - Jubilee Hills Arterial (via Bio-Diversity)',
    from: 'gachibowli',
    to: 'jubilee_hills',
    distance: 6.8, // km
    speedLimit: 50, // km/h
    baseT0: 8.5, // min
    capacity: 2200, // veh/hr
    roadType: 'arterial',
    coordinates: [
      [17.4401, 78.3489],
      [17.4358, 78.3685],
      [17.4325, 78.3882],
      [17.4319, 78.4073]
    ]
  },
  {
    id: 'rd_jubilee_gachibowli',
    name: 'Jubilee Hills - Gachibowli Arterial',
    from: 'jubilee_hills',
    to: 'gachibowli',
    distance: 6.8,
    speedLimit: 50,
    baseT0: 8.5,
    capacity: 2200,
    roadType: 'arterial',
    coordinates: [
      [17.4319, 78.4073],
      [17.4325, 78.3882],
      [17.4358, 78.3685],
      [17.4401, 78.3489]
    ]
  },

  // 2. Gachibowli to HITEC City
  {
    id: 'rd_gachibowli_hitec',
    name: 'Gachibowli - HITEC City Link Road',
    from: 'gachibowli',
    to: 'hitec_city',
    distance: 4.2,
    speedLimit: 60,
    baseT0: 4.8,
    capacity: 2500,
    roadType: 'arterial',
    coordinates: [
      [17.4401, 78.3489],
      [17.4452, 78.3620],
      [17.4504, 78.3808]
    ]
  },
  {
    id: 'rd_hitec_gachibowli',
    name: 'HITEC City - Gachibowli Link Road',
    from: 'hitec_city',
    to: 'gachibowli',
    distance: 4.2,
    speedLimit: 60,
    baseT0: 4.8,
    capacity: 2500,
    roadType: 'arterial',
    coordinates: [
      [17.4504, 78.3808],
      [17.4452, 78.3620],
      [17.4401, 78.3489]
    ]
  },

  // 3. HITEC City to Jubilee Hills (Via Madhapur)
  {
    id: 'rd_hitec_jubilee',
    name: 'Madhapur - Jubilee Hills Road No. 36',
    from: 'hitec_city',
    to: 'jubilee_hills',
    distance: 3.9,
    speedLimit: 45,
    baseT0: 5.5,
    capacity: 1900,
    roadType: 'arterial',
    coordinates: [
      [17.4504, 78.3808],
      [17.4412, 78.3940],
      [17.4319, 78.4073]
    ]
  },
  {
    id: 'rd_jubilee_hitec',
    name: 'Jubilee Hills Road No. 36 - Madhapur',
    from: 'jubilee_hills',
    to: 'hitec_city',
    distance: 3.9,
    speedLimit: 45,
    baseT0: 5.5,
    capacity: 1900,
    roadType: 'arterial',
    coordinates: [
      [17.4319, 78.4073],
      [17.4412, 78.3940],
      [17.4504, 78.3808]
    ]
  },

  // 4. Jubilee Hills to Panjagutta (Via KBR Park & Road No. 2)
  {
    id: 'rd_jubilee_panjagutta',
    name: 'Road No. 2 Jubilee Hills - Panjagutta Circle',
    from: 'jubilee_hills',
    to: 'panjagutta',
    distance: 5.4,
    speedLimit: 50,
    baseT0: 6.8,
    capacity: 2100,
    roadType: 'arterial',
    coordinates: [
      [17.4319, 78.4073],
      [17.4285, 78.4230],
      [17.4256, 78.4513]
    ]
  },
  {
    id: 'rd_panjagutta_jubilee',
    name: 'Panjagutta - Jubilee Hills Road No. 2',
    from: 'panjagutta',
    to: 'jubilee_hills',
    distance: 5.4,
    speedLimit: 50,
    baseT0: 6.8,
    capacity: 2100,
    roadType: 'arterial',
    coordinates: [
      [17.4256, 78.4513],
      [17.4285, 78.4230],
      [17.4319, 78.4073]
    ]
  },

  // 5. Panjagutta to Begumpet
  {
    id: 'rd_panjagutta_begumpet',
    name: 'Panjagutta - Begumpet Flyover Corridor',
    from: 'panjagutta',
    to: 'begumpet',
    distance: 3.1,
    speedLimit: 50,
    baseT0: 4.0,
    capacity: 2300,
    roadType: 'arterial',
    coordinates: [
      [17.4256, 78.4513],
      [17.4348, 78.4595],
      [17.4441, 78.4682]
    ]
  },
  {
    id: 'rd_begumpet_panjagutta',
    name: 'Begumpet - Panjagutta Flyover Corridor',
    from: 'begumpet',
    to: 'panjagutta',
    distance: 3.1,
    speedLimit: 50,
    baseT0: 4.0,
    capacity: 2300,
    roadType: 'arterial',
    coordinates: [
      [17.4441, 78.4682],
      [17.4348, 78.4595],
      [17.4256, 78.4513]
    ]
  },

  // 6. Begumpet to Paradise Circle
  {
    id: 'rd_begumpet_paradise',
    name: 'Sardar Patel Road (Begumpet - Paradise)',
    from: 'begumpet',
    to: 'paradise',
    distance: 2.8,
    speedLimit: 55,
    baseT0: 3.4,
    capacity: 2600,
    roadType: 'arterial',
    coordinates: [
      [17.4441, 78.4682],
      [17.4435, 78.4780],
      [17.4428, 78.4877]
    ]
  },
  {
    id: 'rd_paradise_begumpet',
    name: 'Sardar Patel Road (Paradise - Begumpet)',
    from: 'paradise',
    to: 'begumpet',
    distance: 2.8,
    speedLimit: 55,
    baseT0: 3.4,
    capacity: 2600,
    roadType: 'arterial',
    coordinates: [
      [17.4428, 78.4877],
      [17.4435, 78.4780],
      [17.4441, 78.4682]
    ]
  },

  // 7. Paradise to Secunderabad Station
  {
    id: 'rd_paradise_secunderabad',
    name: 'Station Road (Paradise - Secunderabad Junction)',
    from: 'paradise',
    to: 'secunderabad',
    distance: 1.6,
    speedLimit: 40,
    baseT0: 2.5,
    capacity: 1800,
    roadType: 'urban',
    coordinates: [
      [17.4428, 78.4877],
      [17.4410, 78.4930],
      [17.4399, 78.4983]
    ]
  },
  {
    id: 'rd_secunderabad_paradise',
    name: 'Station Road (Secunderabad - Paradise)',
    from: 'secunderabad',
    to: 'paradise',
    distance: 1.6,
    speedLimit: 40,
    baseT0: 2.5,
    capacity: 1800,
    roadType: 'urban',
    coordinates: [
      [17.4399, 78.4983],
      [17.4410, 78.4930],
      [17.4428, 78.4877]
    ]
  },

  // 8. Outer Ring Road (ORR) Express Bypass (Gachibowli -> Miyapur -> Balanagar -> Bowenpally -> Paradise)
  {
    id: 'rd_gachibowli_miyapur_orr',
    name: 'Outer Ring Road (ORR) / Miyapur Express Highway',
    from: 'gachibowli',
    to: 'miyapur',
    distance: 9.2,
    speedLimit: 90,
    baseT0: 6.8,
    capacity: 4500,
    roadType: 'expressway',
    coordinates: [
      [17.4401, 78.3489],
      [17.4620, 78.3450],
      [17.4810, 78.3490],
      [17.4968, 78.3548]
    ]
  },
  {
    id: 'rd_miyapur_gachibowli_orr',
    name: 'ORR Express (Miyapur to Gachibowli)',
    from: 'miyapur',
    to: 'gachibowli',
    distance: 9.2,
    speedLimit: 90,
    baseT0: 6.8,
    capacity: 4500,
    roadType: 'expressway',
    coordinates: [
      [17.4968, 78.3548],
      [17.4810, 78.3490],
      [17.4620, 78.3450],
      [17.4401, 78.3489]
    ]
  },
  {
    id: 'rd_miyapur_kukatpally',
    name: 'NH65 Arterial (Miyapur - Kukatpally)',
    from: 'miyapur',
    to: 'kukatpally',
    distance: 6.4,
    speedLimit: 60,
    baseT0: 6.5,
    capacity: 3200,
    roadType: 'arterial',
    coordinates: [
      [17.4968, 78.3548],
      [17.4915, 78.3820],
      [17.4875, 78.4089]
    ]
  },
  {
    id: 'rd_kukatpally_balanagar',
    name: 'Balanagar Main Road (Kukatpally - Balanagar)',
    from: 'kukatpally',
    to: 'balanagar',
    distance: 4.8,
    speedLimit: 60,
    baseT0: 5.2,
    capacity: 3000,
    roadType: 'arterial',
    coordinates: [
      [17.4875, 78.4089],
      [17.4790, 78.4285],
      [17.4705, 78.4485]
    ]
  },
  {
    id: 'rd_balanagar_bowenpally',
    name: 'Balanagar - Bowenpally Connector',
    from: 'balanagar',
    to: 'bowenpally',
    distance: 4.1,
    speedLimit: 65,
    baseT0: 4.2,
    capacity: 3200,
    roadType: 'arterial',
    coordinates: [
      [17.4705, 78.4485],
      [17.4745, 78.4660],
      [17.4789, 78.4836]
    ]
  },
  {
    id: 'rd_bowenpally_paradise',
    name: 'NH44 / Bowenpally - Paradise Corridor',
    from: 'bowenpally',
    to: 'paradise',
    distance: 4.5,
    speedLimit: 60,
    baseT0: 5.0,
    capacity: 3400,
    roadType: 'arterial',
    coordinates: [
      [17.4789, 78.4836],
      [17.4610, 78.4855],
      [17.4428, 78.4877]
    ]
  },

  // 9. Southern Arterial via Mehdipatnam & Hussain Sagar (Tank Bund)
  {
    id: 'rd_gachibowli_mehdipatnam',
    name: 'Old Mumbai Highway (Gachibowli - Mehdipatnam)',
    from: 'gachibowli',
    to: 'mehdipatnam',
    distance: 10.5,
    speedLimit: 55,
    baseT0: 11.5,
    capacity: 2800,
    roadType: 'arterial',
    coordinates: [
      [17.4401, 78.3489],
      [17.4180, 78.3850],
      [17.4010, 78.4120],
      [17.3916, 78.4418]
    ]
  },
  {
    id: 'rd_mehdipatnam_gachibowli',
    name: 'Old Mumbai Highway (Mehdipatnam - Gachibowli)',
    from: 'mehdipatnam',
    to: 'gachibowli',
    distance: 10.5,
    speedLimit: 55,
    baseT0: 11.5,
    capacity: 2800,
    roadType: 'arterial',
    coordinates: [
      [17.3916, 78.4418],
      [17.4010, 78.4120],
      [17.4180, 78.3850],
      [17.4401, 78.3489]
    ]
  },
  {
    id: 'rd_mehdipatnam_tank_bund',
    name: 'Masab Tank - Hussain Sagar Lake Road',
    from: 'mehdipatnam',
    to: 'tank_bund',
    distance: 5.8,
    speedLimit: 45,
    baseT0: 7.5,
    capacity: 2100,
    roadType: 'arterial',
    coordinates: [
      [17.3916, 78.4418],
      [17.4050, 78.4550],
      [17.4150, 78.4680],
      [17.4239, 78.4738]
    ]
  },
  {
    id: 'rd_tank_bund_secunderabad',
    name: 'Ranigunj - Secunderabad Station Road',
    from: 'tank_bund',
    to: 'secunderabad',
    distance: 3.4,
    speedLimit: 45,
    baseT0: 4.8,
    capacity: 1900,
    roadType: 'urban',
    coordinates: [
      [17.4239, 78.4738],
      [17.4320, 78.4860],
      [17.4399, 78.4983]
    ]
  },

  // Cross Connectors
  {
    id: 'rd_jubilee_banjara',
    name: 'Road No. 10 / 12 Jubilee - Banjara Hills Connector',
    from: 'jubilee_hills',
    to: 'banjara_hills',
    distance: 3.6,
    speedLimit: 45,
    baseT0: 5.0,
    capacity: 1800,
    roadType: 'urban',
    coordinates: [
      [17.4319, 78.4073],
      [17.4235, 78.4210],
      [17.4156, 78.4350]
    ]
  },
  {
    id: 'rd_banjara_panjagutta',
    name: 'Road No. 1 Banjara Hills - Panjagutta Circle',
    from: 'banjara_hills',
    to: 'panjagutta',
    distance: 2.2,
    speedLimit: 45,
    baseT0: 3.2,
    capacity: 2000,
    roadType: 'urban',
    coordinates: [
      [17.4156, 78.4350],
      [17.4205, 78.4430],
      [17.4256, 78.4513]
    ]
  },
  {
    id: 'rd_mehdipatnam_banjara',
    name: 'Masab Tank - Banjara Hills Link',
    from: 'mehdipatnam',
    to: 'banjara_hills',
    distance: 3.4,
    speedLimit: 45,
    baseT0: 4.5,
    capacity: 1900,
    roadType: 'urban',
    coordinates: [
      [17.3916, 78.4418],
      [17.4040, 78.4380],
      [17.4156, 78.4350]
    ]
  },
  {
    id: 'rd_hitec_kukatpally',
    name: 'KPHB - Cyber Towers Flyover Link',
    from: 'hitec_city',
    to: 'kukatpally',
    distance: 5.1,
    speedLimit: 55,
    baseT0: 5.8,
    capacity: 2600,
    roadType: 'arterial',
    coordinates: [
      [17.4504, 78.3808],
      [17.4690, 78.3950],
      [17.4875, 78.4089]
    ]
  }
];
