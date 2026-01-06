define_skill "Tagging Culture 🏷️" do
  tags :meta, :workflow, :dev

  description "Definiert die Regeln für eine präzise und hilfreiche Tag-basierte Steuerung des Agenten-Kontexts. 🔹S8YoJ"

  rule "Granular Skills: Bevorzuge viele spezialisierte Skills gegenüber wenigen monolithischen. 🔹TAG-GRANULAR" do
    condition { true }
  end

  rule "Dual Tagging: Kombiniere immer Technologie-Tags (:ruby, :svelte) mit Themen-Tags (:logic, :ui, :infra). 🔹TAG-DUAL" do
    condition { true }
  end

  rule "Explicit Focus: Liste alle relevanten Skills in der `severin_state.rb` explizit auf. 🔹TAG-EXPLICIT" do
    condition { true }
  end

  guidance :workflow, <<~TEXT
    Folge dieser Tagging-Kultur für MDTutor:
    1. Technologie-Tags (Was?): Nutze :ruby, :js, :svelte, :rspec, :css.
    2. Themen-Tags (Wie/Warum?): Nutze :logic (Traceability), :ui (User Interface), :infra (Engine/Docker), :security.
    3. Vollständigkeit: Es ist besser, einen Skill zu viel zu laden als einen zu wenig. Fehlender Kontext führt zu Fehlentscheidungen.
  TEXT
end
