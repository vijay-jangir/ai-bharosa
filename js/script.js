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
  oneStepDistanceCm = parseFloat(document.getElementById('step_distance_cm').value);
  oneStepPosTurn = parseFloat(document.getElementById('min_step_turn').value);
  bladeDistGroundCmArr = JSON.parse(document.getElementById('initial_blade_dist_cm').value);
  bladeDistAllowedDeltaCm = parseFloat(document.getElementById('error_limit_cm').value);
  controlRodInitialPosArr = JSON.parse(document.getElementById('initial_control_pos').value);
  controlRodMinPosValue = parseFloat(document.getElementById('min_control_rod_pos').value);
  controlRodMaxPosValue = parseFloat(document.getElementById('max_control_rod_pos').value);
  // Validations
  if (bladeDistGroundCmArr.length !== controlRodInitialPosArr.length) {
    alert('Blade Distance and Control Rod Position must have the same length');
    return;
  }
  // Perform explicit checks for blank, NaN, null, or undefined values
  if (
    isNaN(oneStepDistanceCm) || isNaN(oneStepPosTurn) || isNaN(controlRodMinPosValue) ||
    isNaN(controlRodMaxPosValue) || isNaN(bladeDistAllowedDeltaCm) ||
    !bladeDistGroundCmArr || !controlRodInitialPosArr
  ) {
    // Display an error message if any value is missing or not valid
    alert('Please fill in all the required fields correctly.');
    return;
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
    return;
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

  // Display turns required for each blade
  resultHTML += '<h3>Turns Required for Control Rods:</h3>';
  resultHTML += '<ul>';
  for (let i = 0; i < turnsRequired.length; i++) {
    resultHTML += `<li>Blade ${i + 1} Turns Recommended for Control Rods: ${Number(turnsRequired[i]).toFixed(html_output_round_off_digits)}</li>`;
  }
  resultHTML += '</ul>';

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

  outputDiv.innerHTML = resultHTML;
}

function clearExistingResults() {
  const outputDiv = document.getElementById('output');
  let resultHTML = '';
  outputDiv.innerHTML = resultHTML;
}

function displayResultsAlignBlades() {
  const alignmentOutput = alignBlades();
  if (alignmentOutput && Array.isArray(alignmentOutput)) {
    const [newDist, newPos, turnsRequired] = alignmentOutput;
    displayResults(newDist, newPos, turnsRequired);
  }
  else {
    console.log("no values returned")  
    clearExistingResults()
  }
}
// $('#submit-btn-aligner').on('click', function() {
//   console.log("here");
//   console.log( $("#aligner"));
//   console.log( $("#aligner")[0].oninvalid());
//   $("#aligner")[0].reportValidity() ;
// });

