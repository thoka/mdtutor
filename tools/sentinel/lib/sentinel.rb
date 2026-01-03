require 'json'
require 'fileutils'

module Sentinel
  class Result
    attr_reader :suite_name, :checks
    attr_accessor :description

    def initialize(suite_name)
      @suite_name = suite_name
      @description = ""
      @checks = []
    end

    def add_check(check_data)
      @checks << check_data
    end

    def success?
      @checks.all? { |c| c[:passed] }
    end

    def to_h
      {
        suite: @suite_name,
        status: success? ? 'passed' : 'failed',
        results: @checks
      }
    end
  end

  class CheckContext
    attr_reader :data

    def initialize(name)
      @data = {
        name: name,
        passed: false,
        target: nil,
        message: nil,
        fix_command: nil
      }
    end

    def target(path = nil)
      @data[:target] = path if path
      @data[:target]
    end

    def condition(&block)
      @condition_block = block
    end

    def on_fail(msg)
      @data[:message] = msg
    end

    def fix(cmd)
      @data[:fix_command] = cmd
    end

    def rule(text)
      @data[:rule] = text
    end

    def run
      @data[:passed] = @condition_block.call
      @data
    end
  end

  class Suite
    def initialize(name, &block)
      @result = Result.new(name)
      instance_eval(&block)
    end

    def check(name, &block)
      ctx = CheckContext.new(name)
      ctx.instance_eval(&block)
      @result.add_check(ctx.run)
    end

    def description(text)
      @result.description = text
    end

    def report(formatter_type = :human)
      case formatter_type
      when :agent
        AgentFormatter.new(@result).display
      else
        HumanFormatter.new(@result).display
      end
    end

    def result
      @result
    end
  end

  def self.last_result
    @last_result
  end

  def self.define_suite(name, &block)
    suite = Suite.new(name, &block)
    @last_result = suite.result
    suite
  end

  def self.define_skill(name, &block)
    # Ein Skill ist semantisch eine Suite, wird aber für die Dokumentation markiert
    suite = Suite.new("Skill: #{name}", &block)
    @last_result = suite.result
    suite
  end

  class Formatter
    def initialize(result)
      @result = result
    end
  end

  class HumanFormatter < Formatter
    def display
      puts "\n🔍 Sentinel Suite: #{@result.suite_name}"
      @result.checks.each do |c|
        if c[:passed]
          puts "  \e[32m✔\e[0m #{c[:name]}"
        else
          puts "  \e[31m✘\e[0m #{c[:name]}"
          puts "    \e[33m💡 #{c[:message]}\e[0m" if c[:message]
          puts "    \e[36m👉 Fix: #{c[:fix_command]}\e[0m" if c[:fix_command]
        end
      end
      puts "\nOverall: #{@result.success? ? "\e[32mPASSED\e[0m" : "\e[31mFAILED\e[0m"}"
    end
  end

  class AgentFormatter < Formatter
    def display
      status = @result.success? ? "PASSED" : "FAILED"
      puts "## 🤖 Sentinel Action Report: #{status}"
      puts "Suite: `#{@result.suite_name}`\n\n"

      failed_checks = @result.checks.reject { |c| c[:passed] }

      if failed_checks.empty?
        puts "All checks passed. No action required."
      else
        failed_checks.each do |c|
          puts "### [FIX] #{c[:name]}"
          puts "- **Target**: `#{c[:target]}`" if c[:target]
          puts "- **Problem**: #{c[:message]}" if c[:message]
          puts "- **AI Action**: Execute the command below:"
          puts "\n```bash\n#{c[:fix_command]}\n```\n" if c[:fix_command]
        end
      end
    end
  end
end
