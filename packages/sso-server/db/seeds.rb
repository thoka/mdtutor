# Create rooms
main_room = Room.find_or_create_by!(slug: "main") { |r| r.name = "Hauptraum (Makerspace)" }
wood_room = Room.find_or_create_by!(slug: "wood") { |r| r.name = "Holzwerkstatt" }

# Sync presences from users.yaml
config = UserLoader.load_config
all_user_ids = (config["admins"].keys + config["users"].keys)

puts "Seeding presences and history for #{all_user_ids.size} users..."

all_user_ids.each do |user_id|
  # Alice is present in main, Bob in wood
  is_present = ["student_a", "student_b"].include?(user_id)
  current_room = user_id == "student_a" ? main_room : wood_room
  
  Presence.find_or_initialize_by(user_id: user_id).tap do |p|
    p.is_present = is_present
    p.room = is_present ? current_room : nil
    p.save!
  end
  
  # Add some history for Alice and Bob
  if ["student_a", "student_b"].include?(user_id)
    # Past visit (yesterday)
    Visit.find_or_create_by!(
      user_id: user_id, 
      room: main_room, 
      started_at: 1.day.ago, 
      ended_at: 1.day.ago + 2.hours
    )
    
    # Another past visit (2 days ago)
    Visit.find_or_create_by!(
      user_id: user_id, 
      room: wood_room, 
      started_at: 2.days.ago, 
      ended_at: 2.days.ago + 1.hour
    )

    # Current active visit
    if !Visit.exists?(user_id: user_id, ended_at: nil)
      Visit.create!(user_id: user_id, room: current_room, started_at: 30.minutes.ago)
    end
  end
end

puts "SSO Seeding complete."
