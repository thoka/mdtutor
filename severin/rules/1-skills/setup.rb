define_skill "Environment Setup 🛠️" do
  tags :meta, :infra, :setup

  description "Stellt sicher, dass die Projektumgebung (direnv, Pfade) korrekt initialisiert ist."

  rule "Workspace Root Reference: Nutze absolute Pfade oder $R. 🔹ROOT-REF" do
    condition { ENV['R'] == Dir.pwd }
    on_fail {
      Severin.log_info "Variable $R ist nicht gesetzt oder zeigt auf den falschen Pfad."
      Severin.log_info "Führe 'direnv allow' aus und stelle sicher, dass direnv in deiner Shell aktiv ist."
    }
  end

  rule "Direnv Initialization: Automatische Aktivierung der Umgebungsvariablen. 🔹DIRENV-INIT" do
    condition { 
      # Prüfen ob .envrc existiert und direnv exportiert wurde
      File.exist?(".envrc") && !ENV['CUSTOM_ENV'].nil?
    }
    on_fail {
      "Die direnv Umgebung ist nicht aktiv. Bitte führe `direnv allow` im Root aus."
    }
    fix {
      sh "direnv allow ."
      Severin.log_success "direnv wurde autorisiert. Bitte starte das Terminal ggf. neu oder nutze 'eval $(direnv export bash)'."
    }
  end
end

