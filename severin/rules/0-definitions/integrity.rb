# This file defines the strict integrity and exception standards.

define_skill "Strict Integrity Enforcement" do
  description "Regelt den Umgang mit Regelverletzungen und Ausnahmen."
  tag :core

  rule "Binary Success: Alle Severin-Checks müssen standardmäßig erfolgreich sein (PASSED). " \
       "Es gibt keine impliziten Warnungen auf Framework-Ebene. 🔹STRICT-FAIL"

  rule "State-controlled Exceptions: Ausnahmen (Warnungen) sind NUR zulässig, wenn sie " \
       "explizit in der `severin_state.rb` unter `allow_warnings` definiert sind. 🔹STATE-EXC"

  rule "No Self-Leniency: Agenten dürfen niemals eigenmächtig Regeln in den State-Dokumenten " \
       "als Warnung deklarieren, um Aufgaben zu vereinfachen. Dies erfordert immer eine " \
       "explizite Nutzer-Anweisung. 🔹NO-SOFTEN"

  rule "Technical Debt Visibility: Jede deklarierte Ausnahme im State gilt als bewusste " \
       "technische Schuld und muss im nächsten Ship-Prozess kritisch hinterfragt werden. 🔹DEBT-VIS"
end

