# { "tag": "🔹ENG-SPEC" }
suite = Severin.define_suite "Severin Engine Health 🔹aUsN8" do
  description "Verifiziert die Integrität der Severin-Engine durch RSpec."

  check "Engine Specs 🔹VERIFY-SPEC" do
    rule "Änderungen an der Engine müssen durch RSpec verifiziert werden. 🔹SPEC-REQ"

    condition do
      # Wir führen die Specs nur aus, wenn wir im Agent-Modus sind
      # oder wenn die Engine-Dateien seit dem letzten erfolgreichen Test geändert wurden.
      engine_dir = File.expand_path("../../engine", __dir__)
      success_marker = File.join(engine_dir, ".rspec_success")

      # 1. Prüfe auf uncommittete Änderungen in den relevanten Verzeichnissen (lib, spec)
      # Wir nutzen Shell-Globbing für git status
      status = `git status --porcelain #{engine_dir}/lib #{engine_dir}/spec`.strip

      # 2. Prüfe, ob ein Test-Run nötig ist
      needs_run = !status.empty? || !File.exist?(success_marker) || ENV['SEVERIN_DEV'] == '1'

      if !needs_run
        # Finde den neuesten Zeitstempel NUR in lib/ und spec/
        # Das ignoriert temporäre Dateien oder Logs im Engine-Root
        relevant_files = Dir.glob("{#{engine_dir}/lib/**/*,#{engine_dir}/spec/**/*}")
        last_mod = relevant_files.map { |f| File.mtime(f) }.max

        if last_mod && last_mod > File.mtime(success_marker)
          needs_run = true
        end
      end

      if needs_run
        # Führe RSpec aus
        success = system("cd #{engine_dir} && rspec spec/")
        if success
          FileUtils.touch(success_marker)
        end
        success
      else
        # Keine relevanten Änderungen seit dem letzten Erfolg
        true
      end
    end

    on_fail "Die Engine-Tests (RSpec) sind fehlgeschlagen! Bitte prüfe die Engine-Integrität."
    fix "Führe manuell 'cd severin/engine && bundle exec rspec' aus."
  end
end
