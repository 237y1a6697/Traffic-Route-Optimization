/**
 * Nationwide Indian Geographic Dataset
 * Curated reference database of major Indian cities, state capitals, transport hubs,
 * national landmarks, and local urban centers across all 28 States and 8 Union Territories.
 * Used for instant, zero-latency geocoding autocomplete, offline resilience, and reference points.
 */
import { GeographicLocation } from '../../models/road';
import { HYDERABAD_LOCATIONS } from './hyderabadGeoData';

export const INDIA_BOUNDS = {
  minLat: 6.5,
  maxLat: 37.5,
  minLng: 68.0,
  maxLng: 97.5
};

export function isWithinIndia(lat: number, lng: number): boolean {
  return (
    lat >= INDIA_BOUNDS.minLat &&
    lat <= INDIA_BOUNDS.maxLat &&
    lng >= INDIA_BOUNDS.minLng &&
    lng <= INDIA_BOUNDS.maxLng
  );
}

export const MAJOR_INDIAN_LOCATIONS: GeographicLocation[] = [
  // ---------------------------------------------------------------------------
  // 1. NATIONAL CAPITAL & METROPOLITAN REGIONS
  // ---------------------------------------------------------------------------
  {
    id: 'new_delhi',
    name: 'New Delhi, National Capital Territory of Delhi, India',
    shortName: 'New Delhi',
    type: 'National Capital',
    lat: 28.6139,
    lng: 77.2090,
    keywords: ['new delhi', 'delhi', 'ncr', 'capital', 'india gate', 'connaught place']
  },
  {
    id: 'mumbai',
    name: 'Mumbai, Maharashtra, India',
    shortName: 'Mumbai',
    type: 'Financial Capital & Metro',
    lat: 19.0760,
    lng: 72.8777,
    keywords: ['mumbai', 'bombay', 'maharashtra', 'gateway of india', 'bandra', 'nariman point']
  },
  {
    id: 'bengaluru',
    name: 'Bengaluru (Bangalore), Karnataka, India',
    shortName: 'Bengaluru',
    type: 'Technology Hub & State Capital',
    lat: 12.9716,
    lng: 77.5946,
    keywords: ['bengaluru', 'bangalore', 'karnataka', 'silicon valley', 'electronic city', 'whitefield', 'koramangala']
  },
  {
    id: 'chennai',
    name: 'Chennai (Madras), Tamil Nadu, India',
    shortName: 'Chennai',
    type: 'State Capital & Metro',
    lat: 13.0827,
    lng: 80.2707,
    keywords: ['chennai', 'madras', 'tamil nadu', 'marina beach', 't nagar', 'guindy']
  },
  {
    id: 'kolkata',
    name: 'Kolkata (Calcutta), West Bengal, India',
    shortName: 'Kolkata',
    type: 'State Capital & Metro',
    lat: 22.5726,
    lng: 88.3639,
    keywords: ['kolkata', 'calcutta', 'west bengal', 'howrah', 'salt lake', 'park street']
  },
  {
    id: 'hyderabad_city',
    name: 'Hyderabad, Telangana, India',
    shortName: 'Hyderabad',
    type: 'State Capital & Technology Hub',
    lat: 17.3850,
    lng: 78.4867,
    keywords: ['hyderabad', 'telangana', 'charminar', 'cyberabad', 'hitec city', 'secunderabad']
  },

  // ---------------------------------------------------------------------------
  // 2. MAJOR STATE CAPITALS & REGIONAL HUBS
  // ---------------------------------------------------------------------------
  {
    id: 'ahmedabad',
    name: 'Ahmedabad, Gujarat, India',
    shortName: 'Ahmedabad',
    type: 'Commercial Capital',
    lat: 23.0225,
    lng: 72.5714,
    keywords: ['ahmedabad', 'gujarat', 'gandhinagar', 'sabarmati', 'sg highway']
  },
  {
    id: 'jaipur',
    name: 'Jaipur, Rajasthan, India',
    shortName: 'Jaipur',
    type: 'State Capital (Pink City)',
    lat: 26.9124,
    lng: 75.7873,
    keywords: ['jaipur', 'rajasthan', 'pink city', 'hawa mahal', 'amer']
  },
  {
    id: 'pune',
    name: 'Pune, Maharashtra, India',
    shortName: 'Pune',
    type: 'Automotive & IT Hub',
    lat: 18.5204,
    lng: 73.8567,
    keywords: ['pune', 'maharashtra', 'hinjawadi', 'kothrud', 'viman nagar', 'shivajinagar']
  },
  {
    id: 'lucknow',
    name: 'Lucknow, Uttar Pradesh, India',
    shortName: 'Lucknow',
    type: 'State Capital',
    lat: 26.8467,
    lng: 80.9462,
    keywords: ['lucknow', 'uttar pradesh', 'hazratganj', 'gomti nagar']
  },
  {
    id: 'chandigarh',
    name: 'Chandigarh, Union Territory, India',
    shortName: 'Chandigarh',
    type: 'Joint State Capital',
    lat: 30.7333,
    lng: 76.7794,
    keywords: ['chandigarh', 'punjab', 'haryana', 'mohali', 'panchkula']
  },
  {
    id: 'kochi',
    name: 'Kochi (Cochin), Kerala, India',
    shortName: 'Kochi',
    type: 'Commercial Port & Tech City',
    lat: 9.9312,
    lng: 76.2673,
    keywords: ['kochi', 'cochin', 'kerala', 'ernakulam', 'kakkanad', 'marine drive']
  },
  {
    id: 'thiruvananthapuram',
    name: 'Thiruvananthapuram (Trivandrum), Kerala, India',
    shortName: 'Thiruvananthapuram',
    type: 'State Capital',
    lat: 8.5241,
    lng: 76.9366,
    keywords: ['thiruvananthapuram', 'trivandrum', 'kerala', 'technopark']
  },
  {
    id: 'vijayawada',
    name: 'Vijayawada, Andhra Pradesh, India',
    shortName: 'Vijayawada',
    type: 'Commercial Hub',
    lat: 16.5062,
    lng: 80.6480,
    keywords: ['vijayawada', 'andhra pradesh', 'amaravati', 'benz circle', 'krishna river']
  },
  {
    id: 'visakhapatnam',
    name: 'Visakhapatnam (Vizag), Andhra Pradesh, India',
    shortName: 'Visakhapatnam',
    type: 'Port City & Industrial Center',
    lat: 17.6868,
    lng: 83.2185,
    keywords: ['visakhapatnam', 'vizag', 'andhra pradesh', 'rk beach', 'gajuwaka']
  },
  {
    id: 'guwahati',
    name: 'Guwahati, Assam, India',
    shortName: 'Guwahati',
    type: 'Gateway to Northeast India',
    lat: 26.1445,
    lng: 91.7362,
    keywords: ['guwahati', 'assam', 'dispur', 'kamakhya', 'paltan bazaar']
  },
  {
    id: 'shillong',
    name: 'Shillong, Meghalaya, India',
    shortName: 'Shillong',
    type: 'State Capital',
    lat: 25.5788,
    lng: 91.8933,
    keywords: ['shillong', 'meghalaya', 'police bazar', 'scotland of the east']
  },
  {
    id: 'bhopal',
    name: 'Bhopal, Madhya Pradesh, India',
    shortName: 'Bhopal',
    type: 'State Capital',
    lat: 23.2599,
    lng: 77.4126,
    keywords: ['bhopal', 'madhya pradesh', 'lake city']
  },
  {
    id: 'indore',
    name: 'Indore, Madhya Pradesh, India',
    shortName: 'Indore',
    type: 'Commercial Capital',
    lat: 22.7196,
    lng: 75.8577,
    keywords: ['indore', 'madhya pradesh', 'vijay nagar', 'rajwada']
  },
  {
    id: 'patna',
    name: 'Patna, Bihar, India',
    shortName: 'Patna',
    type: 'State Capital',
    lat: 25.5941,
    lng: 85.1376,
    keywords: ['patna', 'bihar', 'dak bungalow', 'boring road']
  },
  {
    id: 'bhubaneswar',
    name: 'Bhubaneswar, Odisha, India',
    shortName: 'Bhubaneswar',
    type: 'State Capital',
    lat: 20.2961,
    lng: 85.8245,
    keywords: ['bhubaneswar', 'odisha', 'temple city', 'saheed nagar']
  },
  {
    id: 'dehradun',
    name: 'Dehradun, Uttarakhand, India',
    shortName: 'Dehradun',
    type: 'State Capital',
    lat: 30.3165,
    lng: 78.0322,
    keywords: ['dehradun', 'uttarakhand', 'clock tower', 'rajpur road', 'mussoorie gateway']
  },
  {
    id: 'shimla',
    name: 'Shimla, Himachal Pradesh, India',
    shortName: 'Shimla',
    type: 'State Capital',
    lat: 31.1048,
    lng: 77.1734,
    keywords: ['shimla', 'himachal pradesh', 'mall road', 'ridge']
  },
  {
    id: 'srinagar',
    name: 'Srinagar, Jammu & Kashmir, India',
    shortName: 'Srinagar',
    type: 'Summer Capital',
    lat: 34.0837,
    lng: 74.7973,
    keywords: ['srinagar', 'jammu and kashmir', 'dal lake', 'lal chowk']
  },
  {
    id: 'ranchi',
    name: 'Ranchi, Jharkhand, India',
    shortName: 'Ranchi',
    type: 'State Capital',
    lat: 23.3441,
    lng: 85.3096,
    keywords: ['ranchi', 'jharkhand', 'main road']
  },
  {
    id: 'raipur',
    name: 'Raipur, Chhattisgarh, India',
    shortName: 'Raipur',
    type: 'State Capital',
    lat: 21.2514,
    lng: 81.6296,
    keywords: ['raipur', 'chhattisgarh', 'nava raipur']
  },
  {
    id: 'panaji',
    name: 'Panaji, Goa, India',
    shortName: 'Panaji',
    type: 'State Capital',
    lat: 15.4909,
    lng: 73.8278,
    keywords: ['panaji', 'panjim', 'goa', 'miramar', 'mandovi']
  },
  {
    id: 'surat',
    name: 'Surat, Gujarat, India',
    shortName: 'Surat',
    type: 'Textile & Diamond City',
    lat: 21.1702,
    lng: 72.8311,
    keywords: ['surat', 'gujarat', 'varachha', 'adajan']
  },
  {
    id: 'nagpur',
    name: 'Nagpur, Maharashtra, India',
    shortName: 'Nagpur',
    type: 'Winter Capital & Center Point',
    lat: 21.1458,
    lng: 79.0882,
    keywords: ['nagpur', 'maharashtra', 'zero mile', 'sitabuldi']
  },
  {
    id: 'coimbatore',
    name: 'Coimbatore, Tamil Nadu, India',
    shortName: 'Coimbatore',
    type: 'Industrial Hub',
    lat: 11.0168,
    lng: 76.9558,
    keywords: ['coimbatore', 'tamil nadu', 'rs puram', 'gandhipuram']
  },
  {
    id: 'madurai',
    name: 'Madurai, Tamil Nadu, India',
    shortName: 'Madurai',
    type: 'Heritage Center',
    lat: 9.9252,
    lng: 78.1198,
    keywords: ['madurai', 'tamil nadu', 'meenakshi amman']
  },
  {
    id: 'mysuru',
    name: 'Mysuru (Mysore), Karnataka, India',
    shortName: 'Mysuru',
    type: 'Heritage City',
    lat: 12.2958,
    lng: 76.6394,
    keywords: ['mysuru', 'mysore', 'karnataka', 'palace']
  },
  {
    id: 'mangalore',
    name: 'Mangaluru (Mangalore), Karnataka, India',
    shortName: 'Mangaluru',
    type: 'Coastal Port City',
    lat: 12.9141,
    lng: 74.8560,
    keywords: ['mangaluru', 'mangalore', 'karnataka', 'panambur']
  },
  {
    id: 'varanasi',
    name: 'Varanasi (Benares), Uttar Pradesh, India',
    shortName: 'Varanasi',
    type: 'Cultural & Spiritual Hub',
    lat: 25.3176,
    lng: 82.9739,
    keywords: ['varanasi', 'benares', 'kashi', 'uttar pradesh', 'ghats']
  },
  {
    id: 'agra',
    name: 'Agra, Uttar Pradesh, India',
    shortName: 'Agra',
    type: 'Heritage City',
    lat: 27.1767,
    lng: 78.0081,
    keywords: ['agra', 'uttar pradesh', 'taj mahal']
  },
  {
    id: 'amritsar',
    name: 'Amritsar, Punjab, India',
    shortName: 'Amritsar',
    type: 'Cultural Center',
    lat: 31.6340,
    lng: 74.8723,
    keywords: ['amritsar', 'punjab', 'golden temple']
  },
  {
    id: 'udaipur',
    name: 'Udaipur, Rajasthan, India',
    shortName: 'Udaipur',
    type: 'City of Lakes',
    lat: 24.5854,
    lng: 73.7125,
    keywords: ['udaipur', 'rajasthan', 'lake pichola']
  },

  // ---------------------------------------------------------------------------
  // 3. MAJOR AIRPORTS & HIGHWAY HUBS
  // ---------------------------------------------------------------------------
  {
    id: 'delhi_airport',
    name: 'Indira Gandhi International Airport (DEL), New Delhi, India',
    shortName: 'IGI Airport, New Delhi',
    type: 'International Airport',
    lat: 28.5562,
    lng: 77.1000,
    keywords: ['delhi airport', 'igi airport', 'terminal 3', 't3 delhi', 'del']
  },
  {
    id: 'mumbai_airport',
    name: 'Chhatrapati Shivaji Maharaj International Airport (BOM), Mumbai, India',
    shortName: 'CSMI Airport, Mumbai',
    type: 'International Airport',
    lat: 19.0896,
    lng: 72.8656,
    keywords: ['mumbai airport', 'csmi airport', 't2 mumbai', 'sahar', 'bom']
  },
  {
    id: 'bengaluru_airport',
    name: 'Kempegowda International Airport (BLR), Bengaluru, Karnataka, India',
    shortName: 'Kempegowda Airport, Bengaluru',
    type: 'International Airport',
    lat: 13.1986,
    lng: 77.7066,
    keywords: ['bangalore airport', 'bengaluru airport', 'kia', 'devanahalli', 'blr']
  },
  {
    id: 'hyderabad_airport',
    name: 'Rajiv Gandhi International Airport (HYD), Shamshabad, Hyderabad, India',
    shortName: 'RGIA Airport, Hyderabad',
    type: 'International Airport',
    lat: 17.2403,
    lng: 78.4294,
    keywords: ['rgia airport', 'shamshabad airport', 'hyderabad airport', 'hyd']
  },
  {
    id: 'chennai_airport',
    name: 'Chennai International Airport (MAA), Meenambakkam, Chennai, India',
    shortName: 'Chennai Airport',
    type: 'International Airport',
    lat: 12.9941,
    lng: 80.1709,
    keywords: ['chennai airport', 'meenambakkam airport', 'maa']
  },
  {
    id: 'kolkata_airport',
    name: 'Netaji Subhash Chandra Bose International Airport (CCU), Kolkata, India',
    shortName: 'NSCB Airport, Kolkata',
    type: 'International Airport',
    lat: 22.6520,
    lng: 88.4463,
    keywords: ['kolkata airport', 'dum dum airport', 'ccu']
  },
  {
    id: 'kochi_airport',
    name: 'Cochin International Airport (COK), Nedumbassery, Kochi, Kerala, India',
    shortName: 'Cochin Airport',
    type: 'International Airport',
    lat: 10.1518,
    lng: 76.3930,
    keywords: ['cochin airport', 'nedumbassery airport', 'kochi airport', 'cok']
  }
];

// Combine Nationwide Dataset with full curated Hyderabad road network locations
export const ALL_INDIA_LOCATIONS: GeographicLocation[] = [
  ...MAJOR_INDIAN_LOCATIONS,
  ...HYDERABAD_LOCATIONS
];

export const INDIA_LOCATIONS = ALL_INDIA_LOCATIONS;
