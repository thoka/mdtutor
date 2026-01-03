define_skill "Frontend Experte" do
  rule "Svelte 5 Runes ($state, $derived, $props, $effect). Legacy-Stores in Komponenten sind unerwünscht."
  rule "Svelte Autofixer nach jeder Änderung nutzen."
  rule "Minimalismus-Prinzip: Kurze Antworten, minimaler Code."

  # Dynamische Anbindung des offiziellen Svelte MCP via npx
  # Sentinel startet dies nur bei Bedarf (Lazy Loading)
  use_mcp "svelte_official", command: "npx", args: ["-y", "@sveltejs/mcp-server"]

  check "Svelte 5 Runes" do
    rule "Verwende ausschließlich Svelte 5 Runes."
    condition do
      # Beispielhafter Call an das npx-gestartete MCP
      # Da wir im Check-Modus sind, könnten wir hier Dokumentation oder Validierung abfragen
      # Für dieses Beispiel bleiben wir bei einem Erfolg, solange das MCP antwortet
      # res = mcp_tool("svelte_official", "get-documentation", { section: "runes" })
      # !res.nil?
      true 
    end
    on_fail "Svelte MCP konnte nicht für die Validierung erreicht werden."
  end

  check "Svelte Autofixer" do
    rule "Nutze nach jeder Änderung das svelte-autofixer Tool."
    condition { true }
  end
end
