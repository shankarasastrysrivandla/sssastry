/* ==========================================================================
   SoluCraft - Class XII NCERT Solutions Chemistry Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  
  // ==========================================
  // PROGRESS TRACKING & SYSTEM STATE
  // ==========================================
  const progressState = {
    conceptsRead: {
      "sol-types": false,
      "solubility": false,
      "raoults-law": false,
      "deviations": false,
      "colligative": false,
      "vanthoff": false
    },
    concentrationMixerUsed: false,
    raoultsForcesAdjusted: false,
    colligativeShiftsObserved: false,
    quizCompleted: false,
    quizScore: 0,
    studentName: ""
  };

  function updateOverallProgress() {
    let readCount = Object.values(progressState.conceptsRead).filter(Boolean).length;
    let readPercentage = (readCount / 6) * 50; // 50% weight for reading concepts
    
    let activityPercentage = 0;
    if (progressState.concentrationMixerUsed) activityPercentage += 10;
    if (progressState.raoultsForcesAdjusted) activityPercentage += 10;
    if (progressState.colligativeShiftsObserved) activityPercentage += 10;
    if (progressState.quizCompleted) {
      activityPercentage += 20;
    }

    const totalProgress = Math.round(readPercentage + activityPercentage);
    
    // Update DOM elements
    const percentText = document.getElementById('sidebar-progress-percent');
    const progressBar = document.getElementById('sidebar-progress-bar');
    if (percentText) percentText.innerText = totalProgress + '%';
    if (progressBar) progressBar.style.width = totalProgress + '%';
  }

  // MathJax safe trigger helper
  function triggerMathJax() {
    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise();
    }
  }

  // ==========================================
  // TAB NAVIGATION (SIDEBAR)
  // ==========================================
  const sidebarLinks = document.querySelectorAll('.nav-link');
  const tabPanels = document.querySelectorAll('.tab-panel');

  sidebarLinks.forEach(link => {
    link.addEventListener('click', () => {
      const targetTab = link.getAttribute('data-tab');
      
      sidebarLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      tabPanels.forEach(panel => {
        panel.classList.remove('active');
        if (panel.getAttribute('id') === targetTab) {
          panel.classList.add('active');
        }
      });

      // Special action: restart/initialize animation loops for specific tabs
      if (targetTab === 'concentration-lab') {
        initBeakerCanvas();
      } else if (targetTab === 'raoults-lab') {
        drawRaoultGraph();
      } else if (targetTab === 'colligative-lab') {
        initColligativeVisualizers();
      }

      // Re-typeset math elements
      triggerMathJax();
    });
  });

  // ==========================================
  // CORE CONCEPTS TAB SYSTEM (DASHBOARD)
  // ==========================================
  const conceptBtns = document.querySelectorAll('.concept-btn');
  const conceptContents = document.querySelectorAll('.concept-content');

  // Mark first concept as read on load
  progressState.conceptsRead['sol-types'] = true;
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

      // Re-typeset math elements
      triggerMathJax();
    });
  });

  // ==========================================
  // VIRTUAL LAB 1: CONCENTRATION MIXER
  // ==========================================
  const soluteData = {
    NaCl: { name: "Sodium Chloride", mw: 58.5, vanthoff: 2, color: "#ff7675" },
    Glucose: { name: "Glucose", mw: 180.0, vanthoff: 1, color: "#ffeaa7" },
    Urea: { name: "Urea", mw: 60.0, vanthoff: 1, color: "#55efc4" },
    Ethanol: { name: "Ethanol", mw: 46.0, vanthoff: 1, color: "#a29bfe" },
    CaCl2: { name: "Calcium Chloride", mw: 111.0, vanthoff: 3, color: "#fd79a8" }
  };

  const mixSoluteSelect = document.getElementById('mix-solute');
  const mixMassSlider = document.getElementById('mix-mass');
  const mixVolumeSlider = document.getElementById('mix-volume');
  const mixTempSlider = document.getElementById('mix-temp');

  const mixMassVal = document.getElementById('mix-mass-val');
  const mixVolumeVal = document.getElementById('mix-volume-val');
  const mixTempVal = document.getElementById('mix-temp-val');

  let beakerCanvas = document.getElementById('beaker-particles-canvas');
  let beakerCtx = beakerCanvas.getContext('2d');
  let particlesArray = [];
  let particlesAnimationId = null;

  // Sync inputs and trigger calculations
  mixSoluteSelect.addEventListener('change', () => {
    updateSoluteLegendColor();
    runConcentrationMath();
  });
  mixMassSlider.addEventListener('input', (e) => {
    mixMassVal.innerText = parseFloat(e.target.value).toFixed(1) + 'g';
    runConcentrationMath();
  });
  mixVolumeSlider.addEventListener('input', (e) => {
    mixVolumeVal.innerText = e.target.value + 'mL';
    runConcentrationMath();
  });
  mixTempSlider.addEventListener('input', (e) => {
    mixTempVal.innerText = e.target.value + '°C';
    runConcentrationMath();
  });

  function updateSoluteLegendColor() {
    const soluteKey = mixSoluteSelect.value;
    const color = soluteData[soluteKey].color;
    document.getElementById('legend-solute-color').style.backgroundColor = color;
  }

  function runConcentrationMath() {
    progressState.concentrationMixerUsed = true;
    updateOverallProgress();

    const soluteKey = mixSoluteSelect.value;
    const mass = parseFloat(mixMassSlider.value);
    const volume = parseFloat(mixVolumeSlider.value);
    const temp = parseFloat(mixTempSlider.value);

    const solute = soluteData[soluteKey];
    
    // 1. Water Density equation: rho = 1.00 - 0.00025 * Temp
    const waterDensity = 1.00 - 0.00025 * temp;
    
    // 2. Solvent Mass (g) = Volume (mL) * Water Density (approximate solvent volume matches beaker capacity minus solute displacing)
    // To make it straightforward: Solvent Mass = Volume * waterDensity
    const solventMassG = volume * waterDensity;
    document.getElementById('mix-solvent-mass').innerText = `~ ${solventMassG.toFixed(1)} g`;

    // 3. Moles calculation
    const molesSolute = mass / solute.mw;
    const molesWater = solventMassG / 18.02;

    // 4. Molarity (M) = Moles / (Volume in L)
    const molarity = molesSolute / (volume / 1000);
    
    // 5. Molality (m) = Moles / (Solvent Mass in kg)
    const molality = molesSolute / (solventMassG / 1000);

    // 6. Mole Fraction of Solute (X2) = n2 / (n1 + n2)
    const moleFraction = molesSolute / (molesSolute + molesWater);

    // 7. Mass Percent (w/w) = Mass Solute / Total Mass * 100
    const massPercent = (mass / (mass + solventMassG)) * 100;

    // 8. ppm = Mass Solute / Total Mass * 10^6
    const ppm = (mass / (mass + solventMassG)) * 1000000;

    // Update UI Results
    document.getElementById('res-molarity').innerText = molarity.toFixed(3) + ' mol/L';
    document.getElementById('res-molality').innerText = molality.toFixed(3) + ' mol/kg';
    document.getElementById('res-molefraction').innerText = moleFraction.toFixed(5);
    document.getElementById('res-masspercent').innerText = massPercent.toFixed(2) + ' %';
    document.getElementById('res-ppm').innerText = Math.round(ppm).toLocaleString() + ' ppm';

    // Update Recipe text box
    document.getElementById('recipe-text').innerHTML = `Dissolve <strong>${mass.toFixed(1)}g</strong> of ${solute.name} (${molesSolute.toFixed(3)} moles) in approx <strong>${solventMassG.toFixed(1)}g</strong> of pure water. Adjust final solution volume to <strong>${volume}mL</strong>.`;

    // Beaker Height Fill %
    const beakerFluid = document.getElementById('beaker-fluid');
    const heightPercent = Math.max(10, (volume / 1000) * 100); // map max 1000ml to 100% height
    beakerFluid.style.height = heightPercent + '%';

    // Set liquid color intensity: strong solutions are more saturated
    // Base blue: rgba(9, 132, 227, 0.3) to darker/saturated blue-green
    const concentrationRatio = Math.min(1.0, molarity / 4.0); // capped at 4M for visual max
    const fluidOpacity = 0.2 + (concentrationRatio * 0.55);
    beakerFluid.style.background = `linear-gradient(180deg, rgba(9, 132, 227, ${fluidOpacity}) 0%, rgba(0, 242, 254, ${fluidOpacity + 0.1}) 100%)`;

    // Adjust particle count and speeds
    updateBeakerParticles(molesSolute, temp, solute.color);
  }

  function initBeakerCanvas() {
    if (particlesAnimationId) {
      cancelAnimationFrame(particlesAnimationId);
    }
    const beakerFillDiv = document.getElementById('beaker-fluid');
    beakerCanvas.width = beakerFillDiv.clientWidth || 170;
    beakerCanvas.height = beakerFillDiv.clientHeight || 240;

    runConcentrationMath();
    animateBeakerParticles();
  }

  // Handle window resizing once
  window.addEventListener('resize', () => {
    if (document.getElementById('concentration-lab').classList.contains('active')) {
      const beakerFillDiv = document.getElementById('beaker-fluid');
      if (beakerFillDiv) {
        beakerCanvas.width = beakerFillDiv.clientWidth || 170;
        beakerCanvas.height = beakerFillDiv.clientHeight || 240;
        runConcentrationMath();
      }
    }
  });

  class BeakerParticle {
    constructor(x, y, color, speedFactor, radius, type) {
      this.x = x;
      this.y = y;
      this.color = color;
      this.radius = radius;
      this.type = type; // 'water' or 'solute'
      this.vx = (Math.random() - 0.5) * speedFactor;
      this.vy = (Math.random() - 0.5) * speedFactor;
    }

    update(width, height) {
      this.x += this.vx;
      this.y += this.vy;

      // Bounce borders
      if (this.x < this.radius || this.x > width - this.radius) this.vx *= -1;
      if (this.y < this.radius || this.y > height - this.radius) this.vy *= -1;
      
      // Keep inside bounds
      this.x = Math.max(this.radius, Math.min(width - this.radius, this.x));
      this.y = Math.max(this.radius, Math.min(height - this.radius, this.y));
    }

    draw(ctx) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
      if (this.type === 'solute') {
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }

  function updateBeakerParticles(moles, temp, soluteColor) {
    const soluteCount = Math.min(65, Math.max(5, Math.round(moles * 100)));
    const waterCount = 35; // stable background
    
    // speed proportional to Temp
    const speedFactor = 0.5 + (temp / 80) * 2.0;

    particlesArray = [];

    const w = beakerCanvas.width || 170;
    const h = beakerCanvas.height || 100;

    // Create Water Particles (small blue dots)
    for (let i = 0; i < waterCount; i++) {
      particlesArray.push(new BeakerParticle(
        Math.random() * w,
        Math.random() * h,
        'rgba(0, 242, 254, 0.25)',
        speedFactor * 0.5,
        3,
        'water'
      ));
    }

    // Create Solute Particles (larger colorful dots)
    for (let i = 0; i < soluteCount; i++) {
      particlesArray.push(new BeakerParticle(
        Math.random() * w,
        Math.random() * h,
        soluteColor,
        speedFactor * 1.2,
        6,
        'solute'
      ));
    }
  }

  function animateBeakerParticles() {
    const w = beakerCanvas.width;
    const h = beakerCanvas.height;

    // Clear canvas
    beakerCtx.clearRect(0, 0, w, h);

    // Draw scale lines behind particles
    beakerCtx.strokeStyle = 'rgba(255,255,255,0.06)';
    beakerCtx.lineWidth = 1;
    for (let y = 30; y < h; y += 40) {
      beakerCtx.beginPath();
      beakerCtx.moveTo(0, y);
      beakerCtx.lineTo(w, y);
      beakerCtx.stroke();
    }

    // Render each particle
    particlesArray.forEach(p => {
      p.update(w, h);
      p.draw(beakerCtx);
    });

    particlesAnimationId = requestAnimationFrame(animateBeakerParticles);
  }

  // ==========================================
  // VIRTUAL LAB 2: RAOULT'S LAW DEVIATIONS
  // ==========================================
  const forceSlider = document.getElementById('force-slider');
  const graphCanvas = document.getElementById('raoult-graph-canvas');
  const graphCtx = graphCanvas.getContext('2d');

  forceSlider.addEventListener('input', () => {
    progressState.raoultsForcesAdjusted = true;
    updateOverallProgress();
    drawRaoultGraph();
  });

  const deviationInfo = {
    "ideal": {
      title: "Ideal Solution (No Deviation)",
      forces: "A-B molecular attractions are equal to A-A and B-B forces.",
      badge: "Ideal (No Deviation)",
      badgeClass: "deviation-badge",
      examples: "• Benzene + Toluene<br>• n-Hexane + n-Heptane<br>• Bromoethane + Iodoethane",
      hVal: "= 0 (Zero heat exchange)",
      vVal: "= 0 (Zero volume change)",
      mechanism: "Forces are perfectly balanced. The escaping tendency of A and B molecules remains exactly proportional to their concentration in the liquid mixture.",
      azeotrope: false
    },
    "positive": {
      title: "Positive Deviation (Weaker A-B)",
      forces: "A-B attractions are weaker than self-attractions (A-A and B-B).",
      badge: "Positive Deviation",
      badgeClass: "deviation-badge positive",
      examples: "• Ethanol + Acetone<br>• Carbon disulfide + Acetone<br>• Acetone + Benzene",
      hVal: "> 0 (Endothermic, absorbs heat)",
      vVal: "> 0 (Volume expands)",
      mechanism: "Since A and B molecules don't attract each other strongly, they find it easier to escape the liquid surface. This increases the individual and total vapor pressures above the ideal lines.",
      azeotrope: true,
      azeotropeText: "<strong>Minimum Boiling Azeotrope:</strong> At the maximum point of positive deviation, the vapor pressure reaches its highest peak. Consequently, this solution boils at a temperature lower than either of its pure constituents."
    },
    "negative": {
      title: "Negative Deviation (Stronger A-B)",
      forces: "A-B attractions are stronger than self-attractions (e.g. hydrogen bonding).",
      badge: "Negative Deviation",
      badgeClass: "deviation-badge negative",
      examples: "• Chloroform + Acetone<br>• Nitric acid + Water<br>• Phenol + Aniline",
      hVal: "< 0 (Exothermic, releases heat)",
      vVal: "< 0 (Volume contracts)",
      mechanism: "A and B molecules form strong complex bonds (like Chloroform-Acetone H-bonds) in solution. Molecules are held tightly in liquid phase, decreasing their tendency to escape and depressing vapor pressures below ideal.",
      azeotrope: true,
      azeotropeText: "<strong>Maximum Boiling Azeotrope:</strong> At the deepest point of negative deviation, the vapor pressure hits its lowest trough. Consequently, this solution boils at a temperature higher than either of its pure constituents."
    }
  };

  function drawRaoultGraph() {
    const val = parseInt(forceSlider.value);
    let state = "ideal";
    if (val > 0) state = "positive";
    if (val < 0) state = "negative";

    const info = deviationInfo[state];

    // Update UI details
    document.getElementById('interaction-title').innerText = info.title;
    document.getElementById('interaction-forces').innerText = info.forces;
    
    const badge = document.getElementById('deviation-badge-val');
    badge.className = info.badgeClass;
    badge.innerText = info.badge;

    document.getElementById('chem-examples-list').innerHTML = info.examples;
    document.getElementById('thermo-h').innerText = info.hVal;
    document.getElementById('thermo-v').innerText = info.vVal;
    document.getElementById('interaction-mechanism-text').innerHTML = info.mechanism;

    const azBox = document.getElementById('azeotrope-warning-box');
    if (info.azeotrope && Math.abs(val) >= 4) {
      azBox.classList.remove('hidden');
      azBox.innerHTML = info.azeotropeText;
    } else {
      azBox.classList.add('hidden');
    }

    // Canvas drawing
    const w = graphCanvas.width;
    const h = graphCanvas.height;
    
    graphCtx.clearRect(0, 0, w, h);

    const padding = 50;
    const graphWidth = w - padding * 2;
    const graphHeight = h - padding * 2;

    // Axis lines
    graphCtx.strokeStyle = 'rgba(255,255,255,0.15)';
    graphCtx.lineWidth = 2;
    graphCtx.beginPath();
    // Y1 Axis (Left)
    graphCtx.moveTo(padding, padding);
    graphCtx.lineTo(padding, h - padding);
    // Y2 Axis (Right)
    graphCtx.moveTo(w - padding, padding);
    graphCtx.lineTo(w - padding, h - padding);
    // X Axis (Bottom)
    graphCtx.moveTo(padding, h - padding);
    graphCtx.lineTo(w - padding, h - padding);
    graphCtx.stroke();

    // Labels & Text styling
    graphCtx.fillStyle = 'rgba(255,255,255,0.7)';
    graphCtx.font = '11px Inter, sans-serif';
    graphCtx.textAlign = 'center';

    // X axis ticks labels
    graphCtx.fillText('χ_A = 1', padding, h - padding + 18);
    graphCtx.fillText('χ_B = 0', padding, h - padding + 32);
    graphCtx.fillText('χ_A = 0', w - padding, h - padding + 18);
    graphCtx.fillText('χ_B = 1', w - padding, h - padding + 32);

    graphCtx.fillText('Mole Fraction', w / 2, h - 8);

    // Left Y Axis labels
    graphCtx.textAlign = 'right';
    graphCtx.fillText('p_A° = 150 mmHg', padding - 10, h - padding - 150 + 4);
    // Right Y Axis labels
    graphCtx.textAlign = 'left';
    graphCtx.fillText('p_B° = 200 mmHg', w - padding + 10, h - padding - 200 + 4);

    // Grid guide lines (Vapor Pressure limits)
    graphCtx.strokeStyle = 'rgba(255,255,255,0.05)';
    graphCtx.lineWidth = 1;
    graphCtx.beginPath();
    graphCtx.moveTo(padding, h - padding - 150);
    graphCtx.lineTo(w - padding, h - padding - 150);
    graphCtx.moveTo(padding, h - padding - 200);
    graphCtx.lineTo(w - padding, h - padding - 200);
    graphCtx.stroke();

    // Ideal equations lines (Straight references)
    // Pure A (x_A=1, left) = 150. Pure B (x_B=1, right) = 200.
    // pA ideal: straight line from (padding, h - padding - 150) to (w - padding, h - padding)
    // pB ideal: straight line from (padding, h - padding) to (w - padding, h - padding - 200)
    // Ptotal ideal: straight line from (padding, h - padding - 150) to (w - padding, h - padding - 200)
    
    // Draw Ideal lines faint
    graphCtx.strokeStyle = 'rgba(255,255,255,0.1)';
    graphCtx.lineWidth = 1;
    graphCtx.setLineDash([5, 5]);
    
    graphCtx.beginPath();
    graphCtx.moveTo(padding, h - padding - 150);
    graphCtx.lineTo(w - padding, h - padding);
    graphCtx.moveTo(padding, h - padding);
    graphCtx.lineTo(w - padding, h - padding - 200);
    graphCtx.moveTo(padding, h - padding - 150);
    graphCtx.lineTo(w - padding, h - padding - 200);
    graphCtx.stroke();
    graphCtx.setLineDash([]); // Reset line dash

    // Plotting the actual curves depending on force slider
    const deviationMult = val * 22; // multiplier scale for curves bending
    
    // p_A Curve
    graphCtx.strokeStyle = '#ff7675';
    graphCtx.lineWidth = 2.5;
    graphCtx.beginPath();
    for (let x = 0; x <= graphWidth; x++) {
      let xB = x / graphWidth;
      let xA = 1 - xB;
      // p_A = p_A^0 * x_A + curve
      let idealPA = 150 * xA;
      // Quadratic curve that is zero at endpoints: curve = k * x_A * x_B
      let curve = deviationMult * xA * xB;
      let y = h - padding - (idealPA + curve);
      if (x === 0) graphCtx.moveTo(padding + x, y);
      else graphCtx.lineTo(padding + x, y);
    }
    graphCtx.stroke();

    // p_B Curve
    graphCtx.strokeStyle = '#74b9ff';
    graphCtx.lineWidth = 2.5;
    graphCtx.beginPath();
    for (let x = 0; x <= graphWidth; x++) {
      let xB = x / graphWidth;
      let xA = 1 - xB;
      let idealPB = 200 * xB;
      let curve = deviationMult * xA * xB;
      let y = h - padding - (idealPB + curve);
      if (x === 0) graphCtx.moveTo(padding + x, y);
      else graphCtx.lineTo(padding + x, y);
    }
    graphCtx.stroke();

    // P_total Curve
    graphCtx.strokeStyle = '#00f2fe';
    graphCtx.lineWidth = 4;
    graphCtx.beginPath();
    for (let x = 0; x <= graphWidth; x++) {
      let xB = x / graphWidth;
      let xA = 1 - xB;
      let idealPA = 150 * xA;
      let idealPB = 200 * xB;
      let curvePA = deviationMult * xA * xB;
      let curvePB = deviationMult * xA * xB;
      let y = h - padding - (idealPA + curvePA + idealPB + curvePB);
      if (x === 0) graphCtx.moveTo(padding + x, y);
      else graphCtx.lineTo(padding + x, y);
    }
    graphCtx.stroke();

    // Draw Title Labels on curves
    graphCtx.fillStyle = '#00f2fe';
    graphCtx.font = 'bold 12px Inter, sans-serif';
    graphCtx.fillText('P_total', w/2, h - padding - (175 + deviationMult * 0.5) - 15);
  }

  // ==========================================
  // VIRTUAL LAB 3: COLLIGATIVE PROPERTIES
  // ==========================================
  const collSoluteSelect = document.getElementById('coll-solute');
  const collMolalitySlider = document.getElementById('coll-molality');
  const collMolalityVal = document.getElementById('coll-molality-val');

  const vizTabs = document.querySelectorAll('.viz-tab-btn');
  const vizContents = document.querySelectorAll('.viz-content');

  const osmosisCanvas = document.getElementById('osmosis-canvas');
  const osmosisCtx = osmosisCanvas.getContext('2d');
  const phaseCanvas = document.getElementById('phasediagram-canvas');
  const phaseCtx = phaseCanvas.getContext('2d');

  let activeVizTab = "osmosis";
  let osmosisParticles = [];
  let osmosisAnimationId = null;
  let osmoticPressureApplied = false;
  let membraneX = 280;

  // Constants for Water solvent
  const Kf = 1.86;
  const Kb = 0.52;

  collSoluteSelect.addEventListener('change', runColligativeMath);
  collMolalitySlider.addEventListener('input', (e) => {
    collMolalityVal.innerText = parseFloat(e.target.value).toFixed(1) + ' mol/kg';
    runColligativeMath();
  });

  // Apply Osmotic Pressure toggle
  document.getElementById('btn-apply-pressure').addEventListener('click', (e) => {
    osmoticPressureApplied = !osmoticPressureApplied;
    if (osmoticPressureApplied) {
      e.target.innerText = "Release Osmotic Pressure";
      e.target.classList.add('btn-glow');
    } else {
      e.target.innerText = "Apply Osmotic Pressure (Π)";
      e.target.classList.remove('btn-glow');
    }
  });

  // Viz Tabs control
  vizTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      vizTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      activeVizTab = tab.getAttribute('data-viz');
      vizContents.forEach(c => {
        c.classList.remove('active');
        if (c.getAttribute('id') === `viz-${activeVizTab}`) {
          c.classList.add('active');
        }
      });

      initColligativeVisualizers();
    });
  });

  function runColligativeMath() {
    progressState.colligativeShiftsObserved = true;
    updateOverallProgress();

    const soluteKey = collSoluteSelect.value;
    const molality = parseFloat(collMolalitySlider.value);
    
    let iFactor = 1.0;
    if (soluteKey === "NaCl") iFactor = 2.0;
    if (soluteKey === "CaCl2") iFactor = 3.0;

    // Calculate Delta Tf and Delta Tb
    const dTf = iFactor * Kf * molality;
    const dTb = iFactor * Kb * molality;

    const newTf = 0.0 - dTf;
    const newTb = 100.0 + dTb;

    // Osmotic Pressure = i * C * R * T (approximate C by molality m)
    // Pi = i * m * 0.0821 * 298.15
    const osmoticPressure = iFactor * molality * 0.0821 * 298.15;

    // Update UI Elements
    document.getElementById('coll-dtf').innerText = dTf.toFixed(2) + ' °C';
    document.getElementById('coll-newtf').innerText = newTf.toFixed(2) + ' °C';
    document.getElementById('coll-dtb').innerText = dTb.toFixed(2) + ' °C';
    document.getElementById('coll-newtb').innerText = newTb.toFixed(2) + ' °C';
    
    const iBadge = document.getElementById('coll-i-factor');
    iBadge.innerText = iFactor.toFixed(2);
    
    document.getElementById('val-osmotic-pressure').innerText = osmoticPressure.toFixed(1) + ' atm';

    // Sync visual updates
    if (activeVizTab === "osmosis") {
      updateOsmosisProperties(iFactor, molality);
    } else {
      drawPhaseDiagram(dTf, dTb);
    }
  }

  function initColligativeVisualizers() {
    cancelAnimationFrame(osmosisAnimationId);
    
    if (activeVizTab === "osmosis") {
      osmosisCanvas.width = 560;
      osmosisCanvas.height = 300;
      setupOsmosisParticles();
      animateOsmosis();
    } else {
      phaseCanvas.width = 560;
      phaseCanvas.height = 300;
      runColligativeMath(); // triggers drawPhaseDiagram()
    }
  }

  // Osmosis animation setup
  class OsmosisParticle {
    constructor(x, y, type, color, radius, allowedSide) {
      this.x = x;
      this.y = y;
      this.type = type; // 'water' or 'solute'
      this.color = color;
      this.radius = radius;
      this.allowedSide = allowedSide; // 'left', 'right', or 'any'
      
      const angle = Math.random() * Math.PI * 2;
      const speed = type === 'solute' ? 1.0 : 1.8;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
    }

    update(w, h, liquidHeights, appliedPressure) {
      this.x += this.vx;
      this.y += this.vy;

      // Vertical wall bounce (SPM interactions)
      // SPM is at x = 280
      const currentSide = this.x < membraneX ? 'left' : 'right';
      const heightLimit = currentSide === 'left' ? h - liquidHeights.left : h - liquidHeights.right;

      // Top water surface bounces
      if (this.y < heightLimit + this.radius) {
        this.vy = Math.abs(this.vy);
        this.y = heightLimit + this.radius;
      }

      // Bottom bounce
      if (this.y > h - this.radius) {
        this.vy = -Math.abs(this.vy);
        this.y = h - this.radius;
      }

      // Left and Right outer wall bounces
      if (this.x < this.radius) {
        this.vx = Math.abs(this.vx);
        this.x = this.radius;
      }
      if (this.x > w - this.radius) {
        this.vx = -Math.abs(this.vx);
        this.x = w - this.radius;
      }

      // Semi-permeable membrane boundary bounce (x = 280)
      if (this.type === 'solute') {
        // Solute cannot cross membrane (always bounces off membraneX)
        if (this.x > membraneX - this.radius && this.x < membraneX + 5) {
          this.vx = -Math.abs(this.vx);
          this.x = membraneX - this.radius;
        }
      } else {
        // Water can cross. But if osmotic pressure is NOT applied,
        // we simulate a slight bias of flow from left to right.
        // If osmotic pressure is applied, we push them back with bias right to left.
        if (Math.abs(this.x - membraneX) < this.radius + 1) {
          let crossChance = Math.random();
          let bias = 0.53; // default flow: left to right (53% cross right, 47% cross left)
          if (appliedPressure) {
            bias = 0.38; // reversed flow: right to left
          }

          if (this.vx > 0) { // moving right
            if (crossChance > bias) {
              this.vx = -this.vx; // bounce back
            }
          } else { // moving left
            if (crossChance > (1 - bias)) {
              this.vx = -this.vx; // bounce back
            }
          }
        }
      }
    }

    draw(ctx) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
      if (this.type === 'solute') {
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }

  let liquidLevels = { left: 160, right: 160, targetLeft: 160, targetRight: 160 };

  function setupOsmosisParticles() {
    osmosisParticles = [];
    const w = osmosisCanvas.width;
    const h = osmosisCanvas.height;

    // reset liquid levels
    liquidLevels = { left: 180, right: 180, targetLeft: 180, targetRight: 180 };

    // Water particles in left chamber (Pure water)
    for (let i = 0; i < 40; i++) {
      osmosisParticles.push(new OsmosisParticle(
        Math.random() * (membraneX - 20) + 10,
        Math.random() * 100 + 190,
        'water',
        'rgba(0, 242, 254, 0.65)',
        3.5,
        'left'
      ));
    }

    // Water particles in right chamber (Solution)
    for (let i = 0; i < 30; i++) {
      osmosisParticles.push(new OsmosisParticle(
        Math.random() * (w - membraneX - 30) + membraneX + 15,
        Math.random() * 100 + 190,
        'water',
        'rgba(0, 242, 254, 0.65)',
        3.5,
        'right'
      ));
    }
  }

  function updateOsmosisProperties(iFactor, molality) {
    const soluteCount = Math.round(iFactor * molality * 4.5);
    const w = osmosisCanvas.width;
    const h = osmosisCanvas.height;

    // Filter out old solute particles
    osmosisParticles = osmosisParticles.filter(p => p.type === 'water');

    // Add new solute particles on the right side
    const soluteColor = collSoluteSelect.value === 'Glucose' ? '#ffeaa7' : collSoluteSelect.value === 'NaCl' ? '#ff7675' : '#fd79a8';
    for (let i = 0; i < soluteCount; i++) {
      osmosisParticles.push(new OsmosisParticle(
        Math.random() * (w - membraneX - 40) + membraneX + 20,
        Math.random() * 100 + 190,
        'solute',
        soluteColor,
        7,
        'right'
      ));
    }

    // Dynamically adjust TARGET levels based on concentration
    // If no pressure applied, solution level rises, solvent falls.
    const concentrationShift = molality * iFactor * 10;
    if (osmoticPressureApplied) {
      liquidLevels.targetLeft = 180;
      liquidLevels.targetRight = 180;
    } else {
      liquidLevels.targetLeft = 180 - concentrationShift;
      liquidLevels.targetRight = 180 + concentrationShift;
    }
  }

  function animateOsmosis() {
    const w = osmosisCanvas.width;
    const h = osmosisCanvas.height;

    osmosisCtx.clearRect(0, 0, w, h);

    // Smooth adjustment of liquid levels
    liquidLevels.left += (liquidLevels.targetLeft - liquidLevels.left) * 0.05;
    liquidLevels.right += (liquidLevels.targetRight - liquidLevels.right) * 0.05;

    // Draw Liquid Backings
    osmosisCtx.fillStyle = 'rgba(9, 132, 227, 0.08)';
    // Left Chamber Fill
    osmosisCtx.fillRect(0, h - liquidLevels.left, membraneX, liquidLevels.left);
    // Right Chamber Fill
    osmosisCtx.fillStyle = 'rgba(9, 132, 227, 0.15)';
    osmosisCtx.fillRect(membraneX, h - liquidLevels.right, w - membraneX, liquidLevels.right);

    // Draw Chambers borders
    osmosisCtx.strokeStyle = 'rgba(255,255,255,0.15)';
    osmosisCtx.lineWidth = 2;
    osmosisCtx.strokeRect(0, 0, w, h);

    // Draw Semi-Permeable Membrane (SPM) in middle (dashed line)
    osmosisCtx.strokeStyle = '#00f2fe';
    osmosisCtx.lineWidth = 3;
    osmosisCtx.setLineDash([8, 8]);
    osmosisCtx.beginPath();
    osmosisCtx.moveTo(membraneX, 0);
    osmosisCtx.lineTo(membraneX, h);
    osmosisCtx.stroke();
    osmosisCtx.setLineDash([]); // reset

    // Draw Piston if Osmotic Pressure is Applied
    if (osmoticPressureApplied) {
      osmosisCtx.fillStyle = 'rgba(0, 242, 254, 0.3)';
      osmosisCtx.strokeStyle = '#00f2fe';
      osmosisCtx.lineWidth = 2;
      // Draw piston plate pressing the right side fluid surface
      const pistonY = h - liquidLevels.right - 10;
      osmosisCtx.fillRect(membraneX + 4, pistonY, w - membraneX - 8, 12);
      osmosisCtx.strokeRect(membraneX + 4, pistonY, w - membraneX - 8, 12);
      
      // Draw force indicator arrows pressing down
      osmosisCtx.fillStyle = '#00f2fe';
      osmosisCtx.font = 'bold 10px Inter, sans-serif';
      osmosisCtx.textAlign = 'center';
      osmosisCtx.fillText('APPLIED PRESSURE (P = Π)', (membraneX + w)/2, pistonY - 14);
      
      osmosisCtx.beginPath();
      // Draw 3 down arrows
      for (let offset = 40; offset < w - membraneX; offset += 80) {
        let ax = membraneX + offset;
        osmosisCtx.moveTo(ax, pistonY - 12);
        osmosisCtx.lineTo(ax, pistonY - 2);
        osmosisCtx.lineTo(ax - 4, pistonY - 6);
        osmosisCtx.moveTo(ax, pistonY - 2);
        osmosisCtx.lineTo(ax + 4, pistonY - 6);
      }
      osmosisCtx.stroke();
    }

    // Update target levels depending on pressure applied state
    const soluteKey = collSoluteSelect.value;
    const molality = parseFloat(collMolalitySlider.value);
    let iFactor = 1.0;
    if (soluteKey === "NaCl") iFactor = 2.0;
    if (soluteKey === "CaCl2") iFactor = 3.0;
    const concentrationShift = molality * iFactor * 9;

    if (osmoticPressureApplied) {
      liquidLevels.targetLeft = 180;
      liquidLevels.targetRight = 180;
    } else {
      liquidLevels.targetLeft = 180 - concentrationShift;
      liquidLevels.targetRight = 180 + concentrationShift;
    }

    // Render particles
    osmosisParticles.forEach(p => {
      p.update(w, h, liquidLevels, osmoticPressureApplied);
      p.draw(osmosisCtx);
    });

    osmosisAnimationId = requestAnimationFrame(animateOsmosis);
  }

  function drawPhaseDiagram(dTf, dTb) {
    const w = phaseCanvas.width;
    const h = phaseCanvas.height;

    phaseCtx.clearRect(0, 0, w, h);

    const padding = 50;
    const graphWidth = w - padding * 2;
    const graphHeight = h - padding * 2;

    // Draw Axes
    phaseCtx.strokeStyle = 'rgba(255,255,255,0.15)';
    phaseCtx.lineWidth = 2;
    phaseCtx.beginPath();
    // Y-Axis (Vapor Pressure)
    phaseCtx.moveTo(padding, padding);
    phaseCtx.lineTo(padding, h - padding);
    // X-Axis (Temperature)
    phaseCtx.moveTo(padding, h - padding);
    phaseCtx.lineTo(w - padding, h - padding);
    phaseCtx.stroke();

    // Axis titles
    phaseCtx.fillStyle = 'rgba(255,255,255,0.7)';
    phaseCtx.font = '11px Inter, sans-serif';
    phaseCtx.textAlign = 'center';
    phaseCtx.fillText('Temperature (T) →', w/2, h - 12);
    
    // Vertical text for Y axis
    phaseCtx.save();
    phaseCtx.translate(14, h/2);
    phaseCtx.rotate(-Math.PI / 2);
    phaseCtx.fillText('Vapor Pressure (P) →', 0, 0);
    phaseCtx.restore();

    // 1. Atmosphere pressure line (1 atm horizontal line)
    const atmY = padding + 50;
    phaseCtx.strokeStyle = 'rgba(255, 234, 0, 0.25)';
    phaseCtx.lineWidth = 1;
    phaseCtx.setLineDash([4, 4]);
    phaseCtx.beginPath();
    phaseCtx.moveTo(padding, atmY);
    phaseCtx.lineTo(w - padding, atmY);
    phaseCtx.stroke();
    phaseCtx.setLineDash([]);
    phaseCtx.fillStyle = '#ffea00';
    phaseCtx.font = '9px JetBrains Mono';
    phaseCtx.fillText('1 atm pressure', w - padding - 50, atmY - 6);

    // 2. Plot curves:
    // Pure liquid solvent curves: curve upwards right.
    // Liquid solution curves: curve upwards right, shifted down/right.
    // Frozen solvent (solid curve): sharp descent left.
    
    // Solid line (sublimation line)
    // From bottom left to triple point
    const triX = padding + 150;
    const triY = h - padding - 80;

    phaseCtx.strokeStyle = '#8ca3ba';
    phaseCtx.lineWidth = 2;
    phaseCtx.beginPath();
    phaseCtx.moveTo(padding + 20, h - padding - 20);
    phaseCtx.quadraticCurveTo(triX - 60, triY - 30, triX, triY);
    phaseCtx.stroke();
    phaseCtx.fillStyle = '#8ca3ba';
    phaseCtx.font = '9px Inter';
    phaseCtx.fillText('Solid Solvent', triX - 70, triY + 20);

    // Liquid Pure Solvent Curve (Blue)
    phaseCtx.strokeStyle = '#00b0ff';
    phaseCtx.lineWidth = 2.5;
    phaseCtx.beginPath();
    phaseCtx.moveTo(triX, triY);
    // Curves up to boiling point intersection
    const pureBoilX = triX + 180;
    phaseCtx.quadraticCurveTo(pureBoilX - 70, atmY + 60, pureBoilX, atmY);
    phaseCtx.quadraticCurveTo(pureBoilX + 30, atmY - 20, w - padding - 10, padding + 10);
    phaseCtx.stroke();
    phaseCtx.fillStyle = '#00b0ff';
    phaseCtx.fillText('Pure Solvent', pureBoilX - 30, atmY + 70);

    // Solution Liquid Curve (Purple dashed/dashed-solid)
    // Solution sits below, shifted to the right. Shift amount proportional to dTb/dTf
    const shiftScale = Math.min(22, dTf * 8);
    const solBoilX = pureBoilX + shiftScale;
    const solTriX = triX - shiftScale;
    const solTriY = triY - (shiftScale * 0.4);

    phaseCtx.strokeStyle = '#d500f9';
    phaseCtx.lineWidth = 2;
    phaseCtx.setLineDash([4, 3]);
    phaseCtx.beginPath();
    // Start slightly below triX on solid curve
    phaseCtx.moveTo(solTriX, solTriY);
    phaseCtx.quadraticCurveTo(solBoilX - 70, atmY + 75, solBoilX, atmY);
    phaseCtx.quadraticCurveTo(solBoilX + 30, atmY - 15, w - padding - 5, padding + 20);
    phaseCtx.stroke();
    phaseCtx.setLineDash([]);
    phaseCtx.fillStyle = '#d500f9';
    phaseCtx.fillText('Solution', solBoilX - 25, atmY + 105);

    // Draw Vertical intersection markers for Boiling Points
    phaseCtx.strokeStyle = 'rgba(255,255,255,0.15)';
    phaseCtx.lineWidth = 1;
    
    // T_b^0 (Pure boiling point)
    phaseCtx.beginPath();
    phaseCtx.moveTo(pureBoilX, atmY);
    phaseCtx.lineTo(pureBoilX, h - padding);
    phaseCtx.stroke();
    phaseCtx.fillStyle = '#00b0ff';
    phaseCtx.fillText('T_b°', pureBoilX, h - padding + 14);

    // T_b (Solution boiling point)
    phaseCtx.beginPath();
    phaseCtx.moveTo(solBoilX, atmY);
    phaseCtx.lineTo(solBoilX, h - padding);
    phaseCtx.stroke();
    phaseCtx.fillStyle = '#d500f9';
    phaseCtx.fillText('T_b', solBoilX, h - padding + 14);

    // Draw Vertical intersection markers for Freezing Points
    // Triple point intersections: solid line crossing liquid curves
    phaseCtx.beginPath();
    phaseCtx.moveTo(triX, triY);
    phaseCtx.lineTo(triX, h - padding);
    phaseCtx.stroke();
    phaseCtx.fillStyle = '#00b0ff';
    phaseCtx.fillText('T_f°', triX, h - padding + 14);

    phaseCtx.beginPath();
    phaseCtx.moveTo(solTriX, solTriY);
    phaseCtx.lineTo(solTriX, h - padding);
    phaseCtx.stroke();
    phaseCtx.fillStyle = '#d500f9';
    phaseCtx.fillText('T_f', solTriX, h - padding + 14);

    // Highlight shift intervals
    // Boiling point shift
    phaseCtx.strokeStyle = '#00f2fe';
    phaseCtx.lineWidth = 1.5;
    phaseCtx.beginPath();
    phaseCtx.moveTo(pureBoilX, h - padding - 15);
    phaseCtx.lineTo(solBoilX, h - padding - 15);
    phaseCtx.stroke();
    phaseCtx.fillStyle = '#00f2fe';
    phaseCtx.fillText('ΔT_b', (pureBoilX + solBoilX)/2, h - padding - 22);

    // Freezing point shift
    phaseCtx.beginPath();
    phaseCtx.moveTo(solTriX, h - padding - 15);
    phaseCtx.lineTo(triX, h - padding - 15);
    phaseCtx.stroke();
    phaseCtx.fillText('ΔT_f', (solTriX + triX)/2, h - padding - 22);
  }

  // ==========================================
  // QUIZ ENGINE (25 NCERT SOLUTIONS QUESTIONS)
  // ==========================================
  const quizQuestions = [
    {
      question: "Which of the following units of concentration is independent of temperature?",
      options: [
        "Molarity (M)",
        "Molality (m)",
        "Normality (N)",
        "Mass by volume percentage (w/V)"
      ],
      correct: 1,
      explanation: "Molality (m) is defined as the moles of solute per kilogram of solvent. Since mass does not change with temperature, molality is temperature independent. Molarity and Normality depend on solution volume, which expands/contracts with temperature."
    },
    {
      question: "What is the mole fraction of ethylene glycol (\(\text{C}_2\text{H}_6\text{O}_2\)) in a solution containing 20% of ethylene glycol by mass in water?",
      options: [
        "0.068",
        "0.032",
        "0.168",
        "0.932"
      ],
      correct: 0,
      explanation: "Assume 100g solution: Mass of glycol = 20g (moles = 20/62 = 0.322 mol). Mass of water = 80g (moles = 80/18 = 4.444 mol). Mole fraction of glycol \(\chi = \frac{0.322}{0.322 + 4.444} = 0.068\)."
    },
    {
      question: "Which type of solution is represented by a mixture of nitrogen gas and oxygen gas?",
      options: [
        "Gas in Liquid solution",
        "Gas in Gas solution",
        "Liquid in Gas solution",
        "Solid in Gas solution"
      ],
      correct: 1,
      explanation: "Air, which is a homogeneous mixture of nitrogen and oxygen gases, represents a gas-in-gas solution since both the solute and solvent are in the gaseous state."
    },
    {
      question: "Which of the following statements about Henry's Law constant (\(K_H\)) is correct?",
      options: [
        "Higher the value of \(K_H\) at a given pressure, the higher is the solubility of the gas.",
        "Higher the value of \(K_H\) at a given pressure, the lower is the solubility of the gas.",
        "\(K_H\) value is constant for all gases and is independent of temperature.",
        "\(K_H\) value decreases with an increase in temperature."
      ],
      correct: 1,
      explanation: "According to Henry's Law, \(p = K_H \cdot \chi\), or \(\chi = p / K_H\). Therefore, at a given partial pressure, a larger Henry's constant (\(K_H\)) corresponds to a smaller mole fraction (\(\chi\)) of gas in solution, meaning lower solubility."
    },
    {
      question: "Why are aquatic species more comfortable in cold water than in warm water?",
      options: [
        "Solubility of oxygen gas increases with an increase in temperature.",
        "Solubility of oxygen gas decreases with a decrease in temperature.",
        "Solubility of oxygen gas increases with a decrease in temperature (cold water).",
        "Henry's law constant (\(K_H\)) decreases as temperature increases."
      ],
      correct: 2,
      explanation: "Gas dissolution in water is an exothermic process (\(\Delta H < 0\)). According to Le Chatelier's principle, lowering temperature shifts equilibrium to favor dissolution. Thus, oxygen dissolves more in cold water (lower \(K_H\)), making aquatic life comfortable."
    },
    {
      question: "Scuba divers carry tanks diluted with Helium (11.7% He, 56.2% N₂, 32.1% O₂) to avoid which medical condition?",
      options: [
        "Anoxia",
        "Bends (decompression sickness)",
        "Acidosis",
        "Hyperventilation"
      ],
      correct: 1,
      explanation: "At high underwater pressure, nitrogen dissolves heavily in blood. When diving back up, pressure drops and dissolved nitrogen forms painful, dangerous bubbles in blood capillaries (Bends). Diluting with low-solubility Helium prevents this."
    },
    {
      question: "At high altitudes, low partial pressure of oxygen leads to low concentration of oxygen in blood, causing breathing struggles and confusion. This condition is called:",
      options: [
        "Bends",
        "Anoxia",
        "Asphyxia",
        "Anaemia"
      ],
      correct: 1,
      explanation: "At high altitudes, the partial pressure of oxygen is less than that at ground level. This leads to low oxygen levels in tissues and blood of climbers, resulting in weakness and inability to think clearly—a condition known as Anoxia."
    },
    {
      question: "If two liquids A and B form an ideal solution, which of the following thermodynamic relations is true?",
      options: [
        "\(\Delta H_{\text{mix}} > 0, \Delta V_{\text{mix}} > 0\)",
        "\(\Delta H_{\text{mix}} < 0, \Delta V_{\text{mix}} < 0\)",
        "\(\Delta H_{\text{mix}} = 0, \Delta V_{\text{mix}} = 0\)",
        "\(\Delta S_{\text{mix}} = 0, \Delta G_{\text{mix}} = 0\)"
      ],
      correct: 2,
      explanation: "For an ideal solution, molecules are perfectly interchangeable without heat exchange or volume change upon mixing. Thus, \(\Delta H_{\text{mix}} = 0\) and \(\Delta V_{\text{mix}} = 0\). (Note: entropy \(\Delta S_{\text{mix}} > 0\) and free energy \(\Delta G_{\text{mix}} < 0\) for spontaneous mixing)."
    },
    {
      question: "A mixture of Chloroform and Acetone shows negative deviation from Raoult's Law. Why?",
      options: [
        "Chloroform-Acetone interactions are weaker than Chloroform-Chloroform and Acetone-Acetone attractions.",
        "Chloroform and Acetone form a stable maximum-boiling azeotrope by creating strong intermolecular hydrogen bonds.",
        "The heat of mixing is endothermic (\(\Delta H > 0\)).",
        "Molecules of acetone escape faster because of steric hindrance."
      ],
      correct: 1,
      explanation: "Chloroform (\(\text{CHCl}_3\)) and Acetone (\(\text{CH}_3\text{COCH}_3\)) form strong intermolecular hydrogen bonds between the H of chloroform and the O of acetone. This cohesive attraction reduces escaping tendency, depressing vapor pressure below ideal levels (Negative deviation)."
    },
    {
      question: "An azeotropic mixture of two liquids boils at a lower temperature than either of them when the solution shows:",
      options: [
        "Negative deviation from Raoult's law",
        "Positive deviation from Raoult's law",
        "No deviation (Ideal behavior)",
        "High degree of association between solute particles"
      ],
      correct: 1,
      explanation: "Solutions displaying positive deviations from Raoult's law have higher vapor pressures than expected. At a specific composition, the vapor pressure reaches its maximum. Thus, the boiling point drops to a minimum (minimum-boiling azeotrope)."
    },
    {
      question: "Which of the following binary mixtures is an example of positive deviation from Raoult's Law?",
      options: [
        "Nitric acid + Water",
        "Phenol + Aniline",
        "Ethanol + Acetone",
        "Chloroform + Benzene"
      ],
      correct: 2,
      explanation: "In pure ethanol, molecules are hydrogen-bonded. Adding acetone inserts acetone molecules between ethanol clusters, breaking some hydrogen bonds. Escaping tendency increases, yielding a positive deviation from Raoult's Law."
    },
    {
      question: "Which of the following is NOT a colligative property?",
      options: [
        "Relative lowering of vapor pressure",
        "Elevation of boiling point",
        "Depression of freezing point",
        "Vapor pressure of liquid"
      ],
      correct: 3,
      explanation: "Vapor pressure is a bulk physical property of a liquid. Colligative properties are *relative changes* (relative lowering of vapor pressure, elevation of boiling point, depression of freezing point, osmotic pressure) that depend only on solute particle count."
    },
    {
      question: "When a non-volatile solute is dissolved in a solvent, the vapor pressure of the solution decreases because:",
      options: [
        "Solute particles block escaping pathways on the surface layer of the liquid.",
        "Solute molecules possess higher kinetic energy than solvent molecules.",
        "Dissolution is always exothermic.",
        "The boiling point of the solution is decreased."
      ],
      correct: 0,
      explanation: "In a solution, non-volatile solute particles occupy surface area sites. This reduces the surface fraction of volatile solvent molecules, thereby decreasing the rate at which solvent molecules escape into the vapor phase, lowering vapor pressure."
    },
    {
      question: "Which colligative property is preferred for determining the molar masses of proteins, polymers, and biomolecules, and why?",
      options: [
        "Depression of freezing point because biomolecules are stable at low temperatures.",
        "Osmotic pressure because measurements are taken at room temperature and produce large, easily measurable values even for dilute solutions.",
        "Elevation of boiling point because boiling speeds up reaction kinetics.",
        "Relative lowering of vapor pressure because it does not require temperature control."
      ],
      correct: 1,
      explanation: "Biomolecules are often unstable at high temperatures (preventing ebulliometry) and have low solubility. Osmotic pressure (\(\Pi = CRT\)) uses molarity instead of molality, is measured at room temperature, and produces significant measurable readings even for tiny concentrations of macromolecular solutes."
    },
    {
      question: "If a pressure greater than osmotic pressure is applied on the solution side of an osmosis cell, what happens?",
      options: [
        "Osmosis stops completely, reaching static equilibrium.",
        "Solute particles start migrating through the membrane to the pure solvent.",
        "Solvent molecules flow from the solution side (high conc.) to the pure solvent side (low conc.) - Reverse Osmosis.",
        "The semi-permeable membrane ruptures due to hydrostatic pressure."
      ],
      correct: 2,
      explanation: "Applying pressure higher than osmotic pressure (\(P > \Pi\)) forces solvent molecules to migrate backwards through the SPM from the solution to the pure solvent chamber. This is Reverse Osmosis (RO), widely used for water desalination."
    },
    {
      question: "What is the expected van 't Hoff factor (\(i\)) for complete dissociation of Potassium Sulfate (\(\text{K}_2\text{SO}_4\))?",
      options: [
        "1",
        "2",
        "3",
        "4"
      ],
      correct: 2,
      explanation: "Potassium sulfate dissociates completely as: \(\text{K}_2\text{SO}_4 \rightarrow 2\text{K}^+ + \text{SO}_4^{2-}\). Total ions formed = 3. For complete dissociation, \(i = n = 3\)."
    },
    {
      question: "Ethanoic acid dimerizes in benzene. What is the value of the van 't Hoff factor (\(i\)) assuming 100% association?",
      options: [
        "1.0",
        "2.0",
        "0.5",
        "0.25"
      ],
      correct: 2,
      explanation: "Ethanoic acid undergoes association to form dimers: \(2\text{CH}_3\text{COOH} \rightarrow (\text{CH}_3\text{COOH})_2\). Two molecules pair up into one. For complete dimerization, the number of particles is cut in half, so \(i = 1/2 = 0.5\)."
    },
    {
      question: "The molal elevation constant (\(K_b\)) is also known as:",
      options: [
        "Cryoscopic constant",
        "Ebullioscopic constant",
        "Henry's constant",
        "van 't Hoff constant"
      ],
      correct: 1,
      explanation: "The molal elevation constant (\(K_b\)) which represents the boiling point elevation of a 1 molal solution is referred to as the Ebullioscopic constant. The freezing point constant (\(K_f\)) is called the Cryoscopic constant."
    },
    {
      question: "A 0.1 molal aqueous solution of Glucose and a 0.1 molal aqueous solution of NaCl are prepared. Which statement is correct?",
      options: [
        "Both solutions freeze at the same temperature.",
        "The NaCl solution will exhibit roughly double the freezing point depression (\(\Delta T_f\)) of the Glucose solution.",
        "The Glucose solution will freeze at a lower temperature than the NaCl solution.",
        "NaCl is a non-electrolyte, so its boiling point elevation is zero."
      ],
      correct: 1,
      explanation: "Glucose is a non-electrolyte (\(i=1\)). NaCl dissociates into 2 ions (\(i=2\)). Since colligative properties depend on the total concentration of particles, \(\Delta T_f(\text{NaCl}) = 2 \times \Delta T_f(\text{Glucose})\). Thus, NaCl depresses freezing point twice as much, freezing at a lower temperature."
    },
    {
      question: "If red blood cells (RBCs) are placed in a saline solution containing 1.5% NaCl, what happens to the cells and why?",
      options: [
        "They remain intact because 1.5% NaCl is isotonic to blood plasma fluid.",
        "They swell and burst because the external solution is hypotonic, making water enter the cells.",
        "They shrink (plasmolysis) because the external solution is hypertonic, causing water to flow out of the cells.",
        "They absorb salt particles and double in weight."
      ],
      correct: 2,
      explanation: "Blood plasma fluid is isotonic with 0.9% (w/V) NaCl solution. A 1.5% NaCl solution is hypertonic (more concentrated). Water leaves the RBCs via osmosis to equalize concentration, causing the cells to shrink."
    },
    {
      question: "An electrolyte AB₂ is 60% dissociated in water. What is its van 't Hoff factor (\(i\))?",
      options: [
        "1.20",
        "2.20",
        "3.00",
        "1.80"
      ],
      correct: 1,
      explanation: "\(\text{AB}_2 \rightarrow \text{A}^{2+} + 2\text{B}^-\) (number of ions \(n = 3\)). Dissociation formula: \(i = 1 + (n - 1)\alpha\). With \(\alpha = 0.60\): \(i = 1 + (3 - 1)(0.60) = 1 + 2(0.60) = 2.20\)."
    },
    {
      question: "How is the observed molar mass of a solute related to its normal molar mass if it undergoes association in solution?",
      options: [
        "Observed molar mass is equal to normal molar mass.",
        "Observed molar mass is higher than normal molar mass.",
        "Observed molar mass is lower than normal molar mass.",
        "Observed molar mass becomes zero."
      ],
      correct: 1,
      explanation: "Association reduces the number of particles in solution, making the observed colligative property smaller. Since colligative properties are inversely proportional to molar mass, a smaller property value results in an abnormally high calculated (observed) molar mass."
    },
    {
      question: "The vapor pressure of pure liquid A at 298 K is 100 bar. When a non-volatile solute B is added, the vapor pressure of the solution drops to 80 bar. What is the mole fraction of solute B?",
      options: [
        "0.20",
        "0.80",
        "0.50",
        "0.10"
      ],
      correct: 0,
      explanation: "Relative lowering of vapor pressure: \(\frac{p^0 - p}{p^0} = \chi_{\text{solute}}\). Here, \(\frac{100 - 80}{100} = \frac{20}{100} = 0.20\). So mole fraction of solute B is 0.20."
    },
    {
      question: "What happens to the vapor pressure of water when a spoonful of common salt (NaCl) is added to it at constant temperature?",
      options: [
        "Vapor pressure increases.",
        "Vapor pressure decreases.",
        "Vapor pressure remains unchanged.",
        "Water boils instantly."
      ],
      correct: 1,
      explanation: "NaCl is a non-volatile solute. Adding it to water decreases the fraction of surface area occupied by volatile water molecules, thus lowering the vapor pressure of the solution."
    },
    {
      question: "For a dilute solution, the elevation of boiling point (\(\Delta T_b\)) is directly proportional to:",
      options: [
        "Molarity of the solute",
        "Mole fraction of the solvent",
        "Molality of the solute",
        "Volume of the solvent in mL"
      ],
      correct: 2,
      explanation: "Under thermodynamics and NCERT definitions, the boiling point elevation \(\Delta T_b\) of a dilute solution is directly proportional to the molality (m) of the solute in the solution: \(\Delta T_b = K_b \cdot m\)."
    }
  ];

  let currentQuizIndex = 0;
  let quizScore = 0;
  let selectedOption = null;

  const quizStartScreen = document.getElementById('quiz-start-screen');
  const quizQuestionScreen = document.getElementById('quiz-question-screen');
  const quizSummaryScreen = document.getElementById('quiz-summary-screen');
  const studentNameInput = document.getElementById('student-name');
  const nameErrorMsg = document.getElementById('name-error-msg');

  // Start Quiz Button
  document.getElementById('quiz-start-btn').addEventListener('click', () => {
    const name = studentNameInput.value.trim();
    if (name === "") {
      nameErrorMsg.classList.remove('hidden');
      studentNameInput.focus();
      return;
    }

    nameErrorMsg.classList.add('hidden');
    progressState.studentName = name;
    
    quizStartScreen.classList.add('hidden');
    quizQuestionScreen.classList.remove('hidden');
    
    currentQuizIndex = 0;
    quizScore = 0;
    loadQuizQuestion();
  });

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

    // Re-typeset math formulas for the new question & options
    triggerMathJax();
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
      quizScore++;
      buttonElement.classList.add('correct');
      feedbackStatus.innerText = "Correct! 🎉";
      feedbackStatus.className = "feedback-status correct";
    } else {
      buttonElement.classList.add('incorrect');
      allButtons[q.correct].classList.add('correct');
      feedbackStatus.innerText = "Incorrect ❌";
      feedbackStatus.className = "feedback-status incorrect";
    }

    feedbackExplanation.innerHTML = q.explanation;
    feedbackBox.classList.remove('hidden');

    // Re-typeset math formulas for the explanation box
    triggerMathJax();

    // Smooth scroll to explanation
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

    quizQuestionScreen.classList.add('hidden');
    quizSummaryScreen.classList.remove('hidden');

    document.getElementById('summary-score').innerText = `${quizScore} / 25`;
    const accuracy = Math.round((quizScore / 25) * 100);
    document.getElementById('summary-accuracy').innerText = accuracy + '%';

    // Grade logic
    let grade = "Average (Keep Learning)";
    if (accuracy >= 90) grade = "Outstanding Academic Excellence (A+)";
    else if (accuracy >= 75) grade = "Excellent Master Grade (A)";
    else if (accuracy >= 55) grade = "Good Passing Grade (B)";
    document.getElementById('summary-grade').innerText = grade;

    // Draw Certificate
    generateCertificate(quizScore, accuracy, progressState.studentName);
  }

  // Restart Quiz
  document.getElementById('quiz-restart-btn').addEventListener('click', () => {
    quizSummaryScreen.classList.add('hidden');
    quizStartScreen.classList.remove('hidden');
  });

  function generateCertificate(score, accuracy, name) {
    const canvas = document.getElementById('certificate-canvas');
    const ctx = canvas.getContext('2d');

    // Draw premium certificate background (Deep Slate Blue)
    ctx.fillStyle = '#050b14';
    ctx.fillRect(0, 0, 800, 550);

    // Neon borders (aqua-blue gradient)
    const borderGrad = ctx.createLinearGradient(0, 0, 800, 550);
    borderGrad.addColorStop(0, '#00f2fe');
    borderGrad.addColorStop(1, '#0984e3');
    
    ctx.strokeStyle = borderGrad;
    ctx.lineWidth = 14;
    ctx.strokeRect(15, 15, 770, 520);

    // Double thin inner border
    ctx.strokeStyle = 'rgba(0, 242, 254, 0.2)';
    ctx.lineWidth = 2;
    ctx.strokeRect(25, 25, 750, 500);

    // Neon glowing corners (little squares)
    ctx.fillStyle = '#00f2fe';
    ctx.fillRect(15, 15, 25, 25);
    ctx.fillRect(760, 15, 25, 25);
    ctx.fillRect(15, 510, 25, 25);
    ctx.fillRect(760, 510, 25, 25);

    // Header Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CERTIFICATE OF MASTERY', 400, 95);

    // Subtitle
    ctx.fillStyle = '#8ca3ba';
    ctx.font = '500 15px Inter, sans-serif';
    ctx.fillText('PROUDLY PRESENTED TO THE PHYSICAL CHEMISTRY SCHOLAR', 400, 145);

    // Student Name (Elegant Script-like styling)
    ctx.fillStyle = '#00f2fe';
    ctx.font = 'italic bold 40px Courier New, Outfit, sans-serif';
    ctx.fillText(name, 400, 220);

    // Divider line below name
    ctx.strokeStyle = 'rgba(0, 242, 254, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(250, 250);
    ctx.lineTo(550, 250);
    ctx.stroke();

    // Body text
    ctx.fillStyle = '#f1f6fc';
    ctx.font = '15px Inter, sans-serif';
    ctx.fillText('For demonstrating outstanding conceptual and numerical proficiency in the', 400, 290);
    ctx.fillText('NCERT Class XII Chemistry Chapter: Solutions,', 400, 315);
    ctx.fillText(`securing a score of ${score} / 25 (${accuracy}% accuracy) on the Certification Exam.`, 400, 340);

    // Seal or emblem in background center (Large chemistry flask outline)
    ctx.fillStyle = 'rgba(0, 242, 254, 0.05)';
    ctx.font = '180px Arial';
    ctx.fillText('🧪', 400, 340);

    // Signatures
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(150, 440);
    ctx.lineTo(310, 440);
    ctx.moveTo(490, 440);
    ctx.lineTo(650, 440);
    ctx.stroke();

    ctx.fillStyle = '#8ca3ba';
    ctx.font = '12px Inter, sans-serif';
    ctx.fillText('SOLUCRAFT ACADEMY', 230, 460);
    ctx.fillText('BOARD OF EXAMINERS', 570, 460);

    // Signature scripts
    ctx.fillStyle = '#00e676';
    ctx.font = 'italic 18px Courier New';
    ctx.fillText('Verified', 230, 428);
    ctx.fillText('Class XII NCERT', 570, 428);

    // Convert Canvas to download image
    const dataURL = canvas.toDataURL('image/png');
    const img = document.getElementById('certificate-image');
    img.src = dataURL;
  }

  // Download Certificate Button
  document.getElementById('download-cert-btn').addEventListener('click', () => {
    const canvas = document.getElementById('certificate-canvas');
    const image = canvas.toDataURL("image/png");
    const link = document.createElement('a');
    link.download = `${progressState.studentName.replace(/\s+/g, '_')}_Solutions_Mastery_Certificate.png`;
    link.href = image;
    link.click();
  });

  // Initial trigger for Concentration Lab particles loop on setup
  initBeakerCanvas();

});
