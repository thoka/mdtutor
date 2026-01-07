module Severin
  module Actions
    class Base
      attr_reader :options

      def self.register_options(parser, options)
        # To be implemented by subclasses
      end

      def initialize(options = {})
        @options = options
      end

      def call(args = [])
        raise NotImplementedError, "#{self.class} must implement #call"
      end

      protected

      def find_root
        require 'pathname'
        curr = Pathname.new(Dir.pwd)
        curr.ascend do |path|
          return path.to_s if File.exist?(File.join(path, "severin_state.rb"))
          return path.to_s if Dir.exist?(File.join(path, "severin/rules"))
        end
        nil
      end
    end
  end
end
