# Alice (student_a) Scenario
alice_id = "student_a"

Action.destroy_all # Clear existing data
puts "Seeding achievements for Alice..."

# 1. Weltraumgespräch (space-talk) - 100% complete
# Assuming it has ~8 steps (standard RPL project)
(0..7).each do |step|
  Action.create!(
    user_id: alice_id,
    action_type: "step_complete",
    gid: "RPL:PROJ:space-talk",
    timestamp: Time.current - (10 - step).days,
    metadata: { step: step }
  )
end

# 2. Erwische den Bus (catch-the-bus) - 66% progress with visible checkboxes
catch_the_bus_gid = "RPL:PROJ:catch-the-bus"
# Tasks per step: 1 13 13 7 9 6 4 0 0
catch_the_bus_tasks = [1, 13, 13, 7, 9, 6, 4, 0, 0]

# Steps 0 to 5: Fully Completed (all tasks checked + step_complete)
(0..5).each do |step|
  # Mark step as complete
  Action.create!(
    user_id: alice_id,
    action_type: "step_complete",
    gid: catch_the_bus_gid,
    timestamp: (7 - step).days.ago,
    metadata: { step: step }
  )
  
  # Check all tasks in this step
  num_tasks = catch_the_bus_tasks[step]
  (0...num_tasks).each do |task_idx|
    Action.create!(
      user_id: alice_id,
      action_type: "task_check",
      gid: catch_the_bus_gid,
      timestamp: (7 - step).days.ago + task_idx.seconds,
      metadata: { step: step, task_index: task_idx }
    )
  end
end

# 3. Finde den Bug (find-the-bug) - Half tasks completed per step
find_the_bug_gid = "RPL:PROJ:find-the-bug"
# Tasks: 1 10 12 3 8 9 0 3 3
find_the_bug_tasks = [1, 10, 12, 3, 8, 9, 0, 3, 3]

find_the_bug_tasks.each_with_index do |total_tasks, step|
  next if total_tasks == 0
  
  half = (total_tasks / 2.0).ceil
  (0...half).each do |task_idx|
    Action.create!(
      user_id: alice_id,
      action_type: "task_check",
      gid: find_the_bug_gid,
      timestamp: 2.hours.ago + step.minutes + task_idx.seconds,
      metadata: { step: step, task_index: task_idx }
    )
  end
end

puts "Achievements Seeding complete."
