# Sentinel Project Stub
# Dieses Projekt nutzt das Sentinel Framework (v1.3.2+).

engine_path = File.expand_path("~/.sentinel/bin/sn")

if File.exist?(engine_path)
  # Delegiere an die globale Engine
  exec "ruby", engine_path, *ARGV
else
  puts "\n\e[31m❌ Sentinel Engine nicht gefunden!\e[0m"
  puts "--------------------------------------------------"
  puts "Dieses Projekt erfordert die globale Sentinel Engine."
  puts "Installation:"
  puts "  git clone https://github.com/mdtutor/sentinel-engine ~/.sentinel"
  puts "  cd ~/.sentinel && ./install.sh"
  puts "--------------------------------------------------\n"
  exit 1
end
