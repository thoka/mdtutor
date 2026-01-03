define_suite "1-setup: Content Registry" do
  description "Validiert die Existenz und das Tracking der zentralen Inhaltsdateien."

  check "Content Files Presence" do
    files = [
      "content/RPL/sync.yaml",
      "content/RPL/topics.yaml",
      "content/RPL/ecosystem.yaml"
    ]

    missing = files.reject { |f| File.exist?(f) }

    condition { missing.empty? }
    on_fail "Fehlende Content-Dateien: #{missing.join(', ')}"
  end

  check "Git Tracking for Content" do
    files = [
      "content/RPL/sync.yaml",
      "content/RPL/topics.yaml",
      "content/RPL/ecosystem.yaml"
    ]

    untracked = files.reject { |f| system("git ls-files --error-unmatch #{f} > /dev/null 2>&1") }

    condition { untracked.empty? }
    on_fail "Dateien existieren, sind aber nicht im Git getrackt: #{untracked.join(', ')}"
    fix "git add #{untracked.join(' ')}"
  end
end
