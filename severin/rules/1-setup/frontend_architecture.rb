define_suite "Frontend Architecture 🔹AfKxC" do
  description "Regeln für die Frontend-Entwicklung mit Svelte 5."

  rule "Verwende ausschließlich Svelte 5 Runes ($state, $derived, $props, $effect). Legacy-Stores in Komponenten sind unerwünscht. 🔹e076F"

  check "Svelte 5 Runes Compliance 🔹SVELTE-1" do
    rule "Alle Komponenten müssen den Svelte 5 Standard einhalten."
    # Nutzt die neue rspec-Erweiterung in Severin!
    rspec "severin/specs/architecture/svelte_runes_spec.rb"
    on_fail "Svelte 5 Runes Compliance fehlgeschlagen. Bitte prüfe die Komponenten."
  end
end
