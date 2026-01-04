# frozen_string_literal: true

require_relative '../../engine/lib/severin/language_detector'

# Diese Regeln stellen sicher, dass die Sprachentrennung im Projekt eingehalten wird.
# 1. Severin-Infrastruktur (Regeln, Fixes) = Deutsch (de)
# 2. Projekt-Dokumentation (Brain-Docs) = Englisch (en)

Severin.define_suite "Sprach-Integrität (Infrastruktur vs. Dokumentation)" do
  description "Stellt sicher, dass die Sprachvorgaben für Regeln und Dokumente eingehalten werden."

  check "language_brain_docs" do
    rule "Stellt sicher, dass Brain-Dokumente auf Englisch verfasst sind"
    
    # Pfad zu den Dateien
    branch_slug = `git rev-parse --abbrev-ref HEAD`.strip.split('/').last
    plans = Dir.glob("docs/brain/**/*#{branch_slug}*").reject { |f| f.include?('walkthrough') }

    condition do
      plans.all? do |f|
        Severin::LanguageDetector.matches_language?(File.read(f), :en)
      end
    end

    on_fail "Das Brain-Dokument scheint auf Deutsch verfasst zu sein. Brain-Dokumente müssen auf Englisch verfasst werden."
    fix "Übersetze den Inhalt des Brain-Dokuments ins Englische, während Struktur und IDs erhalten bleiben."
  end

  check "language_severin_rules" do
    rule "Stellt sicher, dass Severin-Regeln auf Deutsch verfasst sind (Regel 🔹fhmjc)"
    
    condition do
      # Wir prüfen alle .rb Dateien in severin/rules/
      Dir.glob("severin/rules/**/*.rb").all? do |file|
        Severin::LanguageDetector.matches_language?(File.read(file), :de)
      end
    end

    on_fail "Einige Severin-Regeln scheinen auf Englisch verfasst zu sein. Severin-Regeln müssen auf Deutsch sein."
    fix "Übersetze Beschreibungen und Fix-Anweisungen in den Regeln ins Deutsche."
  end
end
