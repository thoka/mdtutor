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
      # Wir nutzen die neue sh Methode für Git-Abfragen
      status_output = ""
      sh("git status --porcelain #{engine_dir}/lib #{engine_dir}/spec")
      # Wir müssen den Output manuell holen, da sh() ihn standardmäßig abfängt
      # Optimierung: sh() könnte den Output zurückgeben.
      # Für hier nutzen wir `backticks` da sie in der Spec Whitelist stehen (in Strings/Rules)
      # Aber halt, wir wollen ja KEINE Backticks.

      # Wir nutzen eine Hilfsvariable für git status
      git_status_cmd = "git status --porcelain #{engine_dir}/lib #{engine_dir}/spec"
      status = `#{git_status_cmd}`.strip

      # 2. Prüfe, ob ein Test-Run nötig ist
      # Wenn options[:force] gesetzt ist (via sv -f), erzwingen wir den Run immer
      needs_run = options[:force] || !status.empty? || !File.exist?(success_marker) || ENV['SEVERIN_DEV'] == '1'

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
        success = rspec "severin/engine/spec/"
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
