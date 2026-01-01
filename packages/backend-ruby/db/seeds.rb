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

# 2. Erwische den Bus (catch-the-bus) - 50% complete
# Assuming ~10 steps
(0..4).each do |step|
  Action.create!(
    user_id: alice_id,
    action_type: "step_complete",
    gid: "RPL:PROJ:catch-the-bus",
    timestamp: Time.current - (5 - step).days,
    metadata: { step: step }
  )
end

# Add some task checks for more realism
Action.create!(
  user_id: alice_id,
  action_type: "task_check",
  gid: "RPL:PROJ:catch-the-bus",
  timestamp: Time.current - 1.day,
  metadata: { step: 5, task_index: 0 }
)

puts "Achievements Seeding complete."
