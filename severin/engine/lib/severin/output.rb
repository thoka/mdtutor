module Severin
  class Output
    def initialize
      @streams = []
    end

    def add_stream(io)
      @streams << io
    end

    def puts(msg = "")
      @streams.each { |s| s.puts(msg) }
    end

    def print(msg = "")
      @streams.each { |s| s.print(msg) }
    end

    def flush
      @streams.each { |s| s.flush if s.respond_to?(:flush) }
    end
  end
end
