export interface NewsItem {
  id: string;
  headline: string;
  body: string;
  region: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'port' | 'weather' | 'geopolitical' | 'logistics' | 'demand' | 'supplier' | 'disaster';
  affectedNodes: string[];
  impact: string;
}

export const PRESET_NEWS: NewsItem[] = [
  {
    id: 'news-1',
    headline: 'Typhoon Mawar Intensifies Near South China Sea',
    body: 'Category 4 storm approaching major shipping lanes. Expected grounding of all feeder vessels for 48 hours.',
    region: 'Asia Pacific',
    severity: 'high',
    category: 'weather',
    affectedNodes: ['SHZ', 'SGP', 'HKG'],
    impact: '+45% Transit Delay'
  },
  {
    id: 'news-2',
    headline: 'Labor Dispute at Rotterdam Port Escalates',
    body: 'Union negotiations have stalled. Limited operations at Terminals 3 and 4 starting tonight.',
    region: 'Europe',
    severity: 'medium',
    category: 'port',
    affectedNodes: ['RTM', 'AMS'],
    impact: '-30% Handling Capacity'
  },
  {
    id: 'news-3',
    headline: 'Semiconductor Raw Material Shortage Linked to Geopolitical Tensions',
    body: 'New export restrictions on key minerals used in substrate manufacturing are causing immediate price spikes.',
    region: 'Global',
    severity: 'high',
    category: 'geopolitical',
    affectedNodes: ['SHZ', 'TPE'],
    impact: '+25% Procurement Cost'
  },
  {
    id: 'news-4',
    headline: 'Suez Canal Maintenance Causes Minor Conjunction',
    body: 'Scheduled dredging at the southern entrance is restricting vessel size to Panamax units only until Friday.',
    region: 'Middle East',
    severity: 'low',
    category: 'logistics',
    affectedNodes: ['Suez'],
    impact: '+12h Buffer Added'
  },
  {
    id: 'news-5',
    headline: 'Demand Surge for Consumer Electronics in North America',
    body: 'Earlier-than-expected peak season demand is putting extreme pressure on West Coast air freight hubs.',
    region: 'North America',
    severity: 'medium',
    category: 'demand',
    affectedNodes: ['LAX', 'CHI', 'SFO'],
    impact: 'Capacity Shortage'
  },
  {
    id: 'news-6',
    headline: 'Major Supplier in Vietnam Files for Restructuring',
    body: 'Tier 2 textile and electronics component provider halts production across four facilities in Da Nang.',
    region: 'Asia Pacific',
    severity: 'critical',
    category: 'supplier',
    affectedNodes: ['DAD', 'SGP'],
    impact: 'Supply Link Broken'
  },
  {
    id: 'news-7',
    headline: 'Forest Fires Threaten Canadian Rail Corridors',
    body: 'Significant smoke and proximity of fires to main lines near Alberta are forcing speed reductions and re-routing.',
    region: 'North America',
    severity: 'medium',
    category: 'weather',
    affectedNodes: ['VAN', 'TOR'],
    impact: '+3d Lead Time'
  },
  {
    id: 'news-8',
    headline: 'European Energy Prices Cause Production Slowdown',
    body: 'Record high gas prices forcing German industrial hubs to implement limited 4-day shifts to manage costs.',
    region: 'Europe',
    severity: 'high',
    category: 'logistics',
    affectedNodes: ['FRA', 'MUC'],
    impact: '-20% Monthly Output'
  },
  {
    id: 'news-9',
    headline: 'Cyber Attack Hits Major Global Logistics Carrier',
    body: 'Ransomware attack has compromised tracking and clearing systems for a top-5 multimodal operator.',
    region: 'Global',
    severity: 'critical',
    category: 'logistics',
    affectedNodes: ['DXB', 'LHR', 'SYD'],
    impact: 'Data Invisibility'
  },
  {
    id: 'news-10',
    headline: 'Panama Canal Water Levels Hit Historic Lows',
    body: 'Prolonged drought leads to strict draft limits and fewer transit slots, affecting US East Coast trade.',
    region: 'Latin America',
    severity: 'high',
    category: 'weather',
    affectedNodes: ['PTY', 'NYC'],
    impact: '+14d Container Wait'
  },
  {
    id: 'news-11',
    headline: 'New Customs Regulations for Tech Imports in India',
    body: 'Sudden implementation of stricter quality certification is causing backlogs at New Delhi and Mumbai customs.',
    region: 'Asia Pacific',
    severity: 'medium',
    category: 'geopolitical',
    affectedNodes: ['DEL', 'BOM'],
    impact: '+5d Clearance delay'
  },
  {
    id: 'news-12',
    headline: 'Sudden Strike at Singapore Bunkering Facilities',
    body: 'Refueling operations for maritime vessels are severely hindered due to unplanned industrial action.',
    region: 'Asia Pacific',
    severity: 'medium',
    category: 'port',
    affectedNodes: ['SGP'],
    impact: 'Refueling Delays'
  },
  {
    id: 'news-13',
    headline: 'Heavy Snowfall Paralyzes Midwest Distribution Centers',
    body: 'Blizzard conditions in Illinois and Ohio have grounded truck fleets and closed major interstate junctions.',
    region: 'North America',
    severity: 'high',
    category: 'weather',
    affectedNodes: ['CHI', 'DET'],
    impact: 'Distribution Paralysis'
  },
  {
    id: 'news-14',
    headline: 'Trade Tariff Escalation on EV Components',
    body: 'New 25% import taxes on lithium-ion batteries and related technology are being debated in Brussels.',
    region: 'Global',
    severity: 'medium',
    category: 'geopolitical',
    affectedNodes: ['SHZ', 'FRA'],
    impact: '+25% Component Cost'
  },
  {
    id: 'news-15',
    headline: 'Port of Long Beach Dredging Project Delay',
    body: 'Environmental concerns have paused deep-water maintenance, limiting access for Neo-Panamax vessels.',
    region: 'North America',
    severity: 'low',
    category: 'port',
    affectedNodes: ['LAX'],
    impact: 'Draft Restrictions'
  },
  {
    id: 'news-16',
    headline: 'Demand Bubble in Pharmaceutical Supplies',
    body: 'Unprecedented global demand for new GLP-1 medications is causing a global air-freight shortage for cold chain.',
    region: 'Global',
    severity: 'high',
    category: 'demand',
    affectedNodes: ['FRA', 'NYC'],
    impact: 'Cold Chain Squeeze'
  },
  {
    id: 'news-17',
    headline: 'Earthquake Measurement Sparks Tsunami Warning in Japan',
    body: 'Magnitude 7.1 off the coast of Kyushu. Major ports in Chiba and Yokohama are on standby for evacuation.',
    region: 'Asia Pacific',
    severity: 'critical',
    category: 'disaster',
    affectedNodes: ['TYO', 'OSK'],
    impact: 'Immediate Shutdown'
  },
  {
    id: 'news-18',
    headline: 'Warehouse Automation Failure at Dubai Logistics Park',
    body: 'A centralized software glitch has halted all automated picking and sorting for 24 hours.',
    region: 'Middle East',
    severity: 'low',
    category: 'logistics',
    affectedNodes: ['DXB'],
    impact: '-60% Throughput'
  },
  {
    id: 'news-19',
    headline: 'Silk Road Rail Corridor Re-opening Partial',
    body: 'One track has been restored through Central Asia, allowing low-risk cargo to resume transit to Poland.',
    region: 'Europe',
    severity: 'low',
    category: 'geopolitical',
    affectedNodes: ['WAR', 'SHZ'],
    impact: 'Partial Restoration'
  },
  {
    id: 'news-20',
    headline: 'Brazil Port Workers Vote for National Strike',
    body: 'Santos and Paranagua ports face total shutdown as union seeks better safety protocols and wage increases.',
    region: 'Latin America',
    severity: 'high',
    category: 'port',
    affectedNodes: ['SSZ', 'SGP'],
    impact: 'Export Stagnation'
  },
  {
    id: 'news-21',
    headline: 'Singapore DC Reports Inventory Overstock',
    body: 'SGP warehouse stock levels reach 95% capacity, causing significant slowing of inbound processing.',
    region: 'Asia Pacific',
    severity: 'medium',
    category: 'demand',
    affectedNodes: ['SGP'],
    impact: 'Processing Slump'
  },
  {
    id: 'news-22',
    headline: 'Geopolitical Flare-up in Red Sea Shipping Lanes',
    body: 'Increased security risk to commercial vessels is forcing major carriers to re-route via the Cape of Good Hope.',
    region: 'Middle East',
    severity: 'critical',
    category: 'geopolitical',
    affectedNodes: ['DXB', 'FRA', 'SGP'],
    impact: '+12d & +$3500/FEU'
  },
  {
    id: 'news-23',
    headline: 'Flooding Hits Industrial Zones in Monterrey',
    body: 'Automotive and tech assembly plants are partially submerged after record rainfall in Northern Mexico.',
    region: 'Latin America',
    severity: 'high',
    category: 'weather',
    affectedNodes: ['MTY', 'LAX'],
    impact: 'Assembly Blockage'
  },
  {
    id: 'news-24',
    headline: 'Shanghai Port COVID-Zero Strategy Softens',
    body: 'Customs and terminal operations are returning to 90% workforce levels as health protocols are streamlined.',
    region: 'Asia Pacific',
    severity: 'low',
    category: 'geopolitical',
    affectedNodes: ['SHZ'],
    impact: '+15% Recovery'
  },
  {
    id: 'news-25',
    headline: 'Record Fuel Prices Drive Logistics Surcharges Up',
    body: 'Oil prices top $110/barrel, triggering automatic fuel adjustment factor increases for all air and sea freight.',
    region: 'Global',
    severity: 'medium',
    category: 'logistics',
    affectedNodes: ['DXB', 'CHI'],
    impact: '+12% Freight Cost'
  },
  {
    id: 'news-26',
    headline: 'Taiwan Semi Cluster Power Outage',
    body: 'Grid failure in Hsinchu Science Park disrupts delicate lithography processes, affecting global chip supply.',
    region: 'Asia Pacific',
    severity: 'critical',
    category: 'supplier',
    affectedNodes: ['SHZ', 'LAX'],
    impact: 'High-Value Stock Out'
  },
  {
    id: 'news-27',
    headline: 'London Heathrow Cargo Terminal Congestion',
    body: 'Combination of faulty scanning equipment and low staffing has caused a 4-mile truck queue at terminal 4.',
    region: 'Europe',
    severity: 'medium',
    category: 'port',
    affectedNodes: ['LHR', 'FRA'],
    impact: 'Flight Departure Delays'
  },
  {
    id: 'news-28',
    headline: 'South African Rail Operator Files for Protection',
    body: 'National freight rail infrastructure maintenance is suspended due to severe financial liquidity constraints.',
    region: 'Africa',
    severity: 'high',
    category: 'logistics',
    affectedNodes: ['JNB', 'CPT'],
    impact: 'Infrastructure Decay'
  },
  {
    id: 'news-29',
    headline: 'Renewable Tech Demand Outpaces Cobalt Supply',
    body: 'Battery manufacturers are fighting for limited cobalt refined in the DRC as EV production ramp-ups continue.',
    region: 'Global',
    severity: 'medium',
    category: 'demand',
    affectedNodes: ['FRA', 'SHZ'],
    impact: 'Material Allocations'
  },
  {
    id: 'news-30',
    headline: 'Cyber Attack on Panama Canal Booking System',
    body: 'Vessel scheduling has been moved to manual processing after a "denial of service" attack hit the portal.',
    region: 'Latin America',
    severity: 'high',
    category: 'logistics',
    affectedNodes: ['PTY'],
    impact: '+36h Transit delay'
  },
  {
    id: 'news-31',
    headline: 'US Port State Control Increases Safety Checks',
    body: 'Stricter inspections for aging cargo vessels are causing an average 24h delay for vessel berkthing in Los Angeles.',
    region: 'North America',
    severity: 'low',
    category: 'port',
    affectedNodes: ['LAX'],
    impact: 'Operational Friction'
  },
  {
    id: 'news-32',
    headline: 'Winter Storm "Yuri" Approaches NYC',
    body: 'Freezing rain and high winds expected to ground all cargo flights at JFK and Newark for at least 18 hours.',
    region: 'North America',
    severity: 'high',
    category: 'weather',
    affectedNodes: ['NYC', 'CHI'],
    impact: 'Air Freight Halt'
  },
  {
    id: 'news-33',
    headline: 'Sudden Regulatory Change on Chemical Storage in EU',
    body: 'New safety distance rules for hazardous material storage forcing immediate re-allocation of warehouse capacity.',
    region: 'Europe',
    severity: 'medium',
    category: 'geopolitical',
    affectedNodes: ['FRA', 'AMS'],
    impact: '-15% Storage Space'
  },
  {
    id: 'news-34',
    headline: 'Port of Mumbai Dredger Collision',
    body: 'Accident in the main navigation channel is restricting vessel traffic to one-way daylight hours only.',
    region: 'Asia Pacific',
    severity: 'medium',
    category: 'port',
    affectedNodes: ['BOM'],
    impact: 'Reduced Slot Access'
  },
  {
    id: 'news-35',
    headline: 'Supplier Factory Fire in Thailand',
    body: 'Major plastics and connector supplier facility in Rayong destroyed. Replacement lead time estimated at 6 months.',
    region: 'Asia Pacific',
    severity: 'critical',
    category: 'supplier',
    affectedNodes: ['BKK', 'SGP', 'SHZ'],
    impact: 'NPI Production Halt'
  },
  {
    id: 'news-36',
    headline: 'Dubai Sea-to-Air Bridge Optimization',
    body: 'New integrated customs portal reduces transshipment time for high-value cargo from Jebel Ali to DWC Airport.',
    region: 'Middle East',
    severity: 'low',
    category: 'logistics',
    affectedNodes: ['DXB'],
    impact: 'Faster Throughput'
  },
  {
    id: 'news-37',
    headline: 'Demand Surge for Heat Pumps in Europe',
    body: 'Extreme winter forecasts have triggered a massive wave of orders, clearing out all retail inventories.',
    region: 'Europe',
    severity: 'medium',
    category: 'demand',
    affectedNodes: ['FRA'],
    impact: 'Stock-out Risk'
  },
  {
    id: 'news-38',
    headline: 'Trade Pact Negotiations Collapse in SE Asia',
    body: 'Failed agreement leads to immediate sunset of reduced tariff lanes between Vietnam and Singapore.',
    region: 'Asia Pacific',
    severity: 'medium',
    category: 'geopolitical',
    affectedNodes: ['SGP', 'DAD'],
    impact: '+10% Import Fees'
  },
  {
    id: 'news-39',
    headline: 'Hurricane season forecast: More Intense',
    body: 'NOAA predicts an above-average hurricane season, raising insurance premiums for Atlantic container routes.',
    region: 'North America',
    severity: 'low',
    category: 'weather',
    affectedNodes: ['NYC', 'SAv'],
    impact: '+5% Insurance Cost'
  },
  {
    id: 'news-40',
    headline: 'Major Shipping Line Declares General Average',
    body: 'Vessel fire in the Mediterranean leads to legal pause on cargo release at Rotterdam and Marseille.',
    region: 'Europe',
    severity: 'high',
    category: 'logistics',
    affectedNodes: ['RTM', 'MRS'],
    impact: 'Cargo Sequestration'
  }
];
