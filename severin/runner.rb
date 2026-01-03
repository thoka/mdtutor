# Severin Project Stub
# Dieses Projekt nutzt das Severin Framework (v1.3.2+).

engine_path = File.expand_path("~/.severin/bin/sv")

if File.exist?(engine_path)
  # Delegiere an die globale Engine
  exec "ruby", engine_path, *ARGV
else
  puts "\n\e[31m❌ Severin Engine nicht gefunden!\e[0m"
  puts "--------------------------------------------------"
  puts "Dieses Projekt erfordert die globale Severin Engine."
  puts "Installation:"
  puts "  git clone https://github.com/thoka/severin ~/.severin"
  puts "  cd ~/.severin && ./install.sh"
  puts "--------------------------------------------------\n"
  exit 1
end

