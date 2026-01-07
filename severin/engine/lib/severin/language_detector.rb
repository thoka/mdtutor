module Severin
  class LanguageDetector
    INDICATORS = {
      en: %w[the and with for from that which should must],
      de: %w[und der die das ist sind ich wir mein für mit von auf]
    }.freeze

    # Prüft, ob der Text der Zielsprache entspricht.
    # Wir machen das pragmatisch: Wenn Indikatoren EINER ANDEREN Sprache
    # über einem Schwellenwert liegen, gilt der Text als "falsche Sprache".
    def self.matches_language?(text, target_lang, threshold: 3)
      target_lang = target_lang.to_sym
      return true unless INDICATORS.key?(target_lang)

      content = text.downcase

      # Prüfe alle anderen bekannten Sprachen
      INDICATORS.each do |lang, words|
        next if lang == target_lang

        matches = words.select { |word| content.match?(/\b#{word}\b/) }
        return false if matches.size >= threshold
      end

      true
    end
  end
end
