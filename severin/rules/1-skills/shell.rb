define_skill "Shell Integrity 🐚" do
  tags :shell, :core # Tag 'shell' explizit definiert

  description "Sicherstellung einer konsistenten Terminal-Umgebung und Pfad-Stabilität."

  rule "Return to Root: Pfad-Stabilität im Terminal. 🔹SH-PATH" do
    condition { true } # Dauerhaft aktiv für alle Shell-Operationen

    on_fail "Terminal-Befehle haben den Kontext verlassen, ohne zum Ursprung zurückzukehren."

    guidance :workflow, <<~MARKDOWN
      Sorge dafür, dass sich bei Nutzung des Terminals der aktuelle Pfad nicht permanent ändert.
      Wenn du terminal-befehle mit `cd` startest, beende sie zwingend mit `&& cd -`, um zum Ausgangspunkt zurückzukehren.

      **Beispiel:**
      `cd $R/severin/engine && bundle exec rspec && cd -`
    MARKDOWN
  end
end
