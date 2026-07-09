/* ==========================================================================
   CoordiCraft - Class XII NCERT Coordination Compounds App Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  
  // ==========================================
  // PROGRESS TRACKING & SYSTEM STATE
  // ==========================================
  const progressState = {
    conceptsRead: {
      werner: false,
      "nomenclature-info": false,
      isomerism: false,
      vbt: false,
      cft: false,
      carbonyls: false
    },
    nomenclatureStreakReached: false,
    sorterHighScoreReached: false,
    quizCompleted: false,
    quizScore: 0
  };

  function updateOverallProgress() {
    let readCount = Object.values(progressState.conceptsRead).filter(Boolean).length;
    let readPercentage = (readCount / 6) * 60; // 60% weight for reading concepts
    
    let gamePercentage = 0;
    if (progressState.nomenclatureStreakReached) gamePercentage += 10; // 10%
    if (progressState.sorterHighScoreReached) gamePercentage += 10;     // 10%
    if (progressState.quizCompleted) {
      gamePercentage += 20; // 20% weight
    }

    const totalProgress = Math.round(readPercentage + gamePercentage);
    
    // Update DOM elements
    const percentText = document.getElementById('sidebar-progress-percent');
    const progressBar = document.getElementById('sidebar-progress-bar');
    if (percentText) percentText.innerText = totalProgress + '%';
    if (progressBar) progressBar.style.width = totalProgress + '%';
  }

  // ==========================================
  // TAB NAVIGATION (SIDEBAR)
  // ==========================================
  const sidebarLinks = document.querySelectorAll('.nav-link');
  const tabPanels = document.querySelectorAll('.tab-panel');

  sidebarLinks.forEach(link => {
    link.addEventListener('click', () => {
      const targetTab = link.getAttribute('data-tab');
      
      // Update sidebar links active class
      sidebarLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      // Update visible tab panel
      tabPanels.forEach(panel => {
        panel.classList.remove('active');
        if (panel.getAttribute('id') === targetTab) {
          panel.classList.add('active');
        }
      });

      // Special action: if entering ligand-sorter check if game reset is needed, or quiz
      if (targetTab === 'ligand-sorter') {
        resetSorterGameUI();
      }
    });
  });

  // ==========================================
  // CORE CONCEPTS TAB SYSTEM (DASHBOARD)
  // ==========================================
  const conceptBtns = document.querySelectorAll('.concept-btn');
  const conceptContents = document.querySelectorAll('.concept-content');

  // Mark first concept as read on load
  progressState.conceptsRead['werner'] = true;
  updateOverallProgress();

  conceptBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const conceptId = btn.getAttribute('data-concept');

      conceptBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      conceptContents.forEach(content => {
        content.classList.remove('active');
        if (content.getAttribute('id') === `concept-${conceptId}`) {
          content.classList.add('active');
        }
      });

      // Mark concept as read
      progressState.conceptsRead[conceptId] = true;
      updateOverallProgress();
    });
  });


  // ==========================================
  // GAME 1: IUPAC NOMENCLATURE BUILDER
  // ==========================================
  const nomenclatureComplexes = [
    {
      formula: '[Co(NH₃)₆]Cl₃',
      correctName: 'hexaamminecobalt(III) chloride',
      parts: ['hexaammine', 'cobalt', '(III)', 'chloride'],
      distractors: ['hexaamine', 'cobaltate', '(II)', 'trichloride'],
      explanation: 'For [Co(NH₃)₆]Cl₃, the coordination sphere is cationic, so cobalt is named normally. NH₃ ligand is spelled "ammine" (with double m). The oxidation state of cobalt is +3 because 3 Cl⁻ outer-sphere anions balance the +3 charge. Thus: hexaamminecobalt(III) chloride.'
    },
    {
      formula: 'K₄[Fe(CN)₆]',
      correctName: 'potassium hexacyanidoferrate(II)',
      parts: ['potassium', 'hexacyanidoferrate', '(II)'],
      distractors: ['hexacyanidoiron', '(III)', 'ferrate', 'tetrapotassium'],
      explanation: 'In K₄[Fe(CN)₆], the cation is Potassium (simple cation, named first without prefixes). The coordination sphere is an anion: [Fe(CN)₆]⁴⁻. Since it is anionic, the central metal iron ends in "-ate" (ferrate). The oxidation state is calculated as x + 6(-1) = -4 &rArr; x = +2. Thus: potassium hexacyanidoferrate(II).'
    },
    {
      formula: '[Pt(NH₃)₂Cl(NO₂)]',
      correctName: 'diamminechloridonitrito-N-platinum(II)',
      parts: ['diammine', 'chlorido', 'nitrito-N-platinum', '(II)'],
      distractors: ['platinate', '(IV)', 'nitro-N-platinum', 'nitrito-O-platinum'],
      explanation: 'This is a neutral complex. Ligands are ordered alphabetically: ammine (NH₃) before chlorido (Cl⁻) before nitrito-N (NO₂⁻ coordinating via nitrogen). The central metal platinum is named normally since the complex is neutral. Oxidation state is +2. Thus: diamminechloridonitrito-N-platinum(II).'
    },
    {
      formula: '[Co(en)₃]₂(SO₄)₃',
      correctName: 'tris(ethane-1,2-diamine)cobalt(III) sulfate',
      parts: ['tris(ethane-1,2-diamine)', 'cobalt', '(III)', 'sulfate'],
      distractors: ['tri(ethylenediamine)', 'cobaltate', 'trisulfate', '(II)'],
      explanation: 'The bidentate ligand "ethane-1,2-diamine" contains numerical prefixes, so we use the prefix "tris" instead of "tri". Cobalt is in its +3 oxidation state. Sulfate is outside the sphere. Thus: tris(ethane-1,2-diamine)cobalt(III) sulfate.'
    },
    {
      formula: 'K₃[Al(C₂O₄)₃]',
      correctName: 'potassium trioxalatoaluminate(III)',
      parts: ['potassium', 'trioxalatoaluminate', '(III)'],
      distractors: ['aluminum', 'trioxalatouranate', 'potassium(III)', '(VI)'],
      explanation: 'The complex contains the bidentate oxalate ligand (C₂O₄²⁻), named as oxalato. Since the coordination sphere is anionic, aluminum becomes aluminate. Aluminum oxidation state is x + 3(-2) = -3 &rArr; x = +3. Thus: potassium trioxalatoaluminate(III).'
    },
    {
      formula: '[Fe(H₂O)₆]Cl₃',
      correctName: 'hexaaquairon(III) chloride',
      parts: ['hexaaqua', 'iron', '(III)', 'chloride'],
      distractors: ['ferrate', 'hexaaquairon', '(II)', 'trichloride'],
      explanation: 'For [Fe(H₂O)₆]Cl₃, water is the neutral ligand "aqua". The sphere is cationic, so iron is named normally. The iron oxidation state is +3. Thus: hexaaquairon(III) chloride.'
    },
    {
      formula: '[Cr(NH₃)₄Cl₂]Cl',
      correctName: 'tetraamminedichloridochromium(III) chloride',
      parts: ['tetraammine', 'dichloridochromium', '(III)', 'chloride'],
      distractors: ['chromate', 'dichloridochromium(II)', 'tetraamine', 'dichloride'],
      explanation: 'In [Cr(NH₃)₄Cl₂]Cl, "ammine" alphabetically precedes "chlorido". The complex is cationic, so chromium is named normally. The oxidation state of chromium is calculated as x + 4(0) + 2(-1) = +1 (since outer chloride is -1) &rArr; x = +3. Thus: tetraamminedichloridochromium(III) chloride.'
    }
  ];

  let currentNomIndex = 0;
  let nomScore = 0;
  let nomStreak = 0;
  let nomLives = 3;
  let userAssembledParts = [];

  function setupNomenclatureGame() {
    const complex = nomenclatureComplexes[currentNomIndex];
    document.getElementById('nom-formula').innerHTML = complex.formula;
    userAssembledParts = [];
    renderAssembledName();
    
    // Combine correct parts and distractors, then shuffle
    let allCards = [...complex.parts, ...complex.distractors];
    allCards = shuffleArray(allCards);
    
    const cardsContainer = document.getElementById('nom-cards-container');
    cardsContainer.innerHTML = '';
    
    allCards.forEach(part => {
      const card = document.createElement('button');
      card.className = 'word-card';
      card.innerText = part;
      card.addEventListener('click', () => {
        selectCard(part, card);
      });
      cardsContainer.appendChild(card);
    });
  }

  function selectCard(part, cardElement) {
    userAssembledParts.push(part);
    cardElement.classList.add('selected-in-pool');
    renderAssembledName();
  }

  function renderAssembledName() {
    const container = document.getElementById('assembled-name-container');
    if (userAssembledParts.length === 0) {
      container.innerHTML = '<span class="assembled-name-placeholder">Click elements below to assemble the name...</span>';
    } else {
      container.innerHTML = '';
      userAssembledParts.forEach((part, index) => {
        const item = document.createElement('span');
        item.className = 'word-card';
        item.style.border = '1px solid var(--primary)';
        item.innerText = part;
        item.addEventListener('click', () => {
          // Remove this card from assembled name
          userAssembledParts.splice(index, 1);
          // Restore it in the cards pool
          const poolCards = document.querySelectorAll('#nom-cards-container .word-card');
          for (let card of poolCards) {
            if (card.innerText === part && card.classList.contains('selected-in-pool')) {
              card.classList.remove('selected-in-pool');
              break;
            }
          }
          renderAssembledName();
        });
        container.appendChild(item);
      });
    }
  }

  // Clear assembled name
  document.getElementById('nom-clear-btn').addEventListener('click', () => {
    userAssembledParts = [];
    renderAssembledName();
    const poolCards = document.querySelectorAll('#nom-cards-container .word-card');
    poolCards.forEach(c => c.classList.remove('selected-in-pool'));
  });

  // Submit Answer
  document.getElementById('nom-submit-btn').addEventListener('click', () => {
    if (userAssembledParts.length === 0) return;
    
    const complex = nomenclatureComplexes[currentNomIndex];
    // Compare assembled parts joined with space/none depending on logic.
    // In IUPAC, the name is written as one word except for the counter ion.
    // Our array parts represent logical segments that when concatenated in the right order match the correct answer.
    const userJoined = userAssembledParts.join('').replace(/\s+/g, '').toLowerCase();
    const correctJoined = complex.correctName.replace(/\s+/g, '').toLowerCase();
    
    const modal = document.getElementById('nom-feedback-modal');
    const modalTitle = document.getElementById('nom-modal-title');
    const modalBody = document.getElementById('nom-modal-body');
    
    if (userJoined === correctJoined) {
      // Correct!
      nomScore += 10;
      nomStreak += 1;
      document.getElementById('nom-score').innerText = nomScore;
      document.getElementById('nom-streak').innerText = nomStreak;
      
      modalTitle.innerText = "Correct! 🎉";
      modalTitle.className = "correct";
      modalBody.innerHTML = `<p style="font-size:16px; margin-bottom:12px; color:var(--text-main); font-weight:600;">${complex.correctName}</p>
                             <p style="font-size:13px; color:var(--text-muted);">${complex.explanation}</p>`;
      
      if (nomStreak >= 3) {
        progressState.nomenclatureStreakReached = true;
        updateOverallProgress();
      }
    } else {
      // Incorrect
      nomStreak = 0;
      nomLives -= 1;
      document.getElementById('nom-streak').innerText = nomStreak;
      updateLivesHearts();
      
      modalTitle.innerText = "Incorrect ❌";
      modalTitle.className = "incorrect";
      modalBody.innerHTML = `<p style="font-size:13px; color:var(--text-muted); margin-bottom:12px;">Your assembled name was incorrect. Double-check ligand alphabetical ordering and metal oxidation state calculation.</p>
                             <p style="font-size:16px; margin-bottom:12px; color:var(--text-main); font-weight:600;">Correct Name: ${complex.correctName}</p>
                             <p style="font-size:13px; color:var(--text-muted);">${complex.explanation}</p>`;
      
      if (nomLives <= 0) {
        nomScore = 0;
        nomLives = 3;
        document.getElementById('nom-score').innerText = nomScore;
        updateLivesHearts();
      }
    }
    
    modal.classList.remove('hidden');
  });

  // Skip Complex
  document.getElementById('nom-skip-btn').addEventListener('click', () => {
    nextNomenclatureComplex();
  });

  // Modal Close / Next Complex
  document.getElementById('nom-modal-close').addEventListener('click', () => {
    document.getElementById('nom-feedback-modal').classList.add('hidden');
    nextNomenclatureComplex();
  });

  function nextNomenclatureComplex() {
    currentNomIndex = (currentNomIndex + 1) % nomenclatureComplexes.length;
    setupNomenclatureGame();
  }

  function updateLivesHearts() {
    let hearts = '';
    for (let i = 0; i < nomLives; i++) {
      hearts += '❤️';
    }
    for (let i = nomLives; i < 3; i++) {
      hearts += '🖤';
    }
    document.getElementById('nom-lives').innerText = hearts;
  }

  setupNomenclatureGame();


  // ==========================================
  // GAME 2: CRYSTAL FIELD LAB & SIMULATOR
  // ==========================================
  const metalIons = {
    Ti3: { name: "Ti³⁺", dCount: 1, formula: "[Ti(H₂O)₆]³⁺", colorName: "Purple/Violet", absorb: "Absorbs yellow-green (~490 nm)", hex: "#8A2BE2" },
    V3:  { name: "V³⁺",  dCount: 2, formula: "[V(H₂O)₆]³⁺",  colorName: "Green",         absorb: "Absorbs blue-violet (~400 nm)", hex: "#228B22" },
    Cr3: { name: "Cr³⁺", dCount: 3, formula: "[Cr(H₂O)₆]³⁺", colorName: "Violet-Blue",   absorb: "Absorbs yellow-red (~570 nm)", hex: "#4B0082" },
    Mn3: { name: "Mn³⁺", dCount: 4, formula: "[Mn(H₂O)₆]³⁺", colorName: "Violet/Pink",   absorb: "Absorbs green-yellow (~520 nm)", hex: "#DA70D6" },
    Fe3: { name: "Fe³⁺", dCount: 5, formula: "[Fe(H₂O)₆]³⁺", colorName: "Pale Violet",   absorb: "Absorbs violet-blue (~400 nm)", hex: "#E6E6FA" },
    Fe2: { name: "Fe²⁺", dCount: 6, formula: "[Fe(H₂O)₆]²⁺", colorName: "Pale Green",    absorb: "Absorbs red (~700 nm)", hex: "#98FB98" },
    Co3: { name: "Co³⁺", dCount: 6, formula: "[Co(NH₃)₆]³⁺", colorName: "Yellow-Orange", absorb: "Absorbs violet-blue (~470 nm)", hex: "#FFA500" },
    Co2: { name: "Co²⁺", dCount: 7, formula: "[Co(H₂O)₆]²⁺", colorName: "Pink",          absorb: "Absorbs blue-green (~510 nm)", hex: "#FFC0CB" },
    Ni2: { name: "Ni²⁺", dCount: 8, formula: "[Ni(H₂O)₆]²⁺", colorName: "Bright Green",  absorb: "Absorbs red/blue (~400/700 nm)", hex: "#00FF00" },
    Cu2: { name: "Cu²⁺", dCount: 9, formula: "[Cu(H₂O)₆]²⁺", colorName: "Blue",          absorb: "Absorbs yellow-red (~600 nm)", hex: "#00BFFF" },
    Zn2: { name: "Zn²⁺", dCount: 10,formula: "[Zn(H₂O)₆]²⁺", colorName: "Colorless",     absorb: "No d-d transition possible", hex: "#FFFFFF" }
  };

  const ligandsList = [
    { value: "I",   name: "I⁻",   strength: "weak",   label: "Very Weak Field" },
    { value: "Cl",  name: "Cl⁻",  strength: "weak",   label: "Weak Field" },
    { value: "F",   name: "F⁻",   strength: "weak",   label: "Weak Field" },
    { value: "H2O", name: "H₂O",  strength: "weak",   label: "Weak Field (Borderline)" },
    { value: "NH3", name: "NH₃",  strength: "strong", label: "Strong Field" },
    { value: "en",  name: "en",   strength: "strong", label: "Strong Field" },
    { value: "CN",  name: "CN⁻",  strength: "strong", label: "Very Strong Field" },
    { value: "CO",  name: "CO",   strength: "strong", label: "Extremely Strong Field" }
  ];

  const metalSelect = document.getElementById('lab-metal');
  const ligandSelect = document.getElementById('lab-ligand');
  const seriesSlider = document.getElementById('series-slider');
  const geometryRadios = document.querySelectorAll('input[name="lab-geometry"]');

  // Event Listeners for controls
  metalSelect.addEventListener('change', runCFTCalculation);
  
  ligandSelect.addEventListener('change', (e) => {
    // Sync slider with select
    const selectedVal = e.target.value;
    const idx = ligandsList.findIndex(l => l.value === selectedVal);
    seriesSlider.value = idx;
    runCFTCalculation();
  });

  seriesSlider.addEventListener('input', (e) => {
    // Sync select with slider
    const idx = e.target.value;
    ligandSelect.value = ligandsList[idx].value;
    runCFTCalculation();
  });

  geometryRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      // Toggle Splitting Diagram visibility
      const geometry = document.querySelector('input[name="lab-geometry"]:checked').value;
      if (geometry === 'octahedral') {
        document.getElementById('octahedral-diagram').classList.add('active');
        document.getElementById('tetrahedral-diagram').classList.remove('active');
      } else {
        document.getElementById('octahedral-diagram').classList.remove('active');
        document.getElementById('tetrahedral-diagram').classList.add('active');
      }
      runCFTCalculation();
    });
  });

  function runCFTCalculation() {
    const metalKey = metalSelect.value;
    const geometry = document.querySelector('input[name="lab-geometry"]:checked').value;
    const ligandVal = ligandSelect.value;
    
    const metal = metalIons[metalKey];
    const ligand = ligandsList.find(l => l.value === ligandVal);
    const dCount = metal.dCount;
    const isSFL = ligand.strength === 'strong';

    // 1. Update Field Strength Badge & Relations text
    const strengthBadge = document.getElementById('field-strength-badge');
    const fieldRelation = document.getElementById('field-relation');
    
    if (isSFL) {
      strengthBadge.innerText = `${ligand.label} (SFL)`;
      strengthBadge.className = "badge sfl-badge";
      fieldRelation.innerText = geometry === 'octahedral' ? "Δₒ > P (Pairing Energy). Low Spin complex forms." : "Δₜ is small, usually high spin regardless of ligand.";
    } else {
      strengthBadge.innerText = `${ligand.label} (WFL)`;
      strengthBadge.className = "badge wfl-badge";
      fieldRelation.innerText = geometry === 'octahedral' ? "Δₒ < P. High Spin complex forms." : "Δₜ is small, high spin complex forms.";
    }

    // 2. Splitting Math and Configuration
    let configStr = '';
    let unpaired = 0;
    let configArray = []; // Format: [ [eg_up, eg_down, ...], [t2g_up, t2g_down, ...] ] or tetrahedral equivalent
    let spinState = "High Spin";

    if (geometry === 'octahedral') {
      let t2g_elec = [0, 0, 0]; // electrons in 3 t2g orbitals
      let eg_elec = [0, 0];    // electrons in 2 eg orbitals
      
      if (dCount <= 3) {
        // d1 to d3 fill t2g singly
        for (let i = 0; i < dCount; i++) {
          t2g_elec[i] = 1;
        }
        spinState = "N/A (Simple)";
        unpaired = dCount;
      } else if (dCount >= 8) {
        // d8 to d10 fill completely (no spin difference)
        // t2g is filled (6 electrons), remaining fill eg
        t2g_elec = [2, 2, 2];
        let rem = dCount - 6;
        if (rem === 2) { eg_elec = [1, 1]; unpaired = 2; }
        if (rem === 3) { eg_elec = [2, 1]; unpaired = 1; }
        if (rem === 4) { eg_elec = [2, 2]; unpaired = 0; }
        spinState = "N/A (Simple)";
      } else {
        // d4, d5, d6, d7 depend on ligand strength
        if (isSFL) {
          // Strong Field: fill t2g completely before eg
          spinState = "Low Spin Complex";
          if (dCount === 4) { t2g_elec = [2, 1, 1]; unpaired = 2; }
          if (dCount === 5) { t2g_elec = [2, 2, 1]; unpaired = 1; }
          if (dCount === 6) { t2g_elec = [2, 2, 2]; unpaired = 0; }
          if (dCount === 7) { t2g_elec = [2, 2, 2]; eg_elec = [1, 0]; unpaired = 1; }
        } else {
          // Weak Field: fill t2g singly, then eg singly, then pair up
          spinState = "High Spin Complex";
          if (dCount === 4) { t2g_elec = [1, 1, 1]; eg_elec = [1, 0]; unpaired = 4; }
          if (dCount === 5) { t2g_elec = [1, 1, 1]; eg_elec = [1, 1]; unpaired = 5; }
          if (dCount === 6) { t2g_elec = [2, 1, 1]; eg_elec = [1, 1]; unpaired = 4; }
          if (dCount === 7) { t2g_elec = [2, 2, 1]; eg_elec = [1, 1]; unpaired = 3; }
        }
      }
      configStr = `t₂g${getSuperscript(t2g_elec.reduce((a,b)=>a+b, 0))} eg${getSuperscript(eg_elec.reduce((a,b)=>a+b, 0))}`;
      configArray = [eg_elec, t2g_elec]; // [eg, t2g] for Octahedral rendering
      
    } else {
      // Tetrahedral (always high spin in NCERT/reality because delta_t is very small)
      let e_elec = [0, 0];    // 2 e orbitals
      let t2_elec = [0, 0, 0]; // 3 t2 orbitals
      spinState = "High Spin (Δₜ is small)";

      if (dCount === 1) { e_elec = [1, 0]; unpaired = 1; }
      else if (dCount === 2) { e_elec = [1, 1]; unpaired = 2; }
      else if (dCount === 3) { e_elec = [1, 1]; t2_elec = [1, 0, 0]; unpaired = 3; }
      else if (dCount === 4) { e_elec = [1, 1]; t2_elec = [1, 1, 0]; unpaired = 4; }
      else if (dCount === 5) { e_elec = [1, 1]; t2_elec = [1, 1, 1]; unpaired = 5; }
      else if (dCount === 6) { e_elec = [2, 1]; t2_elec = [1, 1, 1]; unpaired = 4; }
      else if (dCount === 7) { e_elec = [2, 2]; t2_elec = [1, 1, 1]; unpaired = 3; }
      else if (dCount === 8) { e_elec = [2, 2]; t2_elec = [2, 1, 1]; unpaired = 2; }
      else if (dCount === 9) { e_elec = [2, 2]; t2_elec = [2, 2, 1]; unpaired = 1; }
      else if (dCount === 10) { e_elec = [2, 2]; t2_elec = [2, 2, 2]; unpaired = 0; }

      configStr = `e${getSuperscript(e_elec.reduce((a,b)=>a+b, 0))} t₂${getSuperscript(t2_elec.reduce((a,b)=>a+b, 0))}`;
      configArray = [t2_elec, e_elec]; // [t2, e] for Tetrahedral rendering
    }

    // 3. Render configurations inside the HTML orbital boxes
    renderOrbitalDiagram(geometry, configArray);

    // 4. Update calculations text in sidebar
    document.getElementById('res-config').innerText = configStr;
    document.getElementById('res-spin').innerText = spinState;
    document.getElementById('res-unpaired').innerText = unpaired;
    
    // Magnetic Moment: sqrt(n(n+2))
    const mu = Math.sqrt(unpaired * (unpaired + 2)).toFixed(2);
    const magType = unpaired > 0 ? "Paramagnetic" : "Diamagnetic";
    document.getElementById('res-magnetic').innerText = `${mu} BM (${magType})`;

    // 5. Representative Color logic (simulation mapping)
    // SFL makes splitting gap larger, meaning higher energy blue/violet light is absorbed, and red/orange/yellow light is transmitted (complementary).
    // WFL makes splitting gap smaller, meaning lower energy red/infrared/yellow light is absorbed, and blue/green light is transmitted.
    // Exception: d10 and d0 are colorless.
    let displayColor = "#FFFFFF";
    let displayColorName = "Colorless";
    let absorbedWavelengthText = "No d-d transition (Colorless)";

    if (dCount > 0 && dCount < 10) {
      if (geometry === 'octahedral') {
        if (isSFL) {
          // High split gap: Absorbs blue-violet (430-490 nm) &rArr; displays Yellow-Orange-Red
          displayColor = "#FF8C00";
          displayColorName = "Orange-Yellow";
          absorbedWavelengthText = "Absorbs: Violet-Blue (~450 nm) due to high Δₒ";
        } else {
          // Low split gap: Absorbs orange-red (600-650 nm) &rArr; displays Green-Blue
          displayColor = "#00FFFF";
          displayColorName = "Pale Blue-Green";
          absorbedWavelengthText = "Absorbs: Yellow-Red (~630 nm) due to low Δₒ";
        }
        
        // Override with specific NCERT cases for maximum accuracy
        if (metalKey === "Ti3") {
          displayColor = "#D8BFD8";
          displayColorName = "Light Violet / Purple";
          absorbedWavelengthText = "Absorbs: Green-Yellow (~498 nm) &rArr; [Ti(H₂O)₆]³⁺";
        }
        if (metalKey === "Co3" && isSFL) {
          displayColor = "#FFD700";
          displayColorName = "Golden Yellow";
          absorbedWavelengthText = "Absorbs: Violet (~430 nm) &rArr; [Co(NH₃)₆]³⁺";
        }
        if (metalKey === "Ni2" && ligandVal === "H2O") {
          displayColor = "#90EE90";
          displayColorName = "Pale Green";
          absorbedWavelengthText = "Absorbs: Red (~680 nm) &rArr; [Ni(H₂O)₆]²⁺";
        }
        if (metalKey === "Ni2" && ligandVal === "en") {
          displayColor = "#DA70D6";
          displayColorName = "Purple-Violet";
          absorbedWavelengthText = "Absorbs: Yellow-Green &rArr; [Ni(en)₃]²⁺";
        }
        if (metalKey === "Cu2") {
          displayColor = "#3182ce";
          displayColorName = "Light Blue";
          absorbedWavelengthText = "Absorbs: Yellow-Orange (~600 nm) &rArr; [Cu(H₂O)₆]²⁺";
        }
      } else {
        // Tetrahedral: splitting is 4/9 of octahedral, very small gap &rArr; absorbs long wavelengths (infrared/red) &rArr; looks dark blue/green/indigo
        displayColor = "#0A2540";
        displayColorName = "Deep Blue / Cobalt Blue";
        absorbedWavelengthText = "Absorbs: Orange-Red (~660 nm) due to low Δₜ";
        if (metalKey === "Co2") {
          displayColor = "#0047AB";
          displayColorName = "Deep Cobalt Blue";
          absorbedWavelengthText = "Absorbs: Red (~650 nm) &rArr; [CoCl₄]²⁻";
        }
      }
    }

    document.getElementById('res-color-name').innerText = displayColorName;
    document.getElementById('res-absorb').innerText = absorbedWavelengthText;
    document.getElementById('color-preview-patch').style.backgroundColor = displayColor;

    // 6. Update Representative Formula label
    let repFormula = `[${metal.name.substring(0,2)}(${ligand.name})₆]`;
    // adjust charge
    let metalCharge = metalKey.includes('3') ? 3 : 2;
    let ligandCharge = ligandVal === 'CN' ? -6 : ligandVal === 'I' || ligandVal === 'Cl' || ligandVal === 'F' ? -6 : 0;
    let totalCharge = metalCharge + ligandCharge;
    
    let chargeSymbol = '';
    if (totalCharge > 0) chargeSymbol = `<sup>${totalCharge === 1 ? '+' : totalCharge + '+'}</sup>`;
    if (totalCharge < 0) chargeSymbol = `<sup>${Math.abs(totalCharge) === 1 ? '-' : Math.abs(totalCharge) + '-'}</sup>`;
    
    if (geometry === 'octahedral') {
      repFormula = `[${metalKey.substring(0,2).replace(/\d/g,'')}(${ligand.name})₆]${chargeSymbol}`;
    } else {
      repFormula = `[${metalKey.substring(0,2).replace(/\d/g,'')}(${ligand.name})₄]<sup>${(metalCharge + (ligandCharge === 0 ? 0 : -4)) === -2 ? '2-' : (metalCharge + (ligandCharge === 0 ? 0 : -4)) === -1 ? '-' : '+' }</sup>`;
    }
    document.getElementById('res-formula').innerHTML = repFormula;
  }

  function getSuperscript(num) {
    const sups = {
      '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '10': '¹⁰'
    };
    return sups[num] || '';
  }

  function renderOrbitalDiagram(geometry, configArray) {
    if (geometry === 'octahedral') {
      const egLevels = configArray[0];  // 2 orbitals
      const t2gLevels = configArray[1]; // 3 orbitals

      // eg rendering
      for (let i = 1; i <= 2; i++) {
        const val = egLevels[i-1] || 0;
        setElectronArrows(`oct-eg-${i}`, val);
      }
      // t2g rendering
      for (let i = 1; i <= 3; i++) {
        const val = t2gLevels[i-1] || 0;
        setElectronArrows(`oct-t2g-${i}`, val);
      }
    } else {
      const t2Levels = configArray[0]; // 3 orbitals
      const eLevels = configArray[1];  // 2 orbitals

      // t2 rendering
      for (let i = 1; i <= 3; i++) {
        const val = t2Levels[i-1] || 0;
        setElectronArrows(`tet-t2-${i}`, val);
      }
      // e rendering
      for (let i = 1; i <= 2; i++) {
        const val = eLevels[i-1] || 0;
        setElectronArrows(`tet-e-${i}`, val);
      }
    }
  }

  function setElectronArrows(boxId, value) {
    const box = document.getElementById(boxId);
    if (!box) return;
    const upArrow = box.querySelector('.spin-electron.up');
    const downArrow = box.querySelector('.spin-electron.down');
    
    if (value === 0) {
      upArrow.classList.add('hidden');
      downArrow.classList.add('hidden');
    } else if (value === 1) {
      upArrow.classList.remove('hidden');
      downArrow.classList.add('hidden');
    } else if (value === 2) {
      upArrow.classList.remove('hidden');
      downArrow.classList.remove('hidden');
    }
  }

  runCFTCalculation();


  // ==========================================
  // GAME 3: LIGAND CLASSIFICATION SORTER
  // ==========================================
  const sorterPool = [
    { name: "chloride", symbol: "Cl⁻", category: "monodentate" },
    { name: "water", symbol: "H₂O", category: "monodentate" },
    { name: "ammine", symbol: "NH₃", category: "monodentate" },
    { name: "ethane-1,2-diamine", symbol: "en", category: "bidentate" },
    { name: "oxalate", symbol: "ox²⁻", category: "bidentate" },
    { name: "ethylenediaminetetraacetate", symbol: "EDTA⁴⁻", category: "polydentate" },
    { name: "nitrito-N", symbol: "NO₂⁻", category: "ambidentate" },
    { name: "thiocyanato-S", symbol: "SCN⁻", category: "ambidentate" },
    { name: "cyanide", symbol: "CN⁻", category: "ambidentate" },
    { name: "carbonyl", symbol: "CO", category: "monodentate" },
    { name: "hydroxido", symbol: "OH⁻", category: "monodentate" },
    { name: "dimethylglyoximate", symbol: "dmg", category: "bidentate" }
  ];

  let sorterScore = 0;
  let sorterHighScore = 0;
  let sorterTime = 45;
  let sorterInterval = null;
  let currentSorterLigand = null;
  let totalSorted = 0;
  let correctSorted = 0;

  const startScreen = document.getElementById('sorter-start-screen');
  const activeScreen = document.getElementById('sorter-active-screen');
  const endScreen = document.getElementById('sorter-end-screen');

  document.getElementById('sorter-start-btn').addEventListener('click', startSorterGame);
  document.getElementById('sorter-restart-btn').addEventListener('click', startSorterGame);

  const bucketBtns = document.querySelectorAll('.bucket-btn');
  bucketBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (!currentSorterLigand) return;
      const chosenCat = btn.getAttribute('data-category');
      checkSortedAnswer(chosenCat, btn);
    });
  });

  function resetSorterGameUI() {
    clearInterval(sorterInterval);
    startScreen.classList.remove('hidden');
    activeScreen.style.opacity = '0.3';
    activeScreen.style.pointerEvents = 'none';
    endScreen.classList.add('hidden');
    
    document.getElementById('sort-score').innerText = '0';
    document.getElementById('sort-timer').innerText = '45s';
  }

  function startSorterGame() {
    sorterScore = 0;
    totalSorted = 0;
    correctSorted = 0;
    sorterTime = 45;
    
    document.getElementById('sort-score').innerText = sorterScore;
    document.getElementById('sort-timer').innerText = sorterTime + 's';
    
    startScreen.classList.add('hidden');
    endScreen.classList.add('hidden');
    activeScreen.style.opacity = '1';
    activeScreen.style.pointerEvents = 'all';

    loadNextSorterCard();

    clearInterval(sorterInterval);
    sorterInterval = setInterval(() => {
      sorterTime--;
      document.getElementById('sort-timer').innerText = sorterTime + 's';
      
      if (sorterTime <= 0) {
        endSorterGame();
      }
    }, 1000);
  }

  function loadNextSorterCard() {
    const rand = Math.floor(Math.random() * sorterPool.length);
    currentSorterLigand = sorterPool[rand];
    
    const cardSymbol = document.getElementById('card-symbol');
    const cardName = document.getElementById('card-name');
    
    cardSymbol.innerText = currentSorterLigand.symbol;
    cardName.innerText = currentSorterLigand.name;

    // Reset card element animation/glow
    const cardElement = document.getElementById('ligand-card');
    cardElement.style.borderColor = 'var(--primary)';
    cardElement.style.boxShadow = '0 10px 25px rgba(157, 78, 221, 0.25)';
  }

  function checkSortedAnswer(chosenCategory, buttonElement) {
    totalSorted++;
    const cardElement = document.getElementById('ligand-card');

    if (chosenCategory === currentSorterLigand.category) {
      // Correct!
      sorterScore += 5;
      correctSorted++;
      document.getElementById('sort-score').innerText = sorterScore;
      
      // Flash card and bucket green
      cardElement.style.borderColor = 'var(--success)';
      cardElement.style.boxShadow = '0 0 20px rgba(0, 230, 118, 0.5)';
      
      setTimeout(loadNextSorterCard, 200);
    } else {
      // Incorrect. Deduct 2 seconds
      sorterTime = Math.max(0, sorterTime - 2);
      document.getElementById('sort-timer').innerText = sorterTime + 's';
      
      // Flash red
      cardElement.style.borderColor = 'var(--error)';
      cardElement.style.boxShadow = '0 0 20px rgba(255, 23, 68, 0.5)';
      
      buttonElement.style.borderColor = 'var(--error)';
      setTimeout(() => {
        buttonElement.style.borderColor = 'var(--glass-border)';
      }, 500);

      setTimeout(loadNextSorterCard, 200);
    }

    if (sorterScore >= 30) {
      progressState.sorterHighScoreReached = true;
      updateOverallProgress();
    }
  }

  function endSorterGame() {
    clearInterval(sorterInterval);
    activeScreen.style.opacity = '0.3';
    activeScreen.style.pointerEvents = 'none';
    
    if (sorterScore > sorterHighScore) {
      sorterHighScore = sorterScore;
      document.getElementById('sort-highscore').innerText = sorterHighScore;
    }
    
    document.getElementById('final-sorted-count').innerText = correctSorted;
    const accuracy = totalSorted > 0 ? Math.round((correctSorted / totalSorted) * 100) : 0;
    document.getElementById('sort-accuracy').innerText = accuracy + '%';
    
    endScreen.classList.remove('hidden');
  }


  // ==========================================
  // GAME 4: 25-QUESTION MASTERY QUIZ
  // ==========================================
  const quizQuestions = [
    {
      question: "Which of the following describes the fundamental difference between Mohr's Salt and Potassium Ferrocyanide?",
      options: [
        "Mohr's salt is a complex compound while potassium ferrocyanide is a double salt",
        "Mohr's salt dissociates completely into simple Fe²⁺, NH₄⁺ and SO₄²⁻ ions in water, while potassium ferrocyanide retains the complex [Fe(CN)₆]⁴⁻ ion",
        "Potassium ferrocyanide gives test for individual Fe²⁺ and CN⁻ ions in aqueous solution",
        "Mohr's salt is a coordination compound while potassium ferrocyanide is a hydrated salt"
      ],
      correct: 1,
      explanation: "Mohr's Salt is a double salt [FeSO₄·(NH₄)₂SO₄·6H₂O] which dissociates completely in water. Potassium Ferrocyanide K₄[Fe(CN)₆] is a coordination compound; the complex entity [Fe(CN)₆]⁴⁻ does not dissociate into Fe²⁺ and CN⁻ ions."
    },
    {
      question: "According to Werner's theory, how many moles of AgCl precipitate will be formed when 1 mole of [Co(NH₃)₅Cl]Cl₂ is treated with excess AgNO₃ solution?",
      options: [
        "1 mole",
        "2 moles",
        "3 moles",
        "0 moles"
      ],
      correct: 1,
      explanation: "In [Co(NH₃)₅Cl]Cl₂, two chloride ions lie outside the coordination sphere as primary valencies and are ionizable. Treating with AgNO₃ precipitates these as 2 moles of AgCl."
    },
    {
      question: "What is the primary valency and secondary valency of the metal in the complex [Co(NH₃)₆]Cl₃ respectively?",
      options: [
        "Primary = 6, Secondary = 3",
        "Primary = 3, Secondary = 6",
        "Primary = 3, Secondary = 3",
        "Primary = 6, Secondary = 6"
      ],
      correct: 1,
      explanation: "Primary valency corresponds to the oxidation state of the central metal (+3 here, as it balances 3 Cl⁻). Secondary valency corresponds to the coordination number (6 ligands coordinated to Co³⁺)."
    },
    {
      question: "Identify the ambidentate ligand from the following options:",
      options: [
        "C₂O₄²⁻ (oxalate)",
        "H₂O (aqua)",
        "SCN⁻ (thiocyanato)",
        "en (ethane-1,2-diamine)"
      ],
      correct: 2,
      explanation: "An ambidentate ligand has two different donor atoms and can coordinate through either of them. SCN⁻ can coordinate via sulfur (-SCN) or nitrogen (-NCS)."
    },
    {
      question: "What is the denticity and charge of the ligand EDTA respectively?",
      options: [
        "Hexadentate and -4",
        "Tetradentate and -2",
        "Hexadentate and -2",
        "Bidentate and -4"
      ],
      correct: 0,
      explanation: "EDTA⁴⁻ (ethylenediaminetetraacetate) is a hexadentate ligand (can donate six lone pairs via 2 nitrogen and 4 oxygen atoms) and carries a charge of -4."
    },
    {
      question: "Which of the following ligands forms a chelate ring with a transition metal ion?",
      options: [
        "Cl⁻",
        "en (ethane-1,2-diamine)",
        "CN⁻",
        "NH₃"
      ],
      correct: 1,
      explanation: "Di- or polydentate ligands like ethane-1,2-diamine (en) coordinate through multiple donor atoms to form a stable ring structure known as a chelate ring."
    },
    {
      question: "What is the coordination number of Fe in K₃[Fe(C₂O₄)₃]?",
      options: [
        "3",
        "6",
        "4",
        "9"
      ],
      correct: 1,
      explanation: "Oxalate (C₂O₄²⁻) is a bidentate ligand. Since there are three oxalate ligands, the coordination number is 3 &times; 2 = 6."
    },
    {
      question: "Determine the oxidation state of the central metal atom in the complex [Co(NH₃)₅(CO₃)]Cl.",
      options: [
        "+2",
        "+3",
        "+4",
        "+1"
      ],
      correct: 1,
      explanation: "Calculation: x + 5(0) [NH₃] + 1(-2) [CO₃²⁻] = +1 (as counter chloride is -1) &rArr; x - 2 = +1 &rArr; x = +3."
    },
    {
      question: "What is the correct IUPAC name for K₃[Fe(CN)₆]?",
      options: [
        "Potassium hexacyanoiron(III)",
        "Tripotassium hexacyanidoferrate(III)",
        "Potassium hexacyanidoferrate(III)",
        "Potassium hexacyanidoferrate(II)"
      ],
      correct: 2,
      explanation: "The cation is Potassium (no prefixes like tripotassium). The complex is anionic so Iron ends in -ate (ferrate). CN⁻ is named cyanido. Oxidation state is +3 (3(+1) + x + 6(-1) = 0 &rArr; x = +3). Thus: potassium hexacyanidoferrate(III)."
    },
    {
      question: "What is the correct IUPAC name of the complex [Pt(NH₃)₂Cl(NH₂CH₃)]Cl?",
      options: [
        "Diamminechlorido(methylamine)platinum(II) chloride",
        "Diamminechloridomethylamineplatinum(IV) chloride",
        "Diamminechlorido(methylamine)platinate(II) chloride",
        "Chloridodiammine(methylamine)platinum(II) chloride"
      ],
      correct: 0,
      explanation: "Ligands are named alphabetically: ammine (NH₃) before chlorido (Cl⁻) before methylamine (NH₂CH₃). The complex sphere is cationic, so the metal name is platinum. The oxidation state is +2. Thus: diamminechlorido(methylamine)platinum(II) chloride."
    },
    {
      question: "Why do tetrahedral complexes not show geometrical isomerism?",
      options: [
        "Tetrahedral complexes are optically active",
        "All four coordination positions in a tetrahedral geometry are adjacent to one another (equal relative positions)",
        "They only contain monodentate ligands",
        "The ligands cannot be arranged in cis/trans forms due to the high stability of d-orbitals"
      ],
      correct: 1,
      explanation: "In a tetrahedral complex, all four positions are equivalent and adjacent to each other. Hence, no cis/trans isomers are possible."
    },
    {
      question: "Which of the following octahedral complexes exhibits fac-mer (facial-meridional) geometrical isomerism?",
      options: [
        "[Co(NH₃)₄Cl₂]⁺",
        "[Co(en)₃]³⁺",
        "[Co(NH₃)₃(NO₂)₃]",
        "[Pt(NH₃)₂Cl₂]"
      ],
      correct: 2,
      explanation: "Fac-mer isomerism occurs in octahedral complexes of the formula [Ma₃b₃], such as [Co(NH₃)₃(NO₂)₃]."
    },
    {
      question: "Which of the following isomers of [Co(en)₂Cl₂]⁺ is optically active and why?",
      options: [
        "The trans isomer because it has a plane of symmetry",
        "The cis isomer because it lacks a plane of symmetry (chiral)",
        "Both cis and trans isomers are optically active",
        "Neither isomer is active because chloride is a weak field ligand"
      ],
      correct: 1,
      explanation: "The cis-[Co(en)₂Cl₂]⁺ isomer is chiral and has non-superimposable mirror images. The trans isomer has a plane of symmetry, making it achiral and optically inactive."
    },
    {
      question: "What type of isomerism is shown by the complexes [Co(NH₃)₅(NO₂)]Cl₂ and [Co(NH₃)₅(ONO)]Cl₂?",
      options: [
        "Ionisation isomerism",
        "Coordination isomerism",
        "Linkage isomerism",
        "Solvate isomerism"
      ],
      correct: 2,
      explanation: "These complexes differ in the bonding mode of the ambidentate nitrite ligand (NO₂⁻ linked via N vs ONO⁻ linked via O), which represents linkage isomerism."
    },
    {
      question: "The complexes [Co(NH₃)₆][Cr(CN)₆] and [Cr(NH₃)₆][Co(CN)₆] are examples of which isomerism?",
      options: [
        "Ionisation isomerism",
        "Coordination isomerism",
        "Linkage isomerism",
        "Geometrical isomerism"
      ],
      correct: 1,
      explanation: "Coordination isomerism involves exchange of ligands between the cationic and anionic coordination spheres of different metal ions."
    },
    {
      question: "Which test can chemically distinguish between [Co(NH₃)₅SO₄]Br and [Co(NH₃)₅Br]SO₄?",
      options: [
        "[Co(NH₃)₅SO₄]Br gives a white precipitate with BaCl₂",
        "[Co(NH₃)₅Br]SO₄ gives a white precipitate with BaCl₂ and [Co(NH₃)₅SO₄]Br gives a pale yellow precipitate with AgNO₃",
        "Both give precipitates with AgNO₃",
        "[Co(NH₃)₅Br]SO₄ gives a pale yellow precipitate with AgNO₃"
      ],
      correct: 1,
      explanation: "[Co(NH₃)₅SO₄]Br dissociates to give Br⁻, which reacts with AgNO₃ to give pale yellow AgBr. [Co(NH₃)₅Br]SO₄ gives SO₄²⁻, which reacts with BaCl₂ to give white BaSO₄. This is ionisation isomerism."
    },
    {
      question: "According to Valence Bond Theory, what is the hybridization and magnetic nature of the octahedral complex [Cr(NH₃)₆]³⁺?",
      options: [
        "sp³d² and paramagnetic",
        "d²sp³ and paramagnetic",
        "d²sp³ and diamagnetic",
        "sp³d² and diamagnetic"
      ],
      correct: 1,
      explanation: "Chromium in +3 state is d³. It has three unpaired electrons in t2g. Because it has two empty inner 3d orbitals (since it's d³), it undergoes d²sp³ hybridization. With 3 unpaired electrons, it is paramagnetic."
    },
    {
      question: "What is the hybridization and magnetic nature of [Ni(CN)₄]²⁻?",
      options: [
        "sp³ and diamagnetic",
        "dsp² and paramagnetic",
        "dsp² and diamagnetic",
        "sp³ and paramagnetic"
      ],
      correct: 2,
      explanation: "Ni²⁺ is d⁸. CN⁻ is a strong field ligand, which forces the 8 electrons to pair up, leaving one empty 3d orbital. This empty orbital participates in dsp² hybridization, giving a square planar, diamagnetic complex."
    },
    {
      question: "What is the hybridization and shape of [Ni(CO)₄]?",
      options: [
        "dsp² and square planar",
        "sp³d² and octahedral",
        "sp³ and tetrahedral",
        "d²sp³ and octahedral"
      ],
      correct: 2,
      explanation: "In [Ni(CO)₄], nickel is in 0 oxidation state (d⁸s²). CO is a very strong ligand and forces the 4s electrons to pair into 3d, making it d¹⁰. The empty 4s and 4p orbitals hybridize as sp³, forming a tetrahedral diamagnetic geometry."
    },
    {
      question: "According to Crystal Field Theory, what is the splitting pattern of d-orbitals in an octahedral coordination field?",
      options: [
        "t₂g set (lower energy) and eg set (higher energy)",
        "eg set (lower energy) and t₂g set (higher energy)",
        "t₂ set (lower energy) and e set (higher energy)",
        "All 5 d-orbitals remain degenerate"
      ],
      correct: 0,
      explanation: "In an octahedral field, the ligands approach along the axes. Orbitals pointing along the axes (dx²-y², dz²) experience more repulsion and form the higher energy eg set, while those pointing between axes (dxy, dyz, dxz) form the lower energy t2g set."
    },
    {
      question: "How is the splitting energy of a tetrahedral field (Δₜ) related to that of an octahedral field (Δₒ)?",
      options: [
        "Δₜ = Δₒ",
        "Δₜ = (4/9) Δₒ",
        "Δₜ = (9/4) Δₒ",
        "Δₜ = (2/3) Δₒ"
      ],
      correct: 1,
      explanation: "Because there are only 4 ligands in tetrahedral vs 6 in octahedral and they do not point directly at the orbitals, the splitting is smaller: Δₜ = (4/9) Δₒ."
    },
    {
      question: "Which of the following represents the correct configuration of a d⁵ metal ion in an octahedral field with a strong field ligand (Δₒ > P)?",
      options: [
        "t₂g³ eg²",
        "t₂g⁵ eg⁰",
        "t₂g⁴ eg¹",
        "e⁴ t₂¹"
      ],
      correct: 1,
      explanation: "With a strong field ligand, Δₒ > P, meaning the pairing energy is low. Hence, all 5 electrons pair up in the lower t2g level before entering eg: t₂g⁵ eg⁰."
    },
    {
      question: "Which of the following ligands has the highest crystal field splitting power (field strength) in the spectrochemical series?",
      options: [
        "H₂O",
        "Cl⁻",
        "CN⁻",
        "CO"
      ],
      correct: 3,
      explanation: "According to the spectrochemical series, CO has the highest splitting power due to strong synergic &pi;-backbonding, followed by CN⁻."
    },
    {
      question: "Calculate the Crystal Field Stabilization Energy (CFSE) for a d⁶ octahedral complex with a strong field ligand.",
      options: [
        "-0.4 Δₒ",
        "-2.4 Δₒ + 3P",
        "-2.4 Δₒ",
        "-1.2 Δₒ"
      ],
      correct: 1,
      explanation: "Strong field d⁶ is t₂g⁶ eg⁰. Energy is 6 &times; (-0.4 Δₒ) + 3P (since 3 pairs are formed) = -2.4 Δₒ + 3P. (Note: sometimes written as -2.4 Δₒ relative to the barycenter)."
    },
    {
      question: "Which metal ion is present in Vitamin B₁₂?",
      options: [
        "Iron (Fe)",
        "Cobalt (Co)",
        "Magnesium (Mg)",
        "Zinc (Zn)"
      ],
      correct: 1,
      explanation: "Vitamin B₁₂ (cyanocobalamin) is a coordination complex containing Cobalt (Co³⁺). Chlorophyll contains Magnesium (Mg²⁺) and Hemoglobin contains Iron (Fe²⁺)."
    }
  ];

  let currentQuizIndex = 0;
  let quizScore = 0;
  let selectedOption = null;

  function loadQuizQuestion() {
    const q = quizQuestions[currentQuizIndex];
    document.getElementById('quiz-q-num').innerText = currentQuizIndex + 1;
    document.getElementById('quiz-score').innerText = quizScore;
    document.getElementById('question-text').innerHTML = q.question;
    
    // Update progress bar
    const progressPercent = ((currentQuizIndex + 1) / 25) * 100;
    document.getElementById('quiz-progress-bar').style.width = progressPercent + '%';

    const optionsContainer = document.getElementById('quiz-options');
    optionsContainer.innerHTML = '';
    selectedOption = null;

    // Hide feedback box
    document.getElementById('quiz-feedback').classList.add('hidden');

    q.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.innerHTML = opt;
      btn.addEventListener('click', () => {
        selectQuizOption(idx, btn);
      });
      optionsContainer.appendChild(btn);
    });
  }

  function selectQuizOption(index, buttonElement) {
    if (selectedOption !== null) return; // Prevent double select
    
    selectedOption = index;
    const q = quizQuestions[currentQuizIndex];
    const feedbackBox = document.getElementById('quiz-feedback');
    const feedbackStatus = document.getElementById('feedback-status-text');
    const feedbackExplanation = document.getElementById('feedback-explanation-text');
    
    // Disable all options
    const allButtons = document.querySelectorAll('#quiz-options .option-btn');
    allButtons.forEach(btn => btn.disabled = true);

    if (index === q.correct) {
      // Correct answer
      quizScore++;
      buttonElement.classList.add('correct');
      feedbackStatus.innerText = "Correct! 🎉";
      feedbackStatus.className = "feedback-status correct";
    } else {
      // Incorrect answer
      buttonElement.classList.add('incorrect');
      allButtons[q.correct].classList.add('correct');
      feedbackStatus.innerText = "Incorrect ❌";
      feedbackStatus.className = "feedback-status incorrect";
    }

    feedbackExplanation.innerHTML = q.explanation;
    feedbackBox.classList.remove('hidden');

    // Smooth scroll to explanation if screen is small
    feedbackBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // Next Question Button
  document.getElementById('quiz-next-btn').addEventListener('click', () => {
    currentQuizIndex++;
    if (currentQuizIndex < 25) {
      loadQuizQuestion();
    } else {
      endQuiz();
    }
  });

  function endQuiz() {
    progressState.quizCompleted = true;
    progressState.quizScore = quizScore;
    updateOverallProgress();

    document.getElementById('quiz-question-screen').classList.add('hidden');
    const summaryScreen = document.getElementById('quiz-summary-screen');
    summaryScreen.classList.remove('hidden');

    document.getElementById('summary-score').innerText = `${quizScore} / 25`;
    const accuracy = Math.round((quizScore / 25) * 100);
    document.getElementById('summary-accuracy').innerText = accuracy + '%';

    // Grade logic
    let grade = "Keep Learning";
    if (accuracy >= 90) grade = "Outstanding (A+)";
    else if (accuracy >= 75) grade = "Excellent (A)";
    else if (accuracy >= 55) grade = "Good (B)";
    document.getElementById('summary-grade').innerText = grade;

    // Draw Certificate
    generateCertificate(quizScore);
  }

  // Restart Quiz
  document.getElementById('quiz-restart-btn').addEventListener('click', () => {
    currentQuizIndex = 0;
    quizScore = 0;
    document.getElementById('quiz-question-screen').classList.remove('hidden');
    document.getElementById('quiz-summary-screen').classList.add('hidden');
    loadQuizQuestion();
  });

  function generateCertificate(score) {
    const canvas = document.getElementById('certificate-canvas');
    const ctx = canvas.getContext('2d');

    // Draw background
    ctx.fillStyle = '#0f0c1b';
    ctx.fillRect(0, 0, 600, 400);

    // Draw border
    ctx.strokeStyle = '#d500f9';
    ctx.lineWidth = 10;
    ctx.strokeRect(10, 10, 580, 380);

    // Draw double thin border
    ctx.strokeStyle = '#00b0ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, 560, 360);

    // Draw gold corners
    ctx.fillStyle = '#ffea00';
    ctx.fillRect(10, 10, 30, 30);
    ctx.fillRect(560, 10, 30, 30);
    ctx.fillRect(10, 360, 30, 30);
    ctx.fillRect(560, 360, 30, 30);

    // Header Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CERTIFICATE OF MASTERY', 300, 75);

    ctx.fillStyle = '#9f98b5';
    ctx.font = '14px Inter, sans-serif';
    ctx.fillText('PROUDLY PRESENTED TO THE SCHOLAR OF coordination chemistry', 300, 115);

    // Dynamic user name placeholder (since it's a game certificate)
    ctx.fillStyle = '#00b0ff';
    ctx.font = 'bold 28px Outfit, sans-serif';
    ctx.fillText('CoordiCraft Chemistry Master', 300, 175);

    // Certificate Body
    ctx.fillStyle = '#f3f0fc';
    ctx.font = '14px Inter, sans-serif';
    ctx.fillText(`For successfully completing the 25-Question Class XII NCERT Mastery Test`, 300, 225);
    ctx.fillText(`with a score of ${score} / 25 (${Math.round((score/25)*100)}% Accuracy)`, 300, 250);

    // Seal or emblem in background center
    ctx.fillStyle = 'rgba(213, 0, 249, 0.1)';
    ctx.font = '100px Arial';
    ctx.fillText('💠', 300, 250);

    // Footer lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(100, 320);
    ctx.lineTo(230, 320);
    ctx.moveTo(370, 320);
    ctx.lineTo(500, 320);
    ctx.stroke();

    ctx.fillStyle = '#9f98b5';
    ctx.font = '10px Inter, sans-serif';
    ctx.fillText('COORDI-CRAFT ACADEMY', 165, 335);
    ctx.fillText('BOARD OF EXAMINERS', 435, 335);

    ctx.fillStyle = '#00e676';
    ctx.font = 'italic 16px Courier New';
    ctx.fillText('Verified', 165, 310);
    ctx.fillText('Class XII NCERT', 435, 310);

    // Render as image
    const dataURL = canvas.toDataURL('image/png');
    const img = document.getElementById('certificate-image');
    img.src = dataURL;
  }

  // Download Certificate Button
  document.getElementById('download-cert-btn').addEventListener('click', () => {
    const canvas = document.getElementById('certificate-canvas');
    const image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    const link = document.createElement('a');
    link.download = 'CoordiCraft_Master_Certificate.png';
    link.href = image;
    link.click();
  });

  loadQuizQuestion();


  // ==========================================
  // UTILITY FUNCTIONS
  // ==========================================
  function shuffleArray(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
    return array;
  }

});
