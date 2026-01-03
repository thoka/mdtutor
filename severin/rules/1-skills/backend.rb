

suite = Severin.define_skill "Backend Architekt 🔹ATdMw" do
  description "Fähigkeiten für die API-Entwicklung (Node.js) und die Backend-Logik (Ruby/Rails)."

  check "API-First & Spec-First 🔹kDj2I" do
    rule "Keine Frontend-Implementierung darf beginnen, bevor die benötigten API-Endpunkte spezifiziert und via RSpec getestet wurden. 🔹57DXq"
    condition { true }
    on_fail "API muss zuerst implementiert und getestet werden."
    fix "Prüfe packages/backend-ruby/spec/requests auf existierende Tests."
  end

  check "Test-Driven Development (TDD) 🔹dKuL0" do
    rule "TDD strikt befolgen. Tests vor der Implementierung schreiben. 🔹esjGj"
    condition { true }
  end

  check "Conventional Commits 🔹JroEX" do
    rule "Nutze Conventional Commits für alle Backend-Änderungen. 🔹RlU9k"
    condition do
      last_commit = `git log -1 --pretty=%B`.strip
      last_commit.match?(/^(feat|fix|docs|style|refactor|perf|test|chore|build|ci|revert)(\(.+\))?: /)
    end
    on_fail "Letzte Commit-Message entspricht nicht Conventional Commits."
    fix "Passe deinen Commit an: 'git commit --amend'"
  end
end

