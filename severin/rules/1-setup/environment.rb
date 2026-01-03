

suite = Severin.define_suite "📜DRJAV Umgebung & Abhängigkeiten" do
  description "Technische Grundvoraussetzungen für den Betrieb des Monorepos, inklusive Ports und Dateistrukturen."

  check "📜Dbdpd Environment Datei" do
    rule "📜t3wGw Eine lokale .env Datei muss existieren, basierend auf .env.example."
    target ".env"
    condition { File.exist? target }
    on_fail "Die .env Datei fehlt."
    fix "cp .env.example .env"
  end

  check "📜3sbCv Erforderliche Umgebungsvariablen" do
    rule "📜FCnzP Wichtige Services (API, Achievements, SSO, Web) müssen ihre Ports in der .env definiert haben."
    target ".env"
    required_vars = ["API_PORT", "ACHIEVEMENTS_PORT", "SSO_PORT", "WEB_PORT"]

    condition do
      return false unless File.exist?(target)
      content = File.read(target)
      required_vars.all? { |var| content.match?(/^#{var}=/) }
    end

    on_fail "Einige erforderliche Ports fehlen in der .env."
    fix "Kopiere die fehlenden Variablen von .env.example in deine .env Datei."
  end

  check "📜LHJah Node Module" do
    rule "📜S8tUM Alle Abhängigkeiten müssen mit pnpm installiert sein."
    target "node_modules"
    condition { Dir.exist? target }
    on_fail "Node-Abhängigkeiten sind nicht installiert."
    fix "pnpm install"
  end

  check "📜WwRch Content Ökosystem" do
    rule "📜EAUoD Das RPL Content-Ökosystem muss in content/RPL vorhanden sein."
    target "content/RPL"
    condition { Dir.exist? target }
    on_fail "Das Kern-Content-Ökosystem fehlt."
    fix "pnpm run sync:pathways"
  end
end

