# Create default rooms
Room.find_or_create_by!(slug: "default") do |r|
  r.name = "Hauptraum (Makerspace)"
end

Room.find_or_create_by!(slug: "holz") do |r|
  r.name = "Holzwerkstatt"
end

Room.find_or_create_by!(slug: "elektronik") do |r|
  r.name = "Elektronik-Labor"
end

puts "Rooms seeded: #{Room.count}"
