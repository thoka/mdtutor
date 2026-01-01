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

# 2. Erwische den Bus (catch-the-bus) - 66% progress
# Project has 9 steps. 6 steps = 66.6%.
catch_the_bus_gid = "RPL:PROJ:catch-the-bus"

# Steps 0 to 5: Completed
(0..5).each do |step|
  Action.create!(
    user_id: alice_id,
    action_type: "step_complete",
    gid: catch_the_bus_gid,
    timestamp: (7 - step).days.ago,
    metadata: { step: step }
  )
end

# 3. Finde den Bug (find-the-bug) - Just started
Action.create!(user_id: alice_id, action_type: "project_open", gid: "RPL:PROJ:find-the-bug", timestamp: 1.hour.ago, metadata: { step: 0 })

puts "Achievements Seeding complete."
