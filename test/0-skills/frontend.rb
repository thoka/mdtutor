require 'sentinel'

suite = Sentinel.define_skill "Frontend Experte" do
  description "Fähigkeiten und Regeln für die Svelte 5 Entwicklung im Web-Frontend."

  check "Svelte 5 Runes" do
    rule "Verwende ausschließlich Svelte 5 Runes ($state, $derived, $props, $effect). Legacy-Stores in Komponenten sind unerwünscht."
    condition { true }
    on_fail "Potenzielle Legacy-Store Nutzung erkannt."
    fix "Refactor zu Svelte 5 Runes."
  end

  check "Svelte Autofixer" do
    rule "Nutze nach jeder Änderung an Svelte-Komponenten das `svelte-autofixer` Tool, um die Korrektheit der Reaktivität sicherzustellen."
    condition { true }
    on_fail "Vergiss nicht, den Fixer auszuführen."
    fix "Rufe das svelte-autofixer Tool via MCP auf."
  end

  check "Minimalismus-Prinzip" do
    rule "Antworten kurz halten und so wenig Code/Dokumentation wie möglich generieren."
    condition { true }
  end
end

if __FILE__ == $0
  format = ENV['SENTINEL_FORMAT'] == 'agent' ? :agent : :human
  suite.report(format)
  exit(suite.result.success? ? 0 : 1)
end
