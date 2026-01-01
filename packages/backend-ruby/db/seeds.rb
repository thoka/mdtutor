# Alice (student_a) Scenario
alice_id = "student_a"

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

# 2. Erwische den Bus (catch-the-bus) - Mixed progress
# Step 0: Complete
Action.create!(user_id: alice_id, action_type: "step_complete", gid: "RPL:PROJ:catch-the-bus", timestamp: 5.days.ago, metadata: { step: 0 })

# Step 1: Half complete (e.g., 2 of 4 tasks)
Action.create!(user_id: alice_id, action_type: "task_check", gid: "RPL:PROJ:catch-the-bus", timestamp: 4.days.ago, metadata: { step: 1, task_index: 0 })
Action.create!(user_id: alice_id, action_type: "task_check", gid: "RPL:PROJ:catch-the-bus", timestamp: 4.days.ago, metadata: { step: 1, task_index: 1 })

# Step 2: Quiz activity
# Partially solved (attempted but no success yet)
Action.create!(user_id: alice_id, action_type: "quiz_attempt", gid: "RPL:PROJ:catch-the-bus", timestamp: 3.days.ago, metadata: { step: 2, score: 1, total: 3 })

# Step 3: Fully solved quiz
Action.create!(user_id: alice_id, action_type: "quiz_attempt", gid: "RPL:PROJ:catch-the-bus", timestamp: 2.days.ago, metadata: { step: 3, score: 3, total: 3 })
Action.create!(user_id: alice_id, action_type: "quiz_success", gid: "RPL:PROJ:catch-the-bus", timestamp: 2.days.ago, metadata: { step: 3 })

# 3. Finde den Bug (find-the-bug) - Just started
Action.create!(user_id: alice_id, action_type: "project_open", gid: "RPL:PROJ:find-the-bug", timestamp: 1.hour.ago, metadata: { step: 0 })

puts "Achievements Seeding complete."
