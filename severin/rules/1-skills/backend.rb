

suite = Severin.define_skill "📜ATdMw Backend Architekt" do
  description "Fähigkeiten für die API-Entwicklung (Node.js) und die Backend-Logik (Ruby/Rails)."

  check "📜kDj2I API-First & Spec-First" do
    rule "📜57DXq Keine Frontend-Implementierung darf beginnen, bevor die benötigten API-Endpunkte spezifiziert und via RSpec getestet wurden."
    condition { true }
    on_fail "API muss zuerst implementiert und getestet werden."
    fix "Prüfe packages/backend-ruby/spec/requests auf existierende Tests."
  end

  check "📜dKuL0 Test-Driven Development (TDD)" do
    rule "📜esjGj TDD strikt befolgen. Tests vor der Implementierung schreiben."
    condition { true }
  end

  check "📜JroEX Conventional Commits" do
    rule "📜RlU9k Nutze Conventional Commits für alle Backend-Änderungen."
    condition do
      last_commit = `git log -1 --pretty=%B`.strip
      last_commit.match?(/^(feat|fix|docs|style|refactor|perf|test|chore|build|ci|revert)(\(.+\))?: /)
    end
    on_fail "Letzte Commit-Message entspricht nicht Conventional Commits."
    fix "Passe deinen Commit an: 'git commit --amend'"
  end
end

