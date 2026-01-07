module Severin
  module EnvLoader
    def self.load(root)
      # Priority: .env, then docker.env.example if no docker.env
      env_files = [".env", "docker.env", "docker.env.example"]

      env_files.each do |file|
        path = File.join(root, file)
        next unless File.exist?(path)

        load_file(path)
      end
    end

    def self.load_file(path)
      File.readlines(path).each do |line|
        line = line.strip
        next if line.empty? || line.start_with?("#")

        key, value = line.split("=", 2)
        next unless key && value

        # Remove quotes if present
        value = value.gsub(/^["']|["']$/, '')

        ENV[key.strip] ||= value.strip
      end
    end

    def self.interpolate(content)
      content.gsub(/\$\{(\w+)(?::-([^}]+))?\}/) do
        var_name = $1
        default_value = $2
        ENV[var_name] || default_value || ""
      end
    end
  end
end

