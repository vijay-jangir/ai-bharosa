// Global Constants
html_output_round_off_digits = 2

function calculateStandardDeviation(arr) {
  const n = arr.length;
  const mean = arr.reduce((sum, val) => sum + val, 0) / n;
  const squaredDiffs = arr.map(val => (val - mean) ** 2);
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / n;
  return Math.sqrt(variance);
}

function alignBlades() {
  // Fetching input values
  oneStepDistanceCm = parseFloat(document.getElementById('step_distance_cm').value) || 1 ;
  oneStepPosTurn = parseFloat(document.getElementById('min_step_turn').value) || 0.16666667 ;
  bladeDistGroundCmArr = JSON.parse(document.getElementById('initial_blade_dist_cm').value) || [348, 355, 353, 349, 360] ;
  bladeDistAllowedDeltaCm = parseFloat(document.getElementById('error_limit_cm').value) || 2 ;
  controlRodInitialPosArr = JSON.parse(document.getElementById('initial_control_pos').value) || [380, 380, 380, 380, 380] ;
  controlRodMinPosValue = parseFloat(document.getElementById('min_control_rod_pos').value) || 375 ;
  controlRodMaxPosValue = parseFloat(document.getElementById('max_control_rod_pos').value) || 385 ;
  // Validations
  if (bladeDistGroundCmArr.length !== controlRodInitialPosArr.length) {
    throw new Error('bladeDistGroundCmArr and controlRodInitialPosArr must have the same length');
  }

  const maxIterations = 1000; // to break infinite loop
  const numBlades = bladeDistGroundCmArr.length;
  let currentDistSolution = [...bladeDistGroundCmArr];
  let currentPosSolution = [...controlRodInitialPosArr];
  let counter = 0;

  let aligned = true
  // Infinite loop
  while (true) {
    counter++;
    if (counter > maxIterations) {
      console.log('Exiting infinite loop');
      aligned = false
      break;
    }

    if (Math.max(...currentDistSolution) - Math.min(...currentDistSolution) <= bladeDistAllowedDeltaCm) {
      console.log('Completed');
      console.log(currentDistSolution);
      break;
    }

    const solutions = [];

    for (let i = 0; i < numBlades; i++) {
      // 2 iterations, 1 for positive step and another for negative
      for (const mul of [1, -1]) {
        const distSol = [...currentDistSolution];
        distSol[i] += mul * oneStepDistanceCm;
        const sd = standardDeviation(distSol);

        const posSol = [...currentPosSolution];
        posSol[i] += mul * oneStepPosTurn;
        const underLimitPos = posSol.every((pos) => controlRodMinPosValue <= pos && pos <= controlRodMaxPosValue);

        if (underLimitPos) {
          solutions.push([sd, distSol, posSol]);
        }
      }
    }

    // Out of outer for loop (loop on blades)

    solutions.sort((a, b) => a[0] - b[0]);
    const selectedSol = solutions[0];
    if (selectedSol[0] < standardDeviation(bladeDistGroundCmArr)) {
      currentDistSolution = selectedSol[1];
      currentPosSolution = selectedSol[2];
    } else {
      console.log('End');
      break;
    }
  }

  const turnsRequired = currentPosSolution.map((pos, index) => (pos - controlRodInitialPosArr[index]).toFixed(3));
  if (aligned) {
    return [currentDistSolution, currentPosSolution, turnsRequired];
  } else {
    alert('Blades cannot be aligned within the specified limits.');
  }
}

function standardDeviation(arr) {
  const n = arr.length;
  const mean = arr.reduce((sum, val) => sum + val, 0) / n;
  const squaredDiffs = arr.map((val) => (val - mean) ** 2);
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / n;
  return Math.sqrt(variance);
}
function displayResults(newDist, newPos, turnsRequired) {
  const outputDiv = document.getElementById('output');
  let resultHTML = '<h2>Results:</h2>';

  // Display new distance and new position
  resultHTML += '<h3>New Blades Distance:</h3>';
  resultHTML += '<ul>';
  for (let i = 0; i < newDist.length; i++) {
    resultHTML += `<li>Blade ${i + 1}: ${Number(newDist[i]).toFixed(html_output_round_off_digits)} cm</li>`;
  }
  resultHTML += '</ul>';

  resultHTML += '<h3>New Control Rod Positions:</h3>';
  resultHTML += '<ul>';
  for (let i = 0; i < newPos.length; i++) {
    resultHTML += `<li>Blade ${i + 1}: ${Number(newPos[i]).toFixed(html_output_round_off_digits)}</li>`;
  }
  resultHTML += '</ul>';

  // Display turns required for each blade
  resultHTML += '<h3>Turns Required for Control Rods:</h3>';
  resultHTML += '<ul>';
  for (let i = 0; i < turnsRequired.length; i++) {
    resultHTML += `<li>Blade ${i + 1} Turns Required: ${Number(turnsRequired[i]).toFixed(html_output_round_off_digits)}}</li>`;
  }
  resultHTML += '</ul>';

  outputDiv.innerHTML = resultHTML;
}


function displayResultsAlignBlades() {
  // Usage
  const [newDist, newPos, turnsRequired] = alignBlades();

  // Display results in HTML format
  displayResults(newDist, newPos, turnsRequired);
}
