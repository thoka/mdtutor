define_suite "1-setup: Content Registry 🔹Y7fuV" do
  description "Validiert die Existenz und das Tracking der zentralen Inhaltsdateien."

  check "Content Files Presence 🔹vjXOA" do
    files = [
      "content/RPL/sync.yaml",
      "content/RPL/topics.yaml",
      "content/RPL/ecosystem.yaml"
    ]

    missing = files.reject { |f| File.exist?(f) }

    condition { missing.empty? }
    on_fail "Fehlende Content-Dateien: #{missing.join(', ')}"
  end

  check "Git Tracking for Content 🔹uVHsq" do
    files = [
      "content/RPL/sync.yaml",
      "content/RPL/topics.yaml",
      "content/RPL/ecosystem.yaml"
    ]

    condition do
      untracked = files.reject { |f| sh("git ls-files --error-unmatch #{f} > /dev/null 2>&1") }
      untracked.empty?
    end

    on_fail "Dateien existieren, sind aber nicht im Git getrackt"
    fix "Nutze git add für die betroffenen Dateien."
  end
end
