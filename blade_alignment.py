import statistics

def align_blades(
  one_step_distance_cm = 1,
  one_step_pos_turn = .16666667,
  blade_dist_ground_cm_arr = [948,355,353,349,360],
  blade_dist_allowed_delta_cm = 2,
  control_rod_initial_pos_arr = [380,380,380,380,380],
  control_rod_min_pos_value = 375,
  control_rod_max_pos_value = 385,
):      

  # Validations
  assert len(blade_dist_ground_cm_arr) == len(control_rod_initial_pos_arr)


  max_iterations=1000  # to break infinite loop
  num_blades = len(blade_dist_ground_cm_arr)
  current_dist_solution = blade_dist_ground_cm_arr.copy()
  current_pos_solution = control_rod_initial_pos_arr.copy()
  counter = 0

  # infinite loop
  while True:
    counter += 1
    if counter > max_iterations: # condition to break infiinite loop
      print("Exiting infinite loop")
      break
    if max(current_dist_solution) - min(current_dist_solution) <= blade_dist_allowed_delta_cm:
      print("Completed")
      print(current_dist_solution)
      break
    
    solutions = []

    for i in range(num_blades):
      # 2 iterations, 1 for positive step another for negative
      for mul in [1,-1]:
        dist_sol = current_dist_solution.copy()
        dist_sol[i] += mul * one_step_distance_cm
        sd = statistics.stdev(dist_sol)

        pos_sol = current_pos_solution.copy()
        pos_sol[i] += mul * one_step_pos_turn
        under_limit_pos = all([(control_rod_min_pos_value <= i <= control_rod_max_pos_value) for i in pos_sol])

        if under_limit_pos:
          solutions.append([sd, dist_sol, pos_sol])
        
    # Out of outer for loop(loop on blades)

    solutions.sort(key=lambda x: x[0])
    selected_sol = solutions[0]
    if selected_sol[0] < statistics.stdev(blade_dist_ground_cm_arr):
      current_dist_solution = selected_sol[1]
      current_pos_solution = selected_sol[2]
    else:
      print("End")
      break
  turns_required = [round((x-y), 3) for x,y in zip(selected_sol[2], control_rod_initial_pos_arr)]
  return [current_dist_solution, current_pos_solution, turns_required]


if __name__ == "__main__":
  new_dist, new_pos, turns_required = align_blades()
  print("New blades distance:", new_dist)
  print("New rod positions:", new_pos)
  print("Turns required for control rods:", turns_required)



