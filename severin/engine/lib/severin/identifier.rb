module Severin
  class Identifier
    CHARS = ('a'..'z').to_a + ('A'..'Z').to_a + ('0'..'9').to_a
    ID_REGEX = /🔹([a-zA-Z0-9]{5})/

    def self.generate
      "🔹" + 5.times.map { CHARS.sample }.join
    end

    def self.extract(text)
      text.scan(ID_REGEX).flatten
    end

    def self.present?(text)
      text.match?(ID_REGEX)
    end

    # Sucht nach einer freien ID, die noch nicht im Projekt vorkommt
    def self.next_unique(project_root = Dir.pwd)
      loop do
        id = generate
        # Wir greifen auf grep zurück, um das gesamte Projekt schnell zu scannen
        # Ignoriere .git und andere Verzeichnisse via ripgrep falls verfügbar
        exists = system("grep -r '#{id}' #{project_root} --exclude-dir=.git > /dev/null 2>&1")
        return id unless exists
      end
    end
  end
end
