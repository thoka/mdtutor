# Alice (student_a) Scenario
alice_id = "student_a"

# Clear existing data
Action.destroy_all
log_file = TrackActionService.log_file
File.delete(log_file) if File.exist?(log_file)

puts "Seeding achievements for Alice..."

# 1. Weltraumgespräch (space-talk) - 100% complete
# Assuming it has ~8 steps (standard RPL project)
space_talk_gid = "RPL:PROJ:space-talk"
space_talk_tasks = [1, 9, 6, 6, 8, 5, 0, 0]

(0..7).each do |step|
  # View the step
  TrackActionService.call(
    user_id: alice_id,
    action: "step_view",
    gid: space_talk_gid,
    metadata: { step: step },
    timestamp: Time.current - (10 - step).days - 1.hour
  )

  TrackActionService.call(
    user_id: alice_id,
    action: "step_complete",
    gid: space_talk_gid,
    metadata: { step: step },
    timestamp: Time.current - (10 - step).days
  )

  # Check all tasks in this step
  num_tasks = space_talk_tasks[step] || 0
  (0...num_tasks).each do |task_idx|
    TrackActionService.call(
      user_id: alice_id,
      action: "task_check",
      gid: space_talk_gid,
      metadata: { step: step, task_index: task_idx },
      timestamp: Time.current - (10 - step).days + task_idx.seconds
    )
  end

  # Special handling for Quiz in step 6
  if step == 6
    (0..2).each do |q_idx|
      TrackActionService.call(
        user_id: alice_id,
        action: "quiz_attempt",
        gid: space_talk_gid,
        metadata: { step: step, question_index: q_idx, is_correct: true },
        timestamp: Time.current - (10 - step).days + 1.minute + q_idx.seconds
      )
      TrackActionService.call(
        user_id: alice_id,
        action: "quiz_success",
        gid: space_talk_gid,
        metadata: { step: step, question_index: q_idx },
        timestamp: Time.current - (10 - step).days + 1.minute + q_idx.seconds + 1.second
      )
    end
  end
end

# 2. Erwische den Bus (catch-the-bus) - 66% progress with visible checkboxes
catch_the_bus_gid = "RPL:PROJ:catch-the-bus"
# Tasks per step: 1 13 13 7 9 6 4 0 0
catch_the_bus_tasks = [1, 13, 13, 7, 9, 6, 4, 0, 0]

# Steps 0 to 5: Fully Completed (all tasks checked + step_complete)
(0..5).each do |step|
  # View the step
  TrackActionService.call(
    user_id: alice_id,
    action: "step_view",
    gid: catch_the_bus_gid,
    metadata: { step: step },
    timestamp: (7 - step).days.ago - 1.hour
  )

  # Mark step as complete
  TrackActionService.call(
    user_id: alice_id,
    action: "step_complete",
    gid: catch_the_bus_gid,
    metadata: { step: step },
    timestamp: (7 - step).days.ago
  )

  # Check all tasks in this step
  num_tasks = catch_the_bus_tasks[step]
  (0...num_tasks).each do |task_idx|
    TrackActionService.call(
      user_id: alice_id,
      action: "task_check",
      gid: catch_the_bus_gid,
      metadata: { step: step, task_index: task_idx },
      timestamp: (7 - step).days.ago + task_idx.seconds
    )
  end
end

# 3. Finde den Bug (find-the-bug) - Half tasks completed per step
find_the_bug_gid = "RPL:PROJ:find-the-bug"
# Tasks: 1 10 12 3 8 9 0 3 3
find_the_bug_tasks = [1, 10, 12, 3, 8, 9, 0, 3, 3]

find_the_bug_tasks.each_with_index do |total_tasks, step|
  next if total_tasks == 0

  # View the step
  TrackActionService.call(
    user_id: alice_id,
    action: "step_view",
    gid: find_the_bug_gid,
    metadata: { step: step },
    timestamp: 2.hours.ago + step.minutes - 1.minute
  )

  half = (total_tasks / 2.0).ceil
  (0...half).each do |task_idx|
    TrackActionService.call(
      user_id: alice_id,
      action: "task_check",
      gid: find_the_bug_gid,
      metadata: { step: step, task_index: task_idx },
      timestamp: 2.hours.ago + step.minutes + task_idx.seconds
    )
  end
end

puts "Achievements Seeding complete."
