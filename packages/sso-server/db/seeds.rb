# Create main room
room = Room.find_or_create_by!(slug: "main") do |r|
  r.name = "Hauptraum (Makerspace)"
end

# Sync presences from users.yaml
config = UserLoader.load_config
all_user_ids = (config["admins"].keys + config["users"].keys)

puts "Seeding presences for #{all_user_ids.size} users..."

all_user_ids.each do |user_id|
  # For the "Alice Scenario", Alice is always present
  is_present = (user_id == "student_a")
  
  Presence.find_or_initialize_by(user_id: user_id).tap do |p|
    p.is_present = is_present
    p.room = room if is_present
    p.save!
  end
  
  if is_present && !Visit.exists?(user_id: user_id, ended_at: nil)
    Visit.create!(user_id: user_id, room: room, started_at: Time.current - 2.hours)
  end
end

puts "SSO Seeding complete."
