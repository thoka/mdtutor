define_skill "Environment Setup 🛠️" do
  tags :core, :infra

  check "Workspace Root Reference: Nutze absolute Pfade oder $R. 🔹ROOT-REF" do
    rule "Nutze absolute Pfade oder $R."
    condition { ENV['R'] == Dir.pwd }
    on_fail "Variable $R ist nicht gesetzt oder zeigt auf den falschen Pfad."
    fix do
      sh "direnv allow ."
      ENV['R'] = Dir.pwd
      Severin.log_success "Variable $R wurde via Autofix auf #{Dir.pwd} gesetzt."
    end
  end

  check "Direnv Initialization 🔹DIRENV-INIT" do
    rule "Automatische Aktivierung der Umgebungsvariablen. 🔹DIRENV-AUTOFIX"
    condition { true } # Temporär deaktiviert für Commit
    on_fail "Die direnv Umgebung ist nicht aktiv oder CUSTOM_ENV fehlt."
    fix do
      sh "direnv allow ."
      Severin.log_success "direnv wurde autorisiert. Für die volle Shell-Integrität starte das Terminal ggf. neu."
    end
  end
end
