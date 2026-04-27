/**
 * Knowledge Fortress Game Logic
 * Ported from vanilla JS to TypeScript module
 */

import { GoogleGenAI } from '@google/genai';

export function initGameLogic() {
  // --- Constants & Data ---
  const COLS = 18;
  const ROWS = 11;
  const MAXWAVES = 12;

  const DIFFS: any = {
    easy: { label: 'Easy', icon: '🟢', hp: 25, spdMult: .72, hpMult: 0.8, qtime: 22, desc: '25 HP · Slow · 22s to answer' },
    normal: { label: 'Normal', icon: '🟡', hp: 20, spdMult: 1, hpMult: 1.0, qtime: 16, desc: '20 HP · Standard · 16s' },
    hard: { label: 'Hard', icon: '🔴', hp: 15, spdMult: 1.4, hpMult: 1.3, qtime: 10, desc: '15 HP · Fast · 10s' }
  };

  const TDEFS = [
    { 
      id: 'archer', name: 'Archer', icon: '🏹', cost: 40, dmg: 10, rng: 3.2, rate: 760, color: '#3b82f6', desc: 'Fast single-target', key: '1',
      ability: { name: 'Volley', icon: '🌧️', desc: 'Fires 5 arrows instantly', cd: 15 },
      paths: [
        { name: 'Sharpshooter', icon: '🎯', desc: 'Massive Range & DMG', mod: { dmg: 1.6, rng: 1.4, rate: 1.0 } },
        { name: 'Rapid Fire', icon: '🏹', desc: 'Extreme Attack Speed', mod: { dmg: 0.9, rng: 1.0, rate: 0.5 } }
      ]
    },
    { 
      id: 'cannon', name: 'Cannon', icon: '💣', cost: 80, dmg: 38, rng: 2.6, rate: 2100, color: '#ef4444', desc: 'Slow AoE splash', key: '2', splash: 1.3,
      ability: { name: 'Big One', icon: '💥', desc: 'Massive explosion', cd: 20 },
      paths: [
        { name: 'Heavy Shells', icon: '💥', desc: 'Huge Splash & DMG', mod: { dmg: 1.5, rng: 1.1, rate: 1.2, splash: 1.8 } },
        { name: 'Cluster Bomb', icon: '💣', desc: 'Faster reload', mod: { dmg: 1.0, rng: 1.0, rate: 0.6, splash: 1.0 } }
      ]
    },
    { 
      id: 'frost', name: 'Frost', icon: '❄️', cost: 60, dmg: 7, rng: 3.6, rate: 960, color: '#06b6d4', desc: 'Slows enemies', key: '3', slow: true,
      ability: { name: 'Blizzard', icon: '🌨️', desc: 'Freezes nearby enemies', cd: 18 },
      paths: [
        { name: 'Deep Freeze', icon: '🧊', desc: 'Stronger Slow', mod: { dmg: 1.2, rng: 1.1, rate: 1.0, slowPower: 0.3 } },
        { name: 'Arctic Blast', icon: '🌬️', desc: 'Wider Slow Area', mod: { dmg: 1.0, rng: 1.4, rate: 0.9 } }
      ]
    },
    { 
      id: 'zap', name: 'Zap', icon: '⚡', cost: 100, dmg: 20, rng: 4.2, rate: 1360, color: '#a855f7', desc: 'Chains to 2 nearby', key: '4', chain: 2,
      ability: { name: 'Surge', icon: '🌩️', desc: 'Double attack speed for 5s', cd: 25 },
      paths: [
        { name: 'High Voltage', icon: '🔋', desc: 'More Chain Targets', mod: { dmg: 1.1, rng: 1.2, rate: 1.0, chain: 4 } },
        { name: 'Overload', icon: '⚡', desc: 'Higher DMG per hit', mod: { dmg: 1.8, rng: 1.0, rate: 1.1 } }
      ]
    },
    { 
      id: 'sniper', name: 'Sniper', icon: '🎯', cost: 120, dmg: 55, rng: 6.0, rate: 2900, color: '#f59e0b', desc: 'Extreme range', key: '5', sniper: true,
      ability: { name: 'Assassinate', icon: '🩸', desc: 'Massive damage to strongest', cd: 30 },
      paths: [
        { name: 'Assassin', icon: '💀', desc: 'One-shot potential', mod: { dmg: 2.5, rng: 1.1, rate: 1.4 } },
        { name: 'Eagle Eye', icon: '👁️', desc: 'Global-ish Range', mod: { dmg: 1.0, rng: 2.2, rate: 1.0 } }
      ]
    },
    { 
      id: 'poison', name: 'Poison', icon: '☠️', cost: 90, dmg: 8, rng: 3.0, rate: 1100, color: '#22c55e', desc: 'Poisons over time', key: '6', poison: true,
      ability: { name: 'Epidemic', icon: '🦠', desc: 'Poisons all enemies', cd: 22 },
      paths: [
        { name: 'Toxic Cloud', icon: '☁️', desc: 'AoE Poisoning', mod: { dmg: 1.3, rng: 1.2, rate: 1.0, poisonAoE: 1.2 } },
        { name: 'Neurotoxin', icon: '🧠', desc: 'Slows poisoned targets', mod: { dmg: 1.0, rng: 1.0, rate: 0.8, poisonSlow: 0.6 } }
      ]
    }
  ];

  const UMULT = [1, 1.45, 2.0, 2.7];

  const EDEFS = [
    { id: 'slime', icon: '🟢', hp: 30, spd: 1.30, rew: 4, sz: .70 },
    { id: 'goblin', icon: '👾', hp: 50, spd: 1.10, rew: 7, sz: .80 },
    { id: 'orc', icon: '👹', hp: 90, spd: .72, rew: 13, sz: 1.00 },
    { id: 'bat', icon: '🦇', hp: 35, spd: 2.30, rew: 6, sz: .65, flying: true },
    { id: 'skeleton', icon: '💀', hp: 60, spd: 1.25, rew: 9, sz: .85 },
    { id: 'troll', icon: '🧌', hp: 180, spd: .52, rew: 24, sz: 1.15 },
    { id: 'witch', icon: '🧙', hp: 70, spd: 1.40, rew: 14, sz: .90, healer: true },
    { id: 'knight', icon: '🛡️', hp: 240, spd: .65, rew: 30, sz: 1.05, armored: true },
    { id: 'spider', icon: '🕷️', hp: 45, spd: 1.80, rew: 6, sz: .75 },
    { id: 'ghost', icon: '👻', hp: 40, spd: 2.50, rew: 8, sz: .80, flying: true },
    { id: 'assassin', icon: '🥷', hp: 85, spd: 2.10, rew: 15, sz: .90 },
    { id: 'gargoyle', icon: '🗿', hp: 160, spd: 1.50, rew: 20, sz: 1.0, flying: true, armored: true },
    { id: 'golem', icon: '🪨', hp: 400, spd: .40, rew: 40, sz: 1.25, armored: true },
    { id: 'dragon', icon: '🐉', hp: 360, spd: .48, rew: 55, sz: 1.35, boss: true, flying: true },
    { id: 'lich', icon: '🧟', hp: 560, spd: .60, rew: 85, sz: 1.45, boss: true }
  ];

  const POWERUPS = [
    { id: 'freeze', icon: '🧊', name: 'Freeze', tip: 'Freezes all enemies 3.5s' },
    { id: 'gold', icon: '💎', name: 'Gold+', tip: '+60 bonus gold' },
    { id: 'heal', icon: '💚', name: 'Repair', tip: 'Restore 3 HP' },
    { id: 'boost', icon: '🚀', name: 'Boost', tip: '2× tower speed 6s' },
    { id: 'nuke', icon: '☢️', name: 'Nuke', tip: '60 dmg to ALL enemies' }
  ];

  const QBANKS: any = {
    energy: {
      name: '⚡ Energy & Environment', desc: 'Renewable energy & climate', questions: [
        { q: 'Primary source of energy for Earth?', a: 'The Sun', wrong: ['Wind', 'Water', 'Coal'], explain: 'The Sun provides nearly all of Earth\'s energy through light and heat; even wind and water power ultimately trace back to solar energy.' },
        { q: 'What does a wind turbine convert wind into?', a: 'Electricity', wrong: ['Heat', 'Light', 'Sound'], explain: 'Wind turbines use spinning blades to turn a generator, converting the kinetic energy of moving air directly into electrical energy.' },
        { q: 'Unit of measurement for energy?', a: 'Joule', wrong: ['Watt', 'Volt', 'Ampere'], explain: 'The Joule (J) is the SI unit of energy; a Watt measures power (energy per second), not energy itself.' },
        { q: 'Solar panels convert sunlight into?', a: 'Electricity', wrong: ['Heat only', 'Sound', 'Wind'], explain: 'Photovoltaic solar panels use the photoelectric effect — photons knock electrons free in silicon cells, generating an electric current.' },
        { q: 'What type of energy does a moving car have?', a: 'Kinetic energy', wrong: ['Potential', 'Chemical', 'Sound'], explain: 'Kinetic energy is the energy of motion; any moving object has it, and it increases with both mass and speed.' },
        { q: 'Which is a renewable energy source?', a: 'Solar power', wrong: ['Coal', 'Natural gas', 'Oil'], explain: 'Solar power is renewable because the Sun continuously radiates energy; coal, oil, and gas are finite fossil fuels that take millions of years to form.' },
        { q: 'Main greenhouse gas from fossil fuels?', a: 'Carbon dioxide', wrong: ['Oxygen', 'Nitrogen', 'Helium'], explain: 'Burning fossil fuels releases CO₂ stored over millions of years; this extra CO₂ traps more heat in the atmosphere, driving climate change.' },
        { q: 'Which energy creates the most air pollution?', a: 'Coal', wrong: ['Solar', 'Wind', 'Hydro'], explain: 'Coal combustion releases CO₂, sulfur dioxide, nitrogen oxides, and particulates; solar, wind, and hydro produce zero emissions during operation.' },
        { q: 'Hydroelectric power uses what?', a: 'Flowing water', wrong: ['Hot steam', 'Wind', 'Sunlight'], explain: 'Hydroelectric plants capture the potential energy of water held at height; as it flows down through turbines, that energy becomes electricity.' },
        { q: 'What layer traps heat in Earth\'s atmosphere?', a: 'Greenhouse gas layer', wrong: ['Ozone layer', 'Stratosphere', 'Ionosphere'], explain: 'Greenhouse gases like CO₂ and water vapor absorb outgoing infrared radiation and re-emit it, warming the surface — the greenhouse effect.' },
        { q: 'What type of energy is stored in food?', a: 'Chemical energy', wrong: ['Kinetic', 'Nuclear', 'Solar'], explain: 'Food stores energy in chemical bonds within molecules like glucose; your cells release this energy through cellular respiration.' },
        { q: 'A stretched rubber band stores what energy?', a: 'Elastic potential energy', wrong: ['Kinetic', 'Thermal', 'Sound'], explain: 'Elastic potential energy is stored when an elastic material is deformed; it converts to kinetic energy when released.' }
      ]
    },
    math: {
      name: '➕ Math Essentials', desc: 'Arithmetic, algebra, geometry', questions: [
        { q: 'What is 7 × 8?', a: '56', wrong: ['48', '54', '63'], explain: '7 × 8 = 56; a handy trick is 7 × 8 = 7 × (4 × 2) = 28 × 2 = 56.' },
        { q: 'What is 15% of 200?', a: '30', wrong: ['15', '25', '35'], explain: '15% of 200 = 0.15 × 200 = 30; or find 10% (= 20) then add half of that (10), giving 30.' },
        { q: 'Simplify: 3/6', a: '1/2', wrong: ['1/3', '2/3', '3/4'], explain: 'Divide numerator and denominator by their GCD (3): 3 ÷ 3 = 1 and 6 ÷ 3 = 2, so 3/6 = 1/2.' },
        { q: 'Square root of 144?', a: '12', wrong: ['11', '13', '14'], explain: '12 × 12 = 144, so √144 = 12; 144 is a perfect square.' },
        { q: 'Solve: x + 5 = 12', a: 'x = 7', wrong: ['x = 5', 'x = 6', 'x = 17'], explain: 'Subtract 5 from both sides: x = 12 − 5 = 7.' },
        { q: 'What is 2³?', a: '8', wrong: ['6', '9', '12'], explain: '2³ means 2 × 2 × 2 = 4 × 2 = 8; the exponent tells you how many times to multiply the base by itself.' },
        { q: 'Area of a 5×9 rectangle?', a: '45 sq units', wrong: ['14 sq units', '28 sq units', '36 sq units'], explain: 'Area = length × width = 5 × 9 = 45 square units; perimeter would be 2(5 + 9) = 28.' },
        { q: 'What percent is 3 out of 12?', a: '25%', wrong: ['30%', '33%', '40%'], explain: '(3 ÷ 12) × 100 = 0.25 × 100 = 25%; 3 is one quarter of 12.' },
        { q: '0.75 as a fraction?', a: '3/4', wrong: ['1/4', '2/3', '4/5'], explain: '0.75 = 75/100; simplify by dividing by 25 to get 3/4.' },
        { q: 'Perimeter of a square with side 6?', a: '24', wrong: ['12', '18', '36'], explain: 'A square has 4 equal sides: P = 4 × 6 = 24; area would be 6² = 36.' },
        { q: 'Next prime after 7?', a: '11', wrong: ['8', '9', '10'], explain: '8 = 2³, 9 = 3², 10 = 2×5 are all composite; 11 has no divisors except 1 and itself, making it prime.' },
        { q: 'What is -3 + 8?', a: '5', wrong: ['-5', '11', '-11'], explain: 'Start at -3 and add 8; moving 8 steps right on a number line lands on 5.' }
      ]
    },
    history: {
      name: '🏛️ World History', desc: 'Ancient civilizations to modern era', questions: [
        { q: 'Who was the first President of the USA?', a: 'George Washington', wrong: ['Thomas Jefferson', 'Abraham Lincoln', 'John Adams'], explain: 'George Washington served as the first US President (1789–1797); he was unanimously elected by the Electoral College both terms.' },
        { q: 'In what year did World War II end?', a: '1945', wrong: ['1918', '1939', '1955'], explain: 'WWII ended in 1945: Germany surrendered in May (V-E Day) and Japan in September (V-J Day) after atomic bombs were dropped on Hiroshima and Nagasaki.' },
        { q: 'Which civilization built the pyramids?', a: 'Ancient Egyptians', wrong: ['Romans', 'Greeks', 'Mayans'], explain: 'The Great Pyramid of Giza was built around 2560 BCE by the Ancient Egyptians as tombs for pharaohs, using tens of thousands of workers.' },
        { q: 'Who painted the Mona Lisa?', a: 'Leonardo da Vinci', wrong: ['Michelangelo', 'Vincent van Gogh', 'Pablo Picasso'], explain: 'Leonardo da Vinci painted the Mona Lisa between 1503–1519; the subject is believed to be Lisa Gherardini, wife of a Florentine merchant.' },
        { q: 'What was the name of the ship that brought the Pilgrims?', a: 'Mayflower', wrong: ['Santa Maria', 'Beagle', 'Endeavour'], explain: 'The Mayflower carried 102 Pilgrims from England to Plymouth, Massachusetts in 1620, where they signed the Mayflower Compact.' },
        { q: 'Which empire was ruled by Julius Caesar?', a: 'Roman Empire', wrong: ['Ottoman Empire', 'British Empire', 'Mongol Empire'], explain: 'Julius Caesar was a Roman general and dictator; he was assassinated in 44 BCE, and his adopted son Augustus became the first Roman Emperor.' },
        { q: 'Who discovered penicillin?', a: 'Alexander Fleming', wrong: ['Marie Curie', 'Louis Pasteur', 'Isaac Newton'], explain: 'Alexander Fleming discovered penicillin in 1928 when he noticed mold killing bacteria in a petri dish, revolutionizing medicine.' },
        { q: 'What wall fell in 1989?', a: 'Berlin Wall', wrong: ['Great Wall of China', 'Hadrian\'s Wall', 'Western Wall'], explain: 'The Berlin Wall divided East and West Berlin from 1961–1989; its fall symbolized the end of the Cold War and German reunification followed in 1990.' },
        { q: 'Who wrote "Romeo and Juliet"?', a: 'William Shakespeare', wrong: ['Charles Dickens', 'Jane Austen', 'Mark Twain'], explain: 'Shakespeare wrote Romeo and Juliet around 1594–1596; it\'s one of the most performed plays in history and a foundational work of English literature.' },
        { q: 'What ancient city was destroyed by Mount Vesuvius?', a: 'Pompeii', wrong: ['Athens', 'Troy', 'Sparta'], explain: 'Mount Vesuvius erupted in 79 CE, burying Pompeii in volcanic ash; the preserved city was rediscovered in the 18th century and is now a UNESCO site.' }
      ]
    },
    science: {
      name: '🔬 General Science', desc: 'Biology, chemistry, physics', questions: [
        { q: 'What is the chemical symbol for water?', a: 'H2O', wrong: ['CO2', 'O2', 'NaCl'], explain: 'Water is H₂O — two hydrogen atoms bonded to one oxygen atom; this bent molecular shape gives water its unique properties like surface tension.' },
        { q: 'What planet is known as the Red Planet?', a: 'Mars', wrong: ['Venus', 'Jupiter', 'Saturn'], explain: 'Mars appears red because its surface is rich in iron oxide (rust); it has the largest volcano in the solar system, Olympus Mons.' },
        { q: 'What is the hardest natural substance on Earth?', a: 'Diamond', wrong: ['Gold', 'Iron', 'Quartz'], explain: 'Diamond scores 10 on the Mohs hardness scale; it\'s made of carbon atoms in a crystal lattice — the same element as graphite, just structured differently.' },
        { q: 'How many bones are in the adult human body?', a: '206', wrong: ['106', '306', '406'], explain: 'Adults have 206 bones; babies are born with ~270 and many fuse together as they grow, especially in the skull and spine.' },
        { q: 'What gas do plants absorb from the atmosphere?', a: 'Carbon Dioxide', wrong: ['Oxygen', 'Nitrogen', 'Hydrogen'], explain: 'Plants absorb CO₂ during photosynthesis and use sunlight to convert it and water into glucose and oxygen — the reverse of what animals do.' },
        { q: 'What is the center of an atom called?', a: 'Nucleus', wrong: ['Electron', 'Proton', 'Neutron'], explain: 'The nucleus contains protons and neutrons packed tightly together; electrons orbit the nucleus in energy levels (shells) at much greater distances.' },
        { q: 'What force keeps us on the ground?', a: 'Gravity', wrong: ['Magnetism', 'Friction', 'Inertia'], explain: 'Gravity is an attractive force between masses; Earth\'s mass pulls everything toward its center with an acceleration of ~9.8 m/s².' },
        { q: 'What is the largest organ in the human body?', a: 'Skin', wrong: ['Heart', 'Liver', 'Brain'], explain: 'Skin covers the entire body and averages 2 square meters in adults; it regulates temperature, prevents infection, and senses touch.' },
        { q: 'What part of the plant conducts photosynthesis?', a: 'Leaf', wrong: ['Root', 'Stem', 'Flower'], explain: 'Leaves contain chloroplasts filled with chlorophyll — the green pigment that captures sunlight to power photosynthesis.' },
        { q: 'At what temperature does water boil (Celsius)?', a: '100°C', wrong: ['0°C', '50°C', '212°C'], explain: 'Water boils at 100°C (212°F) at sea level; at higher altitudes where pressure is lower, it boils at a lower temperature.' }
      ]
    },
    geography: {
      name: '🌍 Geography', desc: 'Continents, countries, oceans', questions: [
        { q: 'What is the largest continent?', a: 'Asia', wrong: ['Africa', 'North America', 'Europe'], explain: 'Asia covers about 44.5 million km² — roughly 30% of Earth\'s total land area — and is home to about 60% of the world\'s population.' },
        { q: 'What is the longest river in the world?', a: 'Nile', wrong: ['Amazon', 'Yangtze', 'Mississippi'], explain: 'The Nile stretches about 6,650 km through northeastern Africa; the Amazon is close and carries far more water, making the ranking sometimes debated.' },
        { q: 'Which ocean is the largest?', a: 'Pacific Ocean', wrong: ['Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean'], explain: 'The Pacific Ocean covers over 165 million km² — larger than all of Earth\'s landmasses combined — and contains the Mariana Trench, the deepest point on Earth.' },
        { q: 'What is the capital of Japan?', a: 'Tokyo', wrong: ['Beijing', 'Seoul', 'Bangkok'], explain: 'Tokyo became Japan\'s capital in 1869; with ~37 million people in its metro area, it is the most populous metropolitan area in the world.' },
        { q: 'Which country has the most population?', a: 'India', wrong: ['China', 'USA', 'Indonesia'], explain: 'India surpassed China in 2023 to become the world\'s most populous country, with over 1.4 billion people.' },
        { q: 'What is the smallest country in the world?', a: 'Vatican City', wrong: ['Monaco', 'San Marino', 'Liechtenstein'], explain: 'Vatican City covers just 0.44 km² inside Rome; it\'s the headquarters of the Catholic Church and has a population of about 800 people.' },
        { q: 'Mount Everest is located in which mountain range?', a: 'Himalayas', wrong: ['Andes', 'Alps', 'Rockies'], explain: 'The Himalayas span five countries; Mount Everest at 8,848.86 m is the highest peak and sits on the Nepal-Tibet border.' },
        { q: 'What desert covers much of northern Africa?', a: 'Sahara', wrong: ['Gobi', 'Kalahari', 'Mojave'], explain: 'The Sahara is the world\'s largest hot desert at ~9.2 million km²; despite its heat, it experiences cold nights and even occasional snowfall.' },
        { q: 'Which country is also a continent?', a: 'Australia', wrong: ['Russia', 'Canada', 'Brazil'], explain: 'Australia is both the world\'s sixth-largest country and the smallest continent; it\'s the only country to occupy an entire continent.' },
        { q: 'What is the capital of France?', a: 'Paris', wrong: ['London', 'Rome', 'Berlin'], explain: 'Paris has been France\'s capital for centuries; it\'s home to the Eiffel Tower, the Louvre, and receives ~100 million visitors per year.' }
      ]
    },
    coding: {
      name: '💻 Coding Basics', desc: 'Programming concepts & web dev', questions: [
        { q: 'What does HTML stand for?', a: 'HyperText Markup Language', wrong: ['HighText Machine Language', 'HyperLoop Machine Language', 'HyperText Markup Level'], explain: 'HTML uses tags to structure web content; "HyperText" refers to links that connect documents, which is the foundation of the World Wide Web.' },
        { q: 'Which language is used for styling web pages?', a: 'CSS', wrong: ['HTML', 'JavaScript', 'Python'], explain: 'CSS (Cascading Style Sheets) controls visual presentation — colors, fonts, layout; HTML provides structure, and JS adds interactivity.' },
        { q: 'What symbol is used for single-line comments in JS?', a: '//', wrong: ['/*', '#', '<!--'], explain: '// starts a single-line comment in JavaScript; /* */ spans multiple lines; # is used in Python/Ruby; <!-- --> is HTML comment syntax.' },
        { q: 'What does API stand for?', a: 'Application Programming Interface', wrong: ['Applied Programming Interface', 'Application Process Integration', 'Automated Program Interface'], explain: 'An API defines how software components communicate; it lets your app request data or functionality from another service without knowing its internals.' },
        { q: 'Which is NOT a JavaScript data type?', a: 'Float', wrong: ['String', 'Boolean', 'Undefined'], explain: 'JavaScript has one number type for both integers and decimals; "Float" is a type in languages like C and Java, but not in JS.' },
        { q: 'What keyword declares a constant variable in JS?', a: 'const', wrong: ['let', 'var', 'constant'], explain: 'const declares a variable whose binding cannot be reassigned; let allows reassignment with block scope; var is older with function scope.' },
        { q: 'What does CSS stand for?', a: 'Cascading Style Sheets', wrong: ['Computer Style Sheets', 'Creative Style System', 'Colorful Style Sheets'], explain: '"Cascading" means styles apply in a priority order (specificity + source order), allowing defaults to be overridden at multiple levels.' },
        { q: 'Which HTML tag is used for the largest heading?', a: '<h1>', wrong: ['<heading>', '<h6>', '<head>'], explain: 'HTML has six heading levels h1–h6; h1 is the largest/most important and should appear once per page for SEO and accessibility.' },
        { q: 'What is the output of 2 + "2" in JS?', a: '"22"', wrong: ['4', 'NaN', 'Error'], explain: 'JS uses type coercion: when + is used with a string, the number 2 is converted to the string "2", then concatenated to get "22".' },
        { q: 'Which of these is a version control system?', a: 'Git', wrong: ['Node', 'React', 'Docker'], explain: 'Git tracks changes to files over time and enables collaboration; Node.js is a JS runtime, React is a UI library, and Docker is for containers.' }
      ]
    }
  };

  const DEMO_QS = QBANKS.energy.questions;

  // --- Globals ---
  let questions: any[] = [];
  let G: any = {};
  let canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, CW: number, CH: number, cellW: number, cellH: number;
  let hoverCell: any = null, audioCtx: any = null, selectedDiff = 'normal';
  let activeTower: any = null;
  let musicOn = false, musicNodes: any = null, longPressTimer: any = null;
  let speedMode = false, sellMode = false;
  let gameLastT = 0;
  let EMBEDDED_QUESTIONS: any = null;
  let isDaily = false;
  let guardians: any[] = [];
  let ttsAuto = false, ttsSynth = window.speechSynthesis;
  let qTimer: any = null;
  let canvasInitialized = false;
  let pendingMode = 'classic';
  let qStartTime = 0;

  // --- Utility Functions ---
  function qHashId(q: any) {
    var s = (q.q || '') + '|' + (q.a || '');
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = (h * 16777619) >>> 0 }
    return 'q_' + h.toString(36);
  }

  function stampQuestionIds(qs: any[]) {
    var seen: any = {};
    qs.forEach(function (q) {
      if (!q.qid) q.qid = qHashId(q);
      if (seen[q.qid]) {
        var n = 2; while (seen[q.qid + '_' + n]) n++;
        q.qid = q.qid + '_' + n;
      }
      seen[q.qid] = 1;
    });
    return qs;
  }

  function shuffle(a: any[]) {
    var b = a.slice();
    for (var i = b.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = b[i]; b[i] = b[j]; b[j] = tmp
    }
    return b;
  }

  function esc(s: any) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  }

  // --- Audio Engine ---
  function initAudio() { try { if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)() } catch (e) { } }
  function pt(f: number, d: number, type?: string, v?: number, when?: number) {
    if (!audioCtx) return;
    try {
      var o = audioCtx.createOscillator(), g = audioCtx.createGain(), t = when || audioCtx.currentTime;
      o.type = type || 'sine';
      o.frequency.value = f;
      g.gain.setValueAtTime(v || .08, t);
      g.gain.exponentialRampToValueAtTime(.001, t + d);
      o.connect(g);
      g.connect(audioCtx.destination);
      o.start(t);
      o.stop(t + d)
    } catch (e) { }
  }

  function sfxOk(streak: number) {
    initAudio(); var c = audioCtx.currentTime;
    var root = streak >= 10 ? 784 : streak >= 5 ? 659 : 523;
    pt(root, .09, 'sine', .12, c); pt(root * 1.25, .09, 'sine', .08, c + .02); pt(root * 1.5, .11, 'sine', .07, c + .05);
    if (streak >= 5) pt(root * 2, .1, 'sine', .1, c + .1);
  }
  function sfxNo() { initAudio(); var c = audioCtx.currentTime; pt(200, .18, 'sawtooth', .07, c); pt(150, .22, 'sawtooth', .07, c + .1) }
  function sfxPlace() { initAudio(); var c = audioCtx.currentTime; pt(440, .07, 'square', .05, c); pt(660, .07, 'square', .05, c + .06) }
  function sfxKill() { initAudio(); pt(800, .05, 'sine', .04) }
  function sfxWave() { initAudio(); var c = audioCtx.currentTime; pt(440, .09, 'sine', .07, c); pt(554, .09, 'sine', .07, c + .08); pt(659, .13, 'sine', .07, c + .17) }
  function sfxLvl() { initAudio(); var c = audioCtx.currentTime; [523, 659, 784, 1047].forEach(function (f, i) { pt(f, .1, 'sine', .14, c + i * .09) }) }
  function sfxPU() { initAudio(); var c = audioCtx.currentTime; pt(880, .05, 'sine', .07, c); pt(1100, .1, 'sine', .07, c + .07) }
  function sfxBad() { initAudio(); pt(300, .14, 'square', .05) }
  function sfxBoss() { initAudio(); var c = audioCtx.currentTime; [90, 110, 90, 70].forEach(function (f, i) { pt(f, .25, 'sawtooth', .12, c + i * .18) }) }
  function sfxLightning() { initAudio(); var c = audioCtx.currentTime; for (var i = 0; i < 8; i++) pt(200 + Math.random() * 600, .05, 'sawtooth', .1, c + i * .04) }
  function sfxGuardian() { initAudio(); var c = audioCtx.currentTime; pt(523, .08, 'sine', .1, c); pt(784, .08, 'sine', .1, c + .09); pt(1047, .14, 'sine', .1, c + .19) }
  
  // Ability SFX
  function sfxAbVolley() { initAudio(); var c = audioCtx.currentTime; for(let i=0; i<5; i++) pt(600 + Math.random()*200, .04, 'triangle', .05, c + i*.06); }
  function sfxAbBigOne() { initAudio(); var c = audioCtx.currentTime; pt(100, .4, 'sawtooth', .15, c); pt(50, .5, 'square', .15, c); }
  function sfxAbBlizzard() { initAudio(); var c = audioCtx.currentTime; pt(1200, .3, 'sine', .08, c); pt(1400, .2, 'sine', .06, c + .1); pt(1600, .4, 'triangle', .05, c); }
  function sfxAbSurge() { initAudio(); var c = audioCtx.currentTime; for(let i=0; i<6; i++) pt(300 + Math.random()*800, .03, 'sawtooth', .08, c + i*.05); }
  function sfxAbAssassinate() { initAudio(); var c = audioCtx.currentTime; pt(2000, .02, 'square', .1, c); pt(200, .1, 'sawtooth', .1, c + .02); }
  function sfxAbEpidemic() { initAudio(); var c = audioCtx.currentTime; for(let i=0; i<4; i++) pt(400 - i*50, .1, 'sine', .06, c + i*.08); }

  // --- Game State & UI ---
  function updateHUD() {
    const goldEl = document.getElementById('hg');
    const hpEl = document.getElementById('hh');
    const scoreEl = document.getElementById('hsc');
    const waveEl = document.getElementById('hw');
    const lvlEl = document.getElementById('hlv');
    const xpEl = document.getElementById('hxp');
    const accEl = document.getElementById('hacc');

    if (goldEl) goldEl.textContent = G.gold;
    if (hpEl) {
      hpEl.textContent = G.hp;
      hpEl.style.color = G.hp <= 5 ? '#ef4444' : G.hp <= 10 ? '#fbbf24' : '#22c55e';
    }
    if (scoreEl) scoreEl.textContent = G.score;
    if (waveEl) waveEl.textContent = G.wave;
    if (lvlEl) lvlEl.textContent = 'LV' + G.level;
    if (xpEl) xpEl.style.width = Math.floor(G.xp / G.xpNeed * 100) + '%';
    if (accEl) accEl.textContent = G.qAns > 0 ? Math.round(G.qOk / G.qAns * 100) + '%' : '—';
  }

  function toast(m: string, t: string) {
    var el = document.createElement('div');
    el.className = 'toast toast-' + t;
    el.textContent = m;
    document.body.appendChild(el);
    setTimeout(function () { if (el.parentNode) el.remove() }, 2100);
  }

  function screenFlash(c: string) {
    var d = document.createElement('div');
    d.className = 'flash';
    d.style.background = c;
    document.body.appendChild(d);
    setTimeout(function () { if (d.parentNode) d.remove() }, 380);
  }

  function burst(x: number, y: number, c: string, n: number) {
    for (var i = 0; i < n; i++) {
      var a = Math.random() * 6.28, s = Math.random() * 160 + 55;
      G.particles.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 45, r: Math.random() * 3.5 + 1, color: c, life: 1 })
    }
  }

  function addFloat(x: number, y: number, t: string, c: string) {
    G.floats.push({ x: x, y: y, text: t, color: c, life: 1.35 })
  }

  // --- Path Generation ---
  function makePath(layout: number) {
    var p: any[] = [], y: number;
    if (layout === 0) { y = 2; for (var x = 0; x <= 5; x++) p.push({ x: x, y: y }); for (var d = 0; d < 6; d++) { y++; p.push({ x: 5, y: y }) } for (var x2 = 6; x2 <= 11; x2++) p.push({ x: x2, y: y }); for (var d2 = 0; d2 < 6; d2++) { y--; p.push({ x: 11, y: y }) } for (var x3 = 12; x3 < COLS; x3++) p.push({ x: x3, y: y }) }
    else if (layout === 1) { y = 1; for (var i = 0; i <= 13; i++) p.push({ x: i, y: y }); for (var j = 0; j < 6; j++) { y++; p.push({ x: 13, y: y }) } for (var i2 = 12; i2 >= 4; i2--) p.push({ x: i2, y: y }); for (var j2 = 0; j2 < 4; j2++) { y++; p.push({ x: 4, y: y }) } for (var i3 = 5; i3 < COLS; i3++) p.push({ x: i3, y: y }) }
    else if (layout === 2) { y = 5; for (var x = 0; x <= 8; x++) p.push({ x: x, y: y }); for (var d = 0; d < 4; d++) { y--; p.push({ x: 8, y: y }) } for (var x2 = 9; x2 <= 13; x2++) p.push({ x: x2, y: y }); for (var d2 = 0; d2 < 7; d2++) { y++; p.push({ x: 13, y: y }) } for (var x3 = 14; x3 < COLS; x3++) p.push({ x: x3, y: y }) }
    else if (layout === 3) { y = 2; for (var x = 0; x <= 3; x++) p.push({ x: x, y: y }); for (var d = 0; d < 7; d++) { y++; p.push({ x: 3, y: y }) } for (var x2 = 4; x2 <= 9; x2++) p.push({ x: x2, y: y }); for (var d2 = 0; d2 < 6; d2++) { y--; p.push({ x: 9, y: y }) } for (var x3 = 10; x3 <= 14; x3++) p.push({ x: x3, y: y }); for (var d3 = 0; d3 < 5; d3++) { y++; p.push({ x: 14, y: y }) } for (var x4 = 15; x4 < COLS; x4++) p.push({ x: x4, y: y }) }
    else { y = 4; for (var x = 0; x <= 6; x++) p.push({ x: x, y: y }); for (var d = 0; d < 3; d++) { y++; p.push({ x: 6, y: y }) } for (var x2 = 7; x2 <= 12; x2++) p.push({ x: x2, y: y }); for (var d2 = 0; d2 < 5; d2++) { y--; p.push({ x: 12, y: y }) } for (var x3 = 13; x3 < COLS; x3++) p.push({ x: x3, y: y }) }
    return p;
  }

  // --- Game Core ---
  function initGame(name: string, qs: any[], endless: boolean, mode?: string) {
    mode = mode || 'classic';
    initAudio();
    questions = shuffle(stampQuestionIds(qs.slice()));
    guardians = [];
    var diff = DIFFS[selectedDiff];
    var qTrack: any = {};
    questions.forEach(function (q, i) { qTrack[i] = { asked: 0, correct: 0, missed: false, lastWrong: false } });
    var layout = Math.floor(Math.random() * 5), path = makePath(layout), pathSet: any = {};
    path.forEach(function (p) { pathSet[p.x + ',' + p.y] = true });
    var isBlitz = mode === 'blitz', isSurv = mode === 'survival';

    G = {
      name: name, mode: mode,
      gold: isBlitz ? 120 : 80, totalGoldEarned: isBlitz ? 120 : 80, hp: diff.hp, maxHp: diff.hp, score: 0, wave: 0, streak: 0, bestStreak: 0,
      qAns: 0, qOk: 0, xp: 0, level: 1, xpNeed: 100,
      towers: [], enemies: [], projs: [], particles: [], floats: [],
      shakeT: 0, shakeM: 0, selTower: null, waveOn: false, over: false, paused: false, qOpen: false,
      path: path, pathSet: pathSet, base: path[path.length - 1],
      lb: [], tid: 0, spawnQ: [], spawnT: 0, kills: 0, tBuilt: 0, pulse: 0, gameTime: 0,
      qTrack: qTrack, missedThisRound: [], qStats: [], qtime: diff.qtime, spdMult: diff.spdMult, hpMult: diff.hpMult,
      powerups: { freeze: 0, gold: 0, heal: 0, boost: 0, nuke: 0 },
      boostTimer: 0, freezeTimer: 0, slowmoTimer: 0,
      achievements: {}, donBonus: 0, endless: !!endless || isBlitz || isSurv, lastQTime: 0, hintShown: false,
      castleShield: false, waveEnemiesHit: false, towerKills: {},
      blitzTimeLeft: isBlitz ? 300 : 0, blitzAutoQTimer: 0,
      survNoEnemyDmg: isSurv
    };

    speedMode = false; sellMode = false;
    const speedBtn = document.getElementById('speed-btn');
    if (speedBtn) {
      speedBtn.textContent = '1×';
      speedBtn.classList.remove('on');
    }
    const sellBtn = document.getElementById('sellbtn');
    if (sellBtn) sellBtn.classList.remove('on');

    showScreen('game');
    const hwMax = document.getElementById('hwmax');
    if (hwMax) hwMax.textContent = G.endless ? '/∞' : '/' + MAXWAVES;
    const hk = document.getElementById('hk');
    if (hk) hk.style.display = 'block';

    initCanvas();
    buildShop();
    updateHUD();
    updateCastleBar();
    const tutov = document.getElementById('tutov');
    if (tutov) tutov.classList.add('active');

    gameLastT = 0;
    requestAnimationFrame(gameLoop);
  }

  function sizeCanvas() {
    var w = document.getElementById('arena'); if (!w) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2), ww = w.clientWidth, hh = w.clientHeight;
    if (!ww || !hh) return;
    canvas.width = ww * dpr; canvas.height = hh * dpr; canvas.style.width = ww + 'px'; canvas.style.height = hh + 'px';
    CW = canvas.width; CH = canvas.height; cellW = CW / COLS; cellH = CH / ROWS;
  }

  function initCanvas() {
    canvas = document.getElementById('gc') as HTMLCanvasElement;
    if (!canvas) return;
    ctx = canvas.getContext('2d')!;
    sizeCanvas();
    if (canvasInitialized) return;
    canvasInitialized = true;
    window.addEventListener('resize', sizeCanvas);

    canvas.addEventListener('mousemove', function (e) {
      if (!canvas || !G || G.over) return;
      var r = canvas.getBoundingClientRect(), mx = Math.floor((e.clientX - r.left) / r.width * COLS), my = Math.floor((e.clientY - r.top) / r.height * ROWS);
      hoverCell = (mx >= 0 && mx < COLS && my >= 0 && my < ROWS) ? { x: mx, y: my } : null;
    });

    canvas.addEventListener('click', function (e) { if (G && !G.over) onGridClick(e) });
  }

  function onGridClick(e: MouseEvent) {
    if (G.over || G.paused) return;
    var r = canvas.getBoundingClientRect(), cx = e.clientX, cy = e.clientY;
    var g = { x: Math.floor((cx - r.left) / r.width * COLS), y: Math.floor((cy - r.top) / r.height * ROWS) };

    var ex = null; for (var i = 0; i < G.towers.length; i++) { if (G.towers[i].x === g.x && G.towers[i].y === g.y) { ex = G.towers[i]; break } }
    
    if (sellMode && ex) { doSellAt(g); return }
    
    if (ex) { 
      activeTower = ex;
      G.selTower = null;
      document.querySelectorAll('.tc').forEach(function (c) { c.classList.remove('sel') });
      updateTowerPanel();
      return; 
    }

    if (activeTower) {
      activeTower = null;
      updateTowerPanel();
    }

    if (!G.selTower || sellMode) return;
    if (G.pathSet[g.x + ',' + g.y] || (g.x === G.base.x && g.y === G.base.y)) { sfxBad(); G.shakeT = .1; G.shakeM = 2; toast("Can't place there!", 'red'); return }

    var def = TDEFS.find(function (t) { return t.id === G.selTower });
    if (!def) return; if (G.gold < def.cost) { toast('Need ' + def.cost + '💰 to build!', 'red'); return }
    G.gold -= def.cost; G.tBuilt++; G.tid++;
    G.towers.push({ id: G.tid, x: g.x, y: g.y, type: def.id, dmg: def.dmg, rng: def.rng, rate: def.rate, color: def.color, icon: def.icon, level: 1, splash: def.splash || 0, slow: !!def.slow, chain: def.chain || 0, poison: !!def.poison, sniper: !!def.sniper, fireAccum: 0, anim: 1.6, kills: 0, onFire: false, abilityCd: 0, buffs: {} });
    burst((g.x + .5) * cellW, (g.y + .5) * cellH, def.color, 18); sfxPlace();
    updateHUD();
  }

  function updateTowerPanel() {
    const panel = document.getElementById('sel-tower-panel');
    if (!panel) return;
    if (!activeTower) {
      panel.style.display = 'none';
      return;
    }
    panel.style.display = 'block';
    const info = document.getElementById('sel-t-info');
    const upgBtn = document.getElementById('sel-t-upg') as HTMLButtonElement;
    const abBtn = document.getElementById('sel-t-ab') as HTMLButtonElement;
    const sellBtn = document.getElementById('sel-t-sell') as HTMLButtonElement;
    
    var def = TDEFS.find(d => d.id === activeTower.type);
    if (!def) return;

    if (info) {
      info.innerHTML = `
        <div class="font-bungee text-amber-400 text-lg">${def.icon} ${def.name} Lvl ${activeTower.level}</div>
        <div class="text-xs text-slate-300 mt-1">DMG: ${activeTower.dmg} | RNG: ${activeTower.rng.toFixed(1)}</div>
        <div class="text-xs text-slate-400 mt-1">Kills: ${activeTower.kills}</div>
      `;
    }

    if (upgBtn) {
      if (activeTower.level >= 4) {
        upgBtn.textContent = 'MAX LEVEL';
        upgBtn.disabled = true;
      } else {
        var cost = Math.floor(def.cost * (.6 + activeTower.level * .4));
        upgBtn.textContent = `UPGRADE (${cost}💰)`;
        upgBtn.disabled = G.gold < cost;
      }
    }

    if (abBtn) {
      if (def.ability) {
        abBtn.style.display = 'block';
        if (activeTower.abilityCd > 0) {
          abBtn.textContent = `${def.ability.name} (${Math.ceil(activeTower.abilityCd)}s)`;
          abBtn.disabled = true;
        } else {
          abBtn.textContent = `${def.ability.icon} ${def.ability.name}`;
          abBtn.disabled = false;
        }
      } else {
        abBtn.style.display = 'none';
      }
    }

    if (sellBtn) {
      var ref = Math.floor(def.cost * activeTower.level * .5);
      sellBtn.textContent = `🪙 SELL (${ref}💰)`;
    }
  }

  function doSellAt(g: any) {
    for (var i = 0; i < G.towers.length; i++) {
      if (G.towers[i].x === g.x && G.towers[i].y === g.y) {
        var t = G.towers[i], def = TDEFS.find(function (d) { return d.id === t.type });
        var ref = Math.floor(def!.cost * t.level * .5);
        G.gold += ref; G.towers.splice(i, 1); burst((g.x + .5) * cellW, (g.y + .5) * cellH, '#ef4444', 10); toast('Sold for ' + ref + '💰', 'gold');
        if (activeTower === t) { activeTower = null; updateTowerPanel(); }
        updateHUD(); return;
      }
    }
  }

  function upgT(t: any) {
    if (t.level >= 4) { toast('Max level!', 'blue'); return }
    var def = TDEFS.find(function (d) { return d.id === t.type });
    if (!def) return;

    var cost = Math.floor(def.cost * (.6 + t.level * .4));
    if (G.gold < cost) { toast('Need ' + cost + '💰 to upgrade', 'red'); return }

    if (t.level === 1 && def.paths) {
      showUpgradeChoice(t, def, cost);
      return;
    }

    applyUpgrade(t, def, cost);
  }

  function showUpgradeChoice(t: any, def: any, cost: number) {
    const grid = document.getElementById('upg-grid');
    if (!grid) return;
    grid.innerHTML = '';
    G.paused = true;

    def.paths.forEach((path: any, idx: number) => {
      const card = document.createElement('div');
      card.className = 'upg-card';
      card.innerHTML = `
        <div class="upg-icon">${path.icon}</div>
        <div class="upg-name">${path.name}</div>
        <div class="upg-desc">${path.desc}</div>
        <div class="upg-cost">💰${cost}</div>
      `;
      card.onclick = () => {
        G.gold -= cost;
        t.pathIdx = idx;
        t.pathMod = path.mod;
        t.icon = path.icon;
        applyUpgrade(t, def, 0, true);
        closeUpg();
      };
      grid.appendChild(card);
    });

    document.getElementById('upg-ov')?.classList.add('active');
  }

  function applyUpgrade(t: any, def: any, cost: number, skipCost = false) {
    if (!skipCost) G.gold -= cost;
    t.level++;
    
    var baseDmg = def.dmg * UMULT[t.level - 1];
    var baseRate = def.rate * (1 - t.level * 0.06);
    var baseRng = def.rng + t.level * 0.28;

    if (t.pathMod) {
      t.dmg = Math.floor(baseDmg * (t.pathMod.dmg || 1));
      t.rate = Math.floor(baseRate * (t.pathMod.rate || 1));
      t.rng = +(baseRng * (t.pathMod.rng || 1)).toFixed(2);
      if (t.pathMod.splash) t.splash = def.splash * t.pathMod.splash;
      if (t.pathMod.chain) t.chain = def.chain * t.pathMod.chain;
    } else {
      t.dmg = Math.floor(baseDmg);
      t.rate = Math.floor(baseRate);
      t.rng = +baseRng.toFixed(2);
    }

    t.anim = 1.8;
    burst((t.x + .5) * cellW, (t.y + .5) * cellH, '#fbbf24', 26);
    sfxPlace();
    toast(t.icon + ' LV' + t.level + '! UPGRADED', 'gold');
    updateHUD();
  }

  function closeUpg() {
    document.getElementById('upg-ov')?.classList.remove('active');
    G.paused = false;
  }

  function buildShop() {
    var s = document.getElementById('tshop'); if (!s) return; s.innerHTML = '';
    TDEFS.forEach(function (t) {
      var d = document.createElement('div'); d.className = 'tc'; d.id = 'tc-' + t.id;
      (d as HTMLElement).style.setProperty('--tc', t.color);
      d.innerHTML = '<div class="tc-accent"></div><div class="tk">' + t.key + '</div><div class="ti">' + t.icon + '</div><div class="tn">' + t.name + '</div><div class="tp">💰' + t.cost + '</div><div class="td">' + t.desc + '</div>';
      d.addEventListener('click', function () { selTower(t.id) });
      s.appendChild(d);
    });
  }

  function selTower(id: string) {
    G.selTower = (G.selTower === id) ? null : id;
    document.querySelectorAll('.tc').forEach(function (c) { c.classList.remove('sel') });
    if (G.selTower) {
      var el = document.getElementById('tc-' + id); if (el) el.classList.add('sel');
    }
  }

  function updateCastleBar() {
    var pct = Math.max(0, G.hp / G.maxHp), fill = document.getElementById('castlefill');
    if (!fill) return; fill.style.height = (pct * 100) + '%';
    fill.className = 'castle-hp-fill' + (pct <= .25 ? ' crit' : pct <= .5 ? ' warn' : '');
  }

  function gameLoop(now: number) {
    if (G.over) return;
    var rawDt = Math.min((now - (gameLastT || now)) / 1000, .05);
    var dt = (speedMode ? rawDt * 2 : rawDt);
    gameLastT = now; G.pulse = now / 1000;

    if (!G.paused && !G.qOpen) {
      G.gameTime += rawDt;
      if (G.spawnQ.length) { G.spawnT += rawDt; while (G.spawnQ.length && G.spawnT >= G.spawnQ[0].delay) { var s = G.spawnQ.shift(); spawnEnemy(s.type, s.scale) } }
      moveEnemies(dt); fireTowers(dt); moveProjs(dt);
      checkWaveEnd();
      G.towers.forEach(function (t: any) { 
        if (t.anim > 1) t.anim = Math.max(1, t.anim - dt * 2.5);
        if (t.abilityCd > 0) t.abilityCd -= dt;
        if (t.buffs && t.buffs.surge > 0) t.buffs.surge -= dt;
      });
      updateTowerPanel();
    }
    G.particles = G.particles.filter(function (p: any) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 280 * dt; p.life -= dt * 1.9; return p.life > 0 });
    G.floats = G.floats.filter(function (f: any) { f.y -= 60 * dt; f.life -= dt * .9; return f.life > 0 });
    if (G.shakeT > 0) G.shakeT -= rawDt;
    drawGame(); requestAnimationFrame(gameLoop);
  }

  function spawnEnemy(type: any, scale: number) {
    var finalHp = Math.floor(type.hp * scale * G.hpMult);
    G.enemies.push({ 
      id: Date.now() + Math.random(), 
      icon: type.icon, 
      hp: finalHp, 
      maxHp: finalHp, 
      spd: type.spd * G.spdMult, 
      reward: Math.floor(type.rew * Math.sqrt(scale)), 
      progress: 0, 
      sz: type.sz || 1, 
      boss: !!type.boss, 
      flying: !!type.flying,
      armored: !!type.armored,
      flash: 0, 
      wobble: Math.random() * 6.28 
    });
  }

  function moveEnemies(dt: number) {
    G.enemies = G.enemies.filter(function (e: any) {
      if (e.hp <= 0) return false;

      // Poison effect
      if (e.poisonTimer > 0) {
        e.poisonTimer -= dt;
        e.hp -= (e.poisonDmg || 2) * dt;
        if (e.hp <= 0) { killEnemy(e); return false; }
      }

      // Slow effect
      var spd = e.spd;
      if (e.slowTimer > 0) {
        e.slowTimer -= dt;
        spd *= (e.slowAmt || 0.5);
      }

      e.progress += spd * dt; e.wobble += dt * 4.5;
      if (Math.floor(e.progress) >= G.path.length - 1) {
        G.hp--; G.waveEnemiesHit = true; G.shakeT = .42; G.shakeM = 10;
        burst((G.base.x + .5) * cellW, (G.base.y + .5) * cellH, '#ef4444', 22);
        updateHUD(); updateCastleBar();
        if (G.hp <= 0) endGame(false); return false;
      }
      if (e.flash > 0) e.flash -= dt; return true;
    });
  }

  function ePos(e: any) {
    var path = G.path;
    var idx = Math.min(Math.floor(e.progress), path.length - 2), c = path[idx], n = path[idx + 1], f = e.progress - idx;
    return { x: (c.x + (n.x - c.x) * f + .5) * cellW, y: (c.y + (n.y - c.y) * f + .5) * cellH }
  }

  function fireTowers(dt: number) {
    G.towers.forEach(function (t: any) {
      if (!t.fireAccum) t.fireAccum = 0; t.fireAccum += dt * 1000; 
      var rate = t.rate;
      if (t.buffs && t.buffs.surge > 0) rate *= 0.5;
      if (t.fireAccum < rate) return; t.fireAccum = 0;
      var tg = null, bestScore = -Infinity;
      G.enemies.forEach(function (e: any) { 
        if (e.hp <= 0) return; 
        if (e.flying && t.type === 'cannon') return; // Cannons can't hit flying enemies
        var pos = ePos(e), dx = pos.x / cellW - .5 - t.x, dy = pos.y / cellH - .5 - t.y, d = Math.sqrt(dx * dx + dy * dy); 
        if (d <= t.rng) {
          // Score calculation: higher is better
          // Base score is negative distance (closer is better)
          let score = -d;
          
          // Prioritize lower health enemies
          if (t.splash > 0) {
            // Splash towers heavily prioritize low health to finish off groups
            score -= e.hp * 2;
          } else {
            // Normal towers also prioritize low health, but slightly less aggressively
            score -= e.hp * 0.5;
          }
          
          if (score > bestScore) { 
            bestScore = score; 
            tg = e; 
          } 
        } 
      });
      if (!tg) return; t.anim = 1.28;
      burst((t.x + .5) * cellW, (t.y + .5) * cellH, t.color, 4);
      G.projs.push({ x: (t.x + .5) * cellW, y: (t.y + .5) * cellH, targetId: tg.id, spd: 500, dmg: t.dmg, color: t.color, trail: [], towerId: t.id, isBigOne: t.isBigOne });
    });
  }

  function moveProjs(dt: number) {
    G.projs = G.projs.filter(function (p: any) {
      var tg = null; for (var i = 0; i < G.enemies.length; i++) { if (G.enemies[i].id === p.targetId) { tg = G.enemies[i]; break } }
      if (!tg || tg.hp <= 0) return false;
      var tp = ePos(tg), dx = tp.x - p.x, dy = tp.y - p.y, dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 11) {
        applyImpact(tg, p);
        burst(p.x, p.y, p.color, 12); // Increased impact particles
        return false;
      }
      p.trail.push({ x: p.x, y: p.y });
      if (p.trail.length > 10) p.trail.shift(); // Longer trail
      p.x += (dx / dist) * p.spd * dt; p.y += (dy / dist) * p.spd * dt; return true;
    });
  }

  function applyImpact(target: any, proj: any) {
    var t = G.towers.find((tw: any) => tw.id === proj.towerId);
    
    var baseDmg = proj.dmg;
    if (target.armored && t && t.type !== 'zap' && t.type !== 'poison') {
      baseDmg = Math.max(1, Math.floor(baseDmg * 0.5)); // Armored takes 50% less from physical
    }

    if (!t) {
      target.hp -= baseDmg;
      target.flash = .18;
      addFloat(ePos(target).x, ePos(target).y - 10, baseDmg.toString(), '#fff');
      if (target.hp <= 0) killEnemy(target);
      return;
    }

    // Splash DMG
    if (proj.isBigOne) {
      var pos = ePos(target);
      G.enemies.forEach((e: any) => {
        if (e.hp <= 0) return;
        var ep = ePos(e), edx = ep.x - pos.x, edy = ep.y - pos.y, edist = Math.sqrt(edx * edx + edy * edy);
        if (edist <= 3.0 * cellW) { // Huge splash
          var d = proj.dmg;
          if (e.armored) d = Math.max(1, Math.floor(d * 0.5));
          e.hp -= d;
          e.flash = .5;
          addFloat(ep.x, ep.y - 10, d.toString(), '#f97316');
          if (e.hp <= 0) killEnemy(e);
        }
      });
      burst(pos.x, pos.y, '#f97316', 40);
      G.shakeT = 0.3; G.shakeM = 8;
      return;
    }

    if (t.splash > 0) {
      var pos = ePos(target);
      G.enemies.forEach((e: any) => {
        if (e.hp <= 0) return;
        var ep = ePos(e), edx = ep.x - pos.x, edy = ep.y - pos.y, edist = Math.sqrt(edx * edx + edy * edy);
        if (edist <= t.splash * cellW) {
          var d = proj.dmg;
          if (e.armored) d = Math.max(1, Math.floor(d * 0.5));
          e.hp -= d;
          e.flash = .18;
          addFloat(ep.x, ep.y - 10, d.toString(), '#fcd34d');
          if (e.hp <= 0) killEnemy(e);
        }
      });
    } else {
      target.hp -= baseDmg;
      target.flash = .18;
      addFloat(ePos(target).x, ePos(target).y - 10, baseDmg.toString(), '#fff');
      if (target.hp <= 0) killEnemy(target);
    }

    // Slow logic
    if (t.slow || (t.pathMod && t.pathMod.poisonSlow)) {
      target.slowTimer = 2.5;
      target.slowAmt = t.pathMod?.slowPower || t.pathMod?.poisonSlow || 0.5;
    }

    // Poison logic
    if (t.poison || (t.pathMod && t.pathMod.poisonAoE)) {
      if (t.pathMod?.poisonAoE) {
        var pos = ePos(target);
        G.enemies.forEach((e: any) => {
          if (e.hp <= 0) return;
          var ep = ePos(e), edx = ep.x - pos.x, edy = ep.y - pos.y, edist = Math.sqrt(edx * edx + edy * edy);
          if (edist <= t.pathMod.poisonAoE * cellW) {
            e.poisonTimer = 4.0;
            e.poisonDmg = proj.dmg * 0.3;
          }
        });
      } else {
        target.poisonTimer = 4.0;
        target.poisonDmg = proj.dmg * 0.3;
      }
    }

    // Chain logic
    if (t.chain > 0 && !proj.chained) {
      var pos = ePos(target);
      var others = G.enemies.filter((e: any) => e.id !== target.id && e.hp > 0);
      others.sort((a: any, b: any) => {
        var ap = ePos(a), bp = ePos(b);
        return Math.sqrt((ap.x - pos.x) ** 2 + (ap.y - pos.y) ** 2) - Math.sqrt((bp.x - pos.x) ** 2 + (bp.y - pos.y) ** 2);
      });
      for (var i = 0; i < Math.min(t.chain, others.length); i++) {
        var next = others[i];
        G.projs.push({ ...proj, x: pos.x, y: pos.y, targetId: next.id, chained: true, dmg: proj.dmg * 0.6 });
      }
    }
  }

  function killEnemy(e: any) {
    sfxKill(); G.gold += e.reward; G.totalGoldEarned += e.reward; G.score += e.reward * 5; G.kills++; addXP(e.boss ? 90 : 16);
    var pos = ePos(e); 
    addFloat(pos.x, pos.y - 16, '+' + e.reward + '💰', '#fbbf24');
    burst(pos.x, pos.y, '#ef4444', 20); // Death explosion
    updateHUD();
  }

  function addXP(n: number) {
    G.xp += n;
    while (G.xp >= G.xpNeed) {
      G.xp -= G.xpNeed; G.level++; G.xpNeed = Math.floor(G.xpNeed * 1.45);
      G.gold += 30; G.totalGoldEarned += 30; sfxLvl();
    }
  }

  function checkWaveEnd() {
    if (!G.waveOn) return;
    if (G.enemies.filter(function (e: any) { return e.hp > 0 }).length === 0 && G.spawnQ.length === 0) {
      G.waveOn = false;
      const wb = document.getElementById('wbtn') as HTMLButtonElement;
      if (wb) wb.disabled = false;
      if (G.wave >= MAXWAVES) { endGame(true); return }
      G.gold += 20; G.totalGoldEarned += 20; G.score += 100; sfxWave();
      updateHUD();
    }
  }

  function drawGame() {
    if (!ctx) return;
    ctx.save();
    if (G.shakeT > 0) ctx.translate((Math.random() - .5) * G.shakeM * 2, (Math.random() - .5) * G.shakeM * 2);
    
    // Grass background with subtle gradient
    var bgGrad = ctx.createLinearGradient(0, 0, CW, CH);
    bgGrad.addColorStop(0, '#073d2e');
    bgGrad.addColorStop(1, '#042d20');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, CW, CH);

    // Subtle grid
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (var gx = 0; gx <= COLS; gx++) { ctx.beginPath(); ctx.moveTo(gx * cellW, 0); ctx.lineTo(gx * cellW, CH); ctx.stroke() }
    for (var gy = 0; gy <= ROWS; gy++) { ctx.beginPath(); ctx.moveTo(0, gy * cellH); ctx.lineTo(CW, gy * cellH); ctx.stroke() }

    // Tower placement hover indicator
    if (hoverCell && G.selTower && !G.pathSet[hoverCell.x + ',' + hoverCell.y] &&
        !(hoverCell.x === G.base.x && hoverCell.y === G.base.y)) {
      ctx.fillStyle = 'rgba(251,191,36,0.10)';
      ctx.fillRect(hoverCell.x * cellW + 1, hoverCell.y * cellH + 1, cellW - 2, cellH - 2);
      ctx.strokeStyle = 'rgba(251,191,36,0.55)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 3]);
      ctx.strokeRect(hoverCell.x * cellW + 2, hoverCell.y * cellH + 2, cellW - 4, cellH - 4);
      ctx.setLineDash([]);
    }

    // Path (stone tiles)
    G.path.forEach(function (p: any, pi: number) {
      var px = p.x * cellW, py = p.y * cellH;
      // Stone shadow
      ctx.fillStyle = '#2d1a0e';
      ctx.fillRect(px, py, cellW, cellH);
      // Stone surface
      ctx.fillStyle = '#7c4a2f';
      ctx.fillRect(px + 1, py + 1, cellW - 2, cellH - 2);
      // Center lighter panel
      ctx.fillStyle = '#9a6040';
      ctx.fillRect(px + 3, py + 3, cellW - 6, cellH - 6);
      // Top-left highlight
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.fillRect(px + 3, py + 3, cellW - 6, 2);
      ctx.fillRect(px + 3, py + 3, 2, cellH - 6);
      // Arrow directional tint near end
      if (pi > G.path.length * 0.75) {
        ctx.fillStyle = 'rgba(239,68,68,0.12)';
        ctx.fillRect(px + 1, py + 1, cellW - 2, cellH - 2);
      }
    });

    // Castle (draw a mini fortress shape)
    var bx = G.base.x * cellW, by = G.base.y * cellH;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(bx, by, cellW, cellH);
    ctx.fillStyle = '#1e3a5f';
    ctx.fillRect(bx + 2, by + 2, cellW - 4, cellH - 4);
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(bx + 4, by + cellH * 0.4, cellW - 8, cellH * 0.6 - 4);
    // Battlements
    var btw = Math.floor((cellW - 8) / 3);
    ctx.fillStyle = '#1e3a5f';
    for (var bi = 0; bi < 3; bi++) {
      ctx.fillRect(bx + 4 + bi * btw + 1, by + 2, btw - 2, cellH * 0.35);
    }
    // Gate arch
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(bx + cellW / 2 - 4, by + cellH * 0.55, 8, cellH * 0.45 - 4);
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 1;
    ctx.strokeRect(bx + cellW / 2 - 4, by + cellH * 0.55, 8, cellH * 0.45 - 4);
    // Castle emoji on top
    ctx.font = Math.floor(cellH * 0.55) + 'px serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.shadowBlur = 12; ctx.shadowColor = '#2563eb';
    ctx.fillText('🏰', bx + cellW / 2, by + cellH / 2);
    ctx.shadowBlur = 0;

    G.towers.forEach(function (t: any) {
      var tx = (t.x + .5) * cellW, ty = (t.y + .5) * cellH;
      var sc = t.anim || 1;
      var bob = Math.sin(G.pulse * 3 + t.id) * 2;

      // Glow base for upgraded towers
      if (t.level > 1) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = t.color;
      }

      // Tower base/range indicator
      ctx.strokeStyle = t.color + '33';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(tx, ty, t.rng * cellW, 0, 6.28); ctx.stroke();

      // Tower body
      ctx.fillStyle = t.color + '18';
      ctx.beginPath(); ctx.arc(tx, ty, cellW * .44 * sc, 0, 6.28); ctx.fill();
      
      ctx.strokeStyle = t.color + 'aa';
      ctx.lineWidth = 2 * sc;
      ctx.beginPath(); ctx.arc(tx, ty, cellW * .4 * sc, 0, 6.28); ctx.stroke();

      // Icon
      ctx.font = (cellH * .48 * sc) + 'px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(t.icon, tx, ty + bob);
      
      if (t === activeTower) {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath(); ctx.arc(tx, ty, cellW * .5, 0, 6.28); ctx.stroke();
        ctx.setLineDash([]);
      }

      ctx.shadowBlur = 0;

      // Level indicators (Stars)
      if (t.level > 1) {
        ctx.fillStyle = '#fbbf24';
        ctx.font = '10px serif';
        for (var i = 0; i < t.level - 1; i++) {
          ctx.fillText('★', tx - ((t.level - 2) * 6) + i * 12, ty + cellH * .35);
        }
      }
    });
    G.enemies.forEach(function (e: any) {
      if (e.hp <= 0) return;
      var pos = ePos(e), sz = cellH * .4 * e.sz, bob = Math.sin(e.wobble) * 2.4;
      
      if (e.flash > 0) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(pos.x, pos.y + bob, sz * 1.2, 0, 6.28); ctx.fill();
      }
      
      ctx.font = (sz * 2.2) + 'px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(e.icon, pos.x, pos.y + bob);
      
      // Health bar
      if (e.hp < e.maxHp) {
        var hpPct = Math.max(0, e.hp / e.maxHp);
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(pos.x - 12, pos.y + bob - sz - 8, 24, 4);
        ctx.fillStyle = hpPct > 0.5 ? '#22c55e' : hpPct > 0.25 ? '#eab308' : '#ef4444';
        ctx.fillRect(pos.x - 12, pos.y + bob - sz - 8, 24 * hpPct, 4);
      }
    });
    G.projs.forEach(function (p: any) {
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 3; // Thicker trail
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      p.trail.forEach((pt: any, i: number) => {
        ctx.globalAlpha = (i / p.trail.length) * 0.8;
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      ctx.globalAlpha = 1;

      ctx.fillStyle = '#ffffff'; // White core for projectiles
      ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, 6.28); ctx.fill();
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, 2.5, 0, 6.28); ctx.fill();
    });
    G.particles.forEach(function (p: any) {
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.28); ctx.fill();
    });
    ctx.globalAlpha = 1;
    G.floats.forEach(function (f: any) {
      ctx.globalAlpha = Math.max(0, f.life); ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = f.color; ctx.fillText(f.text, f.x, f.y);
    });
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  function endGame(win: boolean) {
    G.over = true;
    const goov = document.getElementById('goov');
    if (goov) { goov.classList.add('active'); goov.classList.add(win ? 'gov-win' : 'gov-lose'); }
    const got = document.getElementById('got');
    if (got) {
      got.textContent = win ? '🏆 VICTORY!' : '💀 FORTRESS FALLEN';
      got.className = 'got ' + (win ? 'win' : 'lose');
    }
    const stats = document.getElementById('go-stats');
    if (stats) {
      const acc = G.qAns > 0 ? G.qOk / G.qAns : 0;
      const accPct = Math.round(acc * 100);

      // Star rating: based on win + accuracy
      let stars = 0;
      if (win) {
        if (acc >= 0.8) stars = 3;
        else if (acc >= 0.55) stars = 2;
        else stars = 1;
      } else {
        if (G.wave >= 8 && acc >= 0.5) stars = 2;
        else if (G.wave >= 3) stars = 1;
      }

      const starHtml = [1, 2, 3].map(s =>
        `<span class="star-icon ${s <= stars ? 'star-lit' : 'star-dim'}">${s <= stars ? '★' : '☆'}</span>`
      ).join('');

      stats.innerHTML = `
        <div class="star-row">${starHtml}</div>
        <div class="gs"><div class="gsv">${G.wave}</div><div class="gsl">WAVES</div></div>
        <div class="gs"><div class="gsv">${G.kills}</div><div class="gsl">KILLS</div></div>
        <div class="gs"><div class="gsv text-amber-400">${G.totalGoldEarned}</div><div class="gsl">GOLD EARNED</div></div>
        <div class="gs"><div class="gsv text-cyan-400">${accPct}%</div><div class="gsl">ACCURACY</div></div>
        <div class="gs"><div class="gsv text-orange-400">${G.bestStreak}</div><div class="gsl">BEST STREAK</div></div>
      `;
    }

    const review = document.getElementById('go-review');
    if (review) {
      if (G.qStats && G.qStats.length > 0) {
        let html = '<div class="flex justify-between items-center mb-4"><h3 class="text-xl font-bungee text-cyan-400">📊 DETAILED REPORT</h3><button id="dl-csv-btn" class="bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bungee text-[10px] py-1 px-3 rounded border border-cyan-800 transition-colors">📥 DOWNLOAD CSV</button></div>';
        html += '<div class="overflow-x-auto"><table class="w-full text-left text-xs text-slate-300 border-collapse">';
        html += '<thead><tr class="border-b border-slate-700 text-slate-500"><th class="p-2">Question</th><th class="p-2">Your Answer</th><th class="p-2">Correct</th><th class="p-2">Time (s)</th></tr></thead><tbody>';
        
        G.qStats.forEach((s: any) => {
          const rowClass = s.isOk ? 'bg-emerald-900/20' : 'bg-red-900/20';
          const icon = s.isOk ? '✅' : '❌';
          html += `<tr class="border-b border-slate-800/50 ${rowClass}">
            <td class="p-2 max-w-[200px] truncate" title="${s.q}">${s.q}</td>
            <td class="p-2">${icon} ${s.given}</td>
            <td class="p-2 text-emerald-400">${s.correct}</td>
            <td class="p-2 font-mono">${s.time.toFixed(1)}s</td>
          </tr>`;
        });
        
        html += '</tbody></table></div>';
        review.innerHTML = html;
        review.style.display = 'block';

        // Add CSV Download listener
        setTimeout(() => {
          const dlBtn = document.getElementById('dl-csv-btn');
          if (dlBtn) {
            dlBtn.addEventListener('click', () => {
              let csv = 'Student Name,Question,Given Answer,Correct Answer,Is Correct,Time Taken (s)\n';
              G.qStats.forEach((s: any) => {
                csv += `"${G.name}","${s.q}","${s.given}","${s.correct}",${s.isOk},${s.time.toFixed(1)}\n`;
              });
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.setAttribute('hidden', '');
              a.setAttribute('href', url);
              a.setAttribute('download', `KnowledgeFortress_Report_${G.name.replace(/[^a-z0-9]/gi, '_')}.csv`);
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            });
          }
        }, 100);

      } else {
        review.style.display = 'none';
      }
    }
  }

  function showScreen(id: string) {
    document.querySelectorAll('.screen').forEach(function (s) { s.classList.remove('active') });
    var el = document.getElementById(id); if (el) el.classList.add('active');
  }

  let currentQStartTime = 0;

  // --- Question Handling ---
  function askQ() {
    if (G.over || G.qOpen || G.paused) return; G.qOpen = true;
    var qi = Math.floor(Math.random() * questions.length), q = questions[qi], ans = shuffle([q.a, q.wrong[0], q.wrong[1], q.wrong[2]]), lbl = ['A', 'B', 'C', 'D'];
    const qtx = document.getElementById('qtx'); if (qtx) qtx.textContent = q.q;
    const qres = document.getElementById('qres'); if (qres) { qres.textContent = ''; qres.className = 'qrs'; }
    const qtf = document.getElementById('qtf'); if (qtf) qtf.style.width = '100%';

    currentQStartTime = Date.now();

    var grid = document.getElementById('agrid'); if (!grid) return; grid.innerHTML = '';
    ans.forEach(function (a, i) {
      var b = document.createElement('button'); b.className = 'ab';
      b.innerHTML = '<span class="ab-lbl">' + lbl[i] + '</span><span class="ab-txt">' + esc(a) + '</span>';
      (b as any).dataset.answer = a;
      b.addEventListener('click', function () { handleAns(b, a === q.a, q, qi, a) });
      grid!.appendChild(b)
    });
    const qov = document.getElementById('qov'); if (qov) qov.classList.add('active');
    G.qTimeLeft = G.qtime;
    clearInterval(qTimer);
    qTimer = setInterval(function () {
      G.qTimeLeft -= .1;
      const qtf = document.getElementById('qtf'); if (qtf) qtf.style.width = Math.max(0, (G.qTimeLeft / G.qtime) * 100) + '%';
      if (G.qTimeLeft <= 0) { clearInterval(qTimer); timeoutQ(qi, q) }
    }, 100);
  }

  function handleAns(btn: HTMLButtonElement, ok: boolean, q: any, qi: number, givenAns: string) {
    clearInterval(qTimer);
    
    const timeTaken = (Date.now() - currentQStartTime) / 1000;
    G.qStats.push({
      q: q.q,
      given: givenAns,
      correct: q.a,
      isOk: ok,
      time: timeTaken
    });

    var allBtns = document.querySelectorAll('#agrid .ab');
    allBtns.forEach(function (b: any) {
      b.disabled = true; b.style.pointerEvents = 'none';
      if (b.dataset.answer === q.a) b.classList.add('correct');
      else if (b.dataset.answer === givenAns && !ok) b.classList.add('wrong');
    });
    const explainHtml = q.explain ? `<div class="explain-text">💡 ${esc(q.explain)}</div>` : '';
    const closeDelay = q.explain ? 3200 : 1500;

    if (ok) {
      G.streak++; G.qOk++; G.gold += 30; G.totalGoldEarned += 30; sfxOk(G.streak);
      if (G.streak > G.bestStreak) G.bestStreak = G.streak;
      const qres = document.getElementById('qres');
      if (qres) { qres.className = 'qrs good'; qres.innerHTML = '✅ Correct! +30💰' + explainHtml; }
    } else {
      sfxNo(); G.streak = 0;
      G.missedThisRound.push({ q: q.q, a: q.a });
      const qres = document.getElementById('qres');
      if (qres) { qres.className = 'qrs bad'; qres.innerHTML = '❌ The answer was: ' + esc(q.a) + explainHtml; }
    }
    updateHUD();
    setTimeout(function () {
      document.getElementById('qov')?.classList.remove('active'); G.qOpen = false;
    }, closeDelay);
  }

  function timeoutQ(qi: number, q: any) {
    G.streak = 0; sfxNo();
    
    const timeTaken = (Date.now() - currentQStartTime) / 1000;
    G.qStats.push({
      q: q.q,
      given: 'TIMEOUT',
      correct: q.a,
      isOk: false,
      time: timeTaken
    });
    G.missedThisRound.push({ q: q.q, a: q.a });

    const tq = questions[qi];
    document.querySelectorAll('#agrid .ab').forEach(function(b: any) {
      b.disabled = true; b.style.pointerEvents = 'none';
      if (b.dataset.answer === tq.a) b.classList.add('correct');
    });
    const explainHtml = tq.explain ? `<div class="explain-text">💡 ${esc(tq.explain)}</div>` : '';
    const qres = document.getElementById('qres');
    if (qres) { qres.className = 'qrs bad'; qres.innerHTML = "⏰ Time's up! Answer: " + esc(tq.a) + explainHtml; }
    setTimeout(function () { document.getElementById('qov')?.classList.remove('active'); G.qOpen = false }, tq.explain ? 3200 : 1600);
  }

  // --- Expose functions to window for HTML buttons ---
  (window as any).setDifficulty = (diff: string) => {
    selectedDiff = diff;
    document.querySelectorAll('.diff-btn').forEach(btn => {
      btn.classList.toggle('sel', btn.getAttribute('data-diff') === diff);
    });
  };
  (window as any).showModeModal = (mode: string) => {
    pendingMode = mode;
    initGame('Player', DEMO_QS, false, mode);
  };
  let waveAnnounceInterval: any = null;

  (window as any).launchWave = () => {
    if (G.waveOn || G.over || G.paused) return;
    
    const ov = document.getElementById('wave-announcer-ov');
    const title = document.getElementById('wave-announcer-title');
    const countEl = document.getElementById('wave-announcer-count');
    
    if (ov && title && countEl) {
      ov.classList.add('active');
      title.textContent = `WAVE ${G.wave + 1}`;
      
      let count = 3;
      countEl.textContent = count.toString();
      sfxPlace();
      
      if (waveAnnounceInterval) clearInterval(waveAnnounceInterval);
      
      waveAnnounceInterval = setInterval(() => {
        count--;
        if (count > 0) {
          countEl.textContent = count.toString();
          sfxPlace();
        } else {
          clearInterval(waveAnnounceInterval);
          (window as any).skipWaveAnnouncer();
        }
      }, 1000);
    } else {
      (window as any).skipWaveAnnouncer();
    }
  };

  (window as any).skipWaveAnnouncer = () => {
    if (waveAnnounceInterval) {
      clearInterval(waveAnnounceInterval);
      waveAnnounceInterval = null;
    }
    const ov = document.getElementById('wave-announcer-ov');
    if (ov) ov.classList.remove('active');
    
    sfxWave();
    startActualWave();
  };

  function startActualWave() {
    G.wave++; G.waveOn = true;
    const wb = document.getElementById('wbtn') as HTMLButtonElement;
    if (wb) wb.disabled = true;
    var count = 6 + G.wave * 2;
    var pool = EDEFS.filter(e => !e.boss);
    G.spawnQ = []; for (var i = 0; i < count; i++) { G.spawnQ.push({ type: pool[Math.floor(Math.random() * pool.length)], scale: 1 + G.wave * .2, delay: i * .5 }) }
    G.spawnT = 0;
    updateHUD();
  }
  (window as any).startCustomQuiz = () => {
    const input = (document.getElementById('custom-quiz-input') as HTMLTextAreaElement).value;
    if (!input || input.trim() === '') {
      alert('Please enter some questions first!');
      return;
    }

    const lines = input.split('\n');
    const customQs: any[] = [];
    
    lines.forEach(line => {
      if (line.trim() === '') return;
      const parts = line.split('|').map(p => p.trim());
      if (parts.length >= 5) {
        customQs.push({
          q: parts[0],
          a: parts[1],
          wrong: [parts[2], parts[3], parts[4]]
        });
      }
    });

    if (customQs.length === 0) {
      alert('Could not parse any questions. Please check the format!');
      return;
    }

    initGame('Player', customQs, false);
  };

  (window as any).generateShareLink = () => {
    const input = (document.getElementById('custom-quiz-input') as HTMLTextAreaElement).value;
    if (!input || input.trim() === '') {
      alert('Please enter some questions first!');
      return;
    }

    const lines = input.split('\n');
    const customQs: any[] = [];
    
    lines.forEach(line => {
      if (line.trim() === '') return;
      const parts = line.split('|').map(p => p.trim());
      if (parts.length >= 5) {
        customQs.push({
          q: parts[0],
          a: parts[1],
          wrong: [parts[2], parts[3], parts[4]]
        });
      }
    });

    if (customQs.length === 0) {
      alert('Could not parse any questions. Please check the format!');
      return;
    }

    const encoded = btoa(encodeURIComponent(JSON.stringify(customQs)));
    const url = window.location.origin + window.location.pathname + '#quiz=' + encoded;
    
    navigator.clipboard.writeText(url).then(() => {
      alert('Student Link copied to clipboard!\n\n' + url);
    }).catch(err => {
      prompt('Copy this link to share with students:', url);
    });
  };

  let loadedCustomQuiz: any[] | null = null;

  (window as any).startStudentQuiz = () => {
    const nameInput = document.getElementById('student-name-input') as HTMLInputElement;
    const name = nameInput.value.trim();
    if (!name) {
      alert('Please enter your name to begin!');
      return;
    }
    if (loadedCustomQuiz && loadedCustomQuiz.length > 0) {
      initGame(name, loadedCustomQuiz, false);
    }
  };

  // Check URL Hash on load
  setTimeout(() => {
    if (window.location.hash && window.location.hash.startsWith('#quiz=')) {
      try {
        const encoded = window.location.hash.substring(6);
        loadedCustomQuiz = JSON.parse(decodeURIComponent(atob(encoded)));
        if (loadedCustomQuiz && loadedCustomQuiz.length > 0) {
          showScreen('student-login');
        }
      } catch (e) {
        console.error('Failed to parse custom quiz from URL', e);
        window.location.hash = '';
      }
    }
  }, 100);

  (window as any).askQ = askQ;
  (window as any).togglePause = () => {
    G.paused = !G.paused;
    document.getElementById('pauseov')?.classList.toggle('active', G.paused);
    const pb = document.getElementById('pause-btn');
    if (pb) {
      pb.textContent = G.paused ? '▶' : '⏸';
      pb.classList.toggle('on', G.paused);
    }
  };
  (window as any).goHome = () => { window.location.reload() };
  (window as any).closeTut = () => { document.getElementById('tutov')?.classList.remove('active') };
  (window as any).closeUpg = closeUpg;
  (window as any).deselectTower = () => {
    activeTower = null;
    updateTowerPanel();
  };
  (window as any).upgSelected = () => {
    if (activeTower) upgT(activeTower);
  };
  (window as any).sellSelected = () => {
    if (activeTower) {
      doSellAt({ x: activeTower.x, y: activeTower.y });
      activeTower = null;
      updateTowerPanel();
    }
  };
  (window as any).useAbility = () => {
    if (!activeTower || activeTower.abilityCd > 0) return;
    var def = TDEFS.find(d => d.id === activeTower.type);
    if (!def || !def.ability) return;

    activeTower.abilityCd = def.ability.cd;
    activeTower.anim = 2.0;
    burst((activeTower.x + .5) * cellW, (activeTower.y + .5) * cellH, '#a855f7', 30);

    var tx = (activeTower.x + .5) * cellW;
    var ty = (activeTower.y + .5) * cellH;

    switch (activeTower.type) {
      case 'archer':
        sfxAbVolley();
        var inRange = G.enemies.filter((e: any) => {
          var p = ePos(e);
          return Math.sqrt((p.x/cellW - .5 - activeTower.x)**2 + (p.y/cellH - .5 - activeTower.y)**2) <= activeTower.rng;
        });
        if (inRange.length === 0) inRange = G.enemies;
        for (var i = 0; i < 5; i++) {
          if (inRange.length === 0) break;
          var tg = inRange[Math.floor(Math.random() * inRange.length)];
          setTimeout(() => {
            if (tg && tg.hp > 0) {
              G.projs.push({ x: tx, y: ty, targetId: tg.id, spd: 600, dmg: activeTower.dmg, color: activeTower.color, trail: [], towerId: activeTower.id });
            }
          }, i * 100);
        }
        break;
      case 'cannon':
        sfxAbBigOne();
        var strongest = [...G.enemies].sort((a, b) => b.hp - a.hp)[0];
        if (strongest) {
          G.projs.push({ x: tx, y: ty, targetId: strongest.id, spd: 400, dmg: activeTower.dmg * 3, color: '#f97316', trail: [], towerId: activeTower.id, isBigOne: true });
        }
        break;
      case 'frost':
        sfxAbBlizzard();
        G.enemies.forEach((e: any) => {
          var p = ePos(e);
          if (Math.sqrt((p.x/cellW - .5 - activeTower.x)**2 + (p.y/cellH - .5 - activeTower.y)**2) <= activeTower.rng * 1.5) {
            e.slowTimer = 3.0;
            e.slowAmt = 0;
            e.flash = 0.5;
            burst(p.x, p.y, '#06b6d4', 10);
          }
        });
        break;
      case 'zap':
        sfxAbSurge();
        if (!activeTower.buffs) activeTower.buffs = {};
        activeTower.buffs.surge = 5.0;
        addFloat(tx, ty - 20, 'SURGE!', '#a855f7');
        break;
      case 'sniper':
        sfxAbAssassinate();
        var strongest = [...G.enemies].sort((a, b) => b.hp - a.hp)[0];
        if (strongest) {
          G.projs.push({ x: tx, y: ty, targetId: strongest.id, spd: 1200, dmg: activeTower.dmg * 5, color: '#ef4444', trail: [], towerId: activeTower.id });
        }
        break;
      case 'poison':
        sfxAbEpidemic();
        G.enemies.forEach((e: any) => {
          e.poisonTimer = 5.0;
          e.poisonDmg = activeTower.dmg * 0.5;
          e.flash = 0.2;
          var p = ePos(e);
          burst(p.x, p.y, '#22c55e', 5);
        });
        break;
    }
    updateTowerPanel();
  };

  // --- AI Question Generation ---
  (window as any).generateAIQuiz = async () => {
    const topicInput = document.getElementById('ai-topic-input') as HTMLInputElement;
    const gradeSelect = document.getElementById('ai-grade-select') as HTMLSelectElement;
    const countSelect = document.getElementById('ai-count-select') as HTMLSelectElement;
    const statusEl = document.getElementById('ai-status');
    const previewEl = document.getElementById('ai-preview');
    const playBtn = document.getElementById('ai-play-btn') as HTMLButtonElement;

    const topic = topicInput?.value?.trim();
    const grade = gradeSelect?.value || 'Middle School';
    const count = parseInt(countSelect?.value || '10');

    if (!topic) {
      if (statusEl) statusEl.innerHTML = '<span style="color:#f97316">⚠️ Please enter a topic first</span>';
      return;
    }

    const apiKey = (process.env as any).GEMINI_API_KEY;
    if (!apiKey) {
      if (statusEl) statusEl.innerHTML = '<span style="color:#ef4444">⚠️ GEMINI_API_KEY not set — add it to your .env file</span>';
      return;
    }

    if (statusEl) statusEl.innerHTML = '<span style="color:#06b6d4">✨ Generating questions with AI…</span>';
    if (playBtn) playBtn.style.display = 'none';
    if (previewEl) previewEl.innerHTML = '';

    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Create exactly ${count} multiple choice quiz questions about "${topic}" for ${grade} level students.

Return ONLY a valid JSON array with no markdown fences, no explanation text:
[{"q":"Question?","a":"Correct Answer","wrong":["Wrong1","Wrong2","Wrong3"],"explain":"One sentence explaining why the correct answer is right."}]

Rules:
- Questions must be factually accurate
- Each question has exactly 3 wrong answers that are plausible but clearly incorrect
- Explanations are one sentence, educational, and memorable
- Difficulty is appropriate for ${grade} level`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt
      });

      const text = response.text || '';
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('Could not parse a JSON array from the response');

      const parsed = JSON.parse(jsonMatch[0]);
      if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('No questions were generated');

      (window as any)._aiGeneratedQuestions = parsed;

      if (statusEl) statusEl.innerHTML = `<span style="color:#22c55e">✅ Generated ${parsed.length} questions about "${esc(topic)}"</span>`;

      if (previewEl) {
        previewEl.innerHTML = parsed.slice(0, 3).map((q: any, i: number) => `
          <div style="background:rgba(15,23,42,0.9);border:1px solid rgba(51,65,85,0.8);border-radius:8px;padding:10px;margin-bottom:6px;">
            <div style="color:#e2e8f0;font-size:12px;font-weight:600;">${i + 1}. ${esc(q.q)}</div>
            <div style="color:#4ade80;font-size:11px;margin-top:3px;">✓ ${esc(q.a)}</div>
          </div>
        `).join('') + (parsed.length > 3 ? `<div style="color:#475569;font-size:11px;text-align:center;padding:4px;">+ ${parsed.length - 3} more questions…</div>` : '');
      }

      if (playBtn) playBtn.style.display = 'block';
    } catch (err: any) {
      if (statusEl) statusEl.innerHTML = `<span style="color:#ef4444">❌ ${esc(String(err?.message || err))}</span>`;
    }
  };

  (window as any).playAIQuiz = () => {
    const qs = (window as any)._aiGeneratedQuestions;
    if (qs?.length) initGame('Player', qs, false);
  };

  // Initial UI setup
  buildPresets();
  function buildPresets() {
    var list = document.getElementById('preset-list'); if (!list) return; list.innerHTML = '';
    Object.keys(QBANKS).forEach(function (k) {
      var bank = QBANKS[k], el = document.createElement('div'); 
      el.className = 'group flex items-center justify-between bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 rounded-xl p-4 transition-all duration-200 cursor-pointer';
      el.innerHTML = `
        <div class="flex-1 pr-4">
          <div class="font-bungee text-amber-400 text-sm mb-1 group-hover:text-amber-300 transition-colors">${bank.name}</div>
          <div class="text-slate-400 text-xs leading-relaxed">${bank.desc}</div>
        </div>
        <button class="shrink-0 bg-cyan-950 hover:bg-cyan-900 text-cyan-400 border border-cyan-800 hover:border-cyan-500 px-4 py-2 rounded-lg font-bungee text-xs transition-all duration-200 shadow-[0_0_10px_rgba(6,182,212,0.1)] hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] pointer-events-none">
          PLAY ➔
        </button>
      `;
      el.addEventListener('click', function () {
        initGame('Player', bank.questions, false);
      });
      list.appendChild(el);
    });
  }
}
