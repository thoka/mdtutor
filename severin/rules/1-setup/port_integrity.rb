

suite = Severin.define_suite "Code-Konventionen & Port-Integrität 🔹wJ1xe" do
  description "Stellt sicher, dass technische Parameter wie Ports zentral über die .env gesteuert werden."

  check "Keine Hardcoded Ports in Ruby/JS 🔹HfTxw" do
    rule "Ports (3101, 3102, 3103, 5201) dürfen nicht direkt im Code stehen. Nutze ENV Variablen. 🔹puyGP"

    ports = [3101, 3102, 3103, 5201]
    forbidden_files = Dir.glob("**/*.{rb,js,ts,svelte}").reject do |f|
      f.include?('node_modules/') ||
      f.include?('environment.rb') ||
      f.include?('port_integrity.rb') ||
      f.include?('.env') ||
      f.include?('mcp/server.rb')
    end

    condition do
      violating_files = []
      forbidden_files.each do |file|
        content = File.read(file)
        ports.each do |port|
          if content.match?(/\b#{port}\b/) && !content.match?(/ENV|process\.env/)
             violating_files << "#{file} (Port #{port})"
             break
          end
        end
      end

      if violating_files.any?
        @data[:message] = "Hardcoded Ports gefunden in:\n- #{violating_files.join("\n- ")}"
        false
      else
        true
      end
    end

    on_fail "Hardcoded Ports entdeckt."
    fix "Ersetze die Port-Nummer durch die entsprechende Umgebungsvariable (z.B. process.env.API_PORT oder ENV['API_PORT'])."
  end
end

