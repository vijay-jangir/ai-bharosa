function alignBlades(
  oneStepDistanceCm = 1,
  oneStepPosTurn = 0.16666667,
  bladeDistGroundCmArr = [348, 355, 353, 349, 360],
  bladeDistAllowedDeltaCm = 2,
  controlRodInitialPosArr = [380, 380, 380, 380, 380],
  controlRodMinPosValue = 375,
  controlRodMaxPosValue = 385
) {
  // Validations
  if (bladeDistGroundCmArr.length !== controlRodInitialPosArr.length) {
    throw new Error('bladeDistGroundCmArr and controlRodInitialPosArr must have the same length');
  }

  const maxIterations = 1000; // to break infinite loop
  const numBlades = bladeDistGroundCmArr.length;
  let currentDistSolution = [...bladeDistGroundCmArr];
  let currentPosSolution = [...controlRodInitialPosArr];
  let counter = 0;

  // Infinite loop
  while (true) {
    counter++;
    if (counter > maxIterations) {
      console.log('Exiting infinite loop');
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
  return [currentDistSolution, currentPosSolution, turnsRequired];
}

function standardDeviation(arr) {
  const n = arr.length;
  const mean = arr.reduce((sum, val) => sum + val, 0) / n;
  const squaredDiffs = arr.map((val) => (val - mean) ** 2);
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / n;
  return Math.sqrt(variance);
}

// Usage
const [newDist, newPos, turnsRequired] = alignBlades();
console.log('New blades distance:', newDist);
console.log('New rod positions:', newPos);
console.log('Turns required for control rods:', turnsRequired);
