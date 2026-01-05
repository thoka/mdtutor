define_suite "Quality Enforcement 🔹Q-ENF" do
  description "Stellt sicher, dass alle Regeln den projektweiten Qualitätsstandards entsprechen."
  tag :core

  check "Ruby Rule Spec Coverage 🔹R-SPEC" do
    rule "Jede Ruby-basierte Regel MUSS eine Spec-Referenz haben. 🔹R-SPEC"

    condition do
      # Wir scannen alle Suiten, die wir gerade geladen haben
      Severin.all_results.all? do |suite|
        # Nur wenn die Suite den Tag :ruby hat
        next true unless suite.tags.include?(:ruby)

        # Prüfe jede Regel in dieser Suite
        suite.rules_with_metadata.all? do |r|
          has_spec = r[:metadata].key?(:spec) && !r[:metadata][:spec].nil?
          spec_exists = has_spec && File.exist?(File.expand_path(r[:metadata][:spec], Severin.project_root))

          unless spec_exists
            @data[:message] = "Fehlende oder ungültige Spec für Regel '#{r[:text]}' in Suite '#{suite.suite_name}'."
          end

          spec_exists
        end
      end
    end

    on_fail "Kritische Lücke: Eine Ruby-Regel hat keine gültige Spec-Referenz."
    fix "Füge 'spec: \"path/to/spec.rb\"' zur Regel-Definition hinzu."
  end
end
