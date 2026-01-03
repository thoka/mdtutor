define_skill "Frontend Experte" do
  rule "Svelte 5 Runes ($state, $derived, $props, $effect). Legacy-Stores in Komponenten sind unerwünscht."
  rule "Svelte Autofixer nach jeder Änderung nutzen."
  rule "Minimalismus-Prinzip: Kurze Antworten, minimaler Code."

  # Dynamische Anbindung des offiziellen Svelte MCP via npx
  # Severin startet dies nur bei Bedarf (Lazy Loading)
  use_mcp "svelte_official", command: "npx", args: ["-y", "@sveltejs/mcp-server"]

  check "Svelte 5 Runes" do
    rule "Verwende ausschließlich Svelte 5 Runes."
    condition { true }
    on_fail "Svelte MCP konnte nicht für die Validierung erreicht werden."
  end

  check "Svelte Autofixer" do
    rule "Nutze nach jeder Änderung das svelte-autofixer Tool."
    condition { true }
  end
end

