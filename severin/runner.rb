# Severin Project Stub
# Dieses Projekt nutzt das Severin Framework (v1.3.2+).

# Bestimme den Pfad zur Engine (Priorität: ENV['SEVERIN_HOME'] > Lokal)
engine_home = ENV['SEVERIN_HOME'] || File.expand_path("engine", __dir__)
engine_path = File.join(engine_home, "bin/sv")

if File.exist?(engine_path)
  exec "ruby", engine_path, *ARGV
else
  puts "\n\e[31m❌ Severin Engine nicht gefunden!\e[0m"
  puts "Geprüfter Pfad: #{engine_path}"
  puts "--------------------------------------------------"
  puts "Hinweis: Die Engine wird standardmäßig in 'severin/engine' erwartet."
  puts "Alternativ kann SEVERIN_HOME gesetzt werden."
  exit 1
end
