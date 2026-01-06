define_skill "Frontend Experte 🔹AfKxC" do
  tags :frontend, :svelte, :ui
  rule "Svelte 5 Runes ($state, $derived, $props, $effect). Legacy-Stores in Komponenten sind unerwünscht. 🔹e076F"
  rule "Svelte Autofixer nach jeder Änderung nutzen. 🔹WDFaQ"
  rule "Minimalismus-Prinzip: Kurze Antworten, minimaler Code. 🔹sYVFu"

  # Dynamische Anbindung des offiziellen Svelte MCP via npx
  # Severin startet dies nur bei Bedarf (Lazy Loading)
  use_mcp "svelte_official", command: "npx", args: ["-y", "@sveltejs/mcp-server"]

  check "Svelte 5 Runes 🔹pGyhL" do
    rule "Verwende ausschließlich Svelte 5 Runes. 🔹iTBni"
    condition { true }
    on_fail "Svelte MCP konnte nicht für die Validierung erreicht werden."
  end

  check "Svelte Autofixer 🔹lWvKA" do
    rule "Nutze nach jeder Änderung das svelte-autofixer Tool. 🔹j3Lmz"
    condition { true }
  end
end
