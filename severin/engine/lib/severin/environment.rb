module Severin
  class Environment
    attr_reader :path
    attr_accessor :format, :description, :chat_language, :doc_language

    def initialize(path)
      @path = path
      @format = :human
      @description = ""
      @chat_language = "Deutsch"
      @doc_language = "English"
    end

    def format(val = nil); @format = val if val; @format; end
    def description(val = nil); @description = val if val; @description; end
    def chat_language(val = nil); @chat_language = val if val; @chat_language; end
    def doc_language(val = nil); @doc_language = val if val; @doc_language; end
  end
end
