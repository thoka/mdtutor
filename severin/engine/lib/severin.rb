require 'json'
require 'fileutils'
require_relative 'severin/config'
require_relative 'severin/mcp_client'
require_relative 'severin/identifier'
require_relative 'severin/action'
require_relative 'severin/env_loader'
require_relative 'severin/state_machine'
require_relative 'severin/workflow'
require_relative 'severin/service'
require_relative 'severin/service_manager'
require_relative 'severin/logger'
require_relative 'severin/output'
require_relative 'severin/suite'
require_relative 'severin/formatter'

# Strict Output Architecture: Patching Kernel to prevent raw puts/print
module Kernel
  alias_method :__severin_raw_puts__, :puts
  alias_method :__severin_raw_print__, :print

  def puts(*args)
    if caller.any? { |l| l.include?('severin/engine/lib/severin/output.rb') || l.include?('spec/') }
      __severin_raw_puts__(*args)
    else
      raise RuntimeError, "🔹NO-PUTS: Direkte Nutzung von 'puts' ist verboten. Nutze 'Severin.ui_info' oder 'Severin.log_debug'. (Ort: #{caller.first})"
    end
  end

  def print(*args)
    if caller.any? { |l| l.include?('severin/engine/lib/severin/output.rb') || l.include?('spec/') }
      __severin_raw_print__(*args)
    else
      raise RuntimeError, "🔹NO-PUTS: Direkte Nutzung von 'print' ist verboten. Nutze 'Severin.ui' Methoden. (Ort: #{caller.first})"
    end
  end
end

module Severin
  VERSION = "0.3.3"
  @all_results = []
  @mcp_clients = {}
  @actions = {}
  @tools = {}
  @guidance_registry = {}
  @active_tags = []
  @active_skills = {} # Hash: tag_name => [sub_tags]
  @allow_warnings = []
  @current_objective = ""
  @registered_tags = []
  @project_root = nil
  @workflow = nil
  @transition_hooks = []
  @state_definitions = {}
  @current_stage_index = nil

  @current_options = {}

  class << self
    attr_accessor :current_options
  end

  def self.mcp_clients; @mcp_clients; end
  def self.active_tags; @active_tags; end

  def self.ui
    @ui ||= begin
      require_relative 'severin/output'
      out = Output.new
      out.add_stream($stdout)
      out
    end
  end

  # Helper methods for easier access in actions
  def self.ui_info(msg); ui.puts "\e[34mℹ️  #{msg}\e[0m"; end
  def self.ui_success(msg); ui.puts "\e[32m✅ #{msg}\e[0m"; end
  def self.ui_warn(msg); ui.puts "\e[33m⚠️  #{msg}\e[0m"; end
  def self.ui_error(msg); ui.puts "\e[31m❌ #{msg}\e[0m"; end

  def self.active_skills; @active_skills; end
  def self.allow_warnings; @allow_warnings; end
  def self.current_objective; @current_objective; end
  def self.registered_tags; @registered_tags; end
  def self.project_root; @project_root || Dir.pwd; end
  def self.project_root=(path); @project_root = path; end
  def self.current_stage_index; @current_stage_index; end
  def self.current_stage_index=(idx); @current_stage_index = idx; end

  def self.workflow
    @workflow ||= Workflow.new
  end

  def self.workflow=(wf)
    @workflow = wf
  end

  # Hook Infrastructure
  def self.on_transition(from: :any, to: :any, &block)
    @transition_hooks << { from: from, to: to, block: block }
  end

  def self.on_state(state_id, &block)
    @state_definitions[state_id.to_sym] ||= []
    @state_definitions[state_id.to_sym] << block
  end

  def self.trigger_state_hooks(state_id)
    return unless @state_definitions[state_id.to_sym]
    @state_definitions[state_id.to_sym].each(&:call)
  end

  def self.trigger_transition_hooks(from, to, context)
    @transition_hooks.each do |hook|
      next unless hook[:from] == :any || hook[:from] == from
      next unless hook[:to] == :any || hook[:to] == to
      result = hook[:block].call(context)
      raise TransitionBlockedError, "Transition from #{from} to #{to} blocked by hook." if result == false
    end
  end

  def self.state_definitions_for(state_id)
    @state_definitions[state_id.to_sym] || []
  end

  class TransitionBlockedError < StandardError; end

  def self.register_tag(tag)
    @registered_tags << tag.to_sym unless @registered_tags.include?(tag.to_sym)
  end

  def self.set_focus(tags: [], skills: [], allow_warnings: [])
    @active_tags = tags.map(&:to_sym)
    if skills.is_a?(Array)
      skills.each { |s| @active_skills[s.to_sym] = [] }
    else
      @active_skills = skills.transform_keys(&:to_sym)
    end
    @allow_warnings = allow_warnings.map(&:to_sym)
  end

  def self.draw_state(&block)
    @context_to_eval = block
  end

  def self.eval_state!
    return unless @context_to_eval
    context = StateContext.new
    context.instance_eval(&@context_to_eval)

    @active_tags = context.data[:tags]
    @active_skills = context.data[:skills]
    @allow_warnings = context.data[:allow]
    @current_objective = context.data[:objective]

    if context.data[:workflow_state]
      self.workflow.state = context.data[:workflow_state]
    end
  end

  class StateContext
    attr_reader :data
    def initialize
      @data = { tags: [], skills: {}, allow: [], objective: "", workflow_state: nil }
    end
    def focus(*tags); @data[:tags] += tags.map(&:to_sym); end
    def skill(*args)
      args.each do |arg|
        if arg.is_a?(Hash)
          arg.each { |s, t| @data[:skills][s.to_sym] ||= []; @data[:skills][s.to_sym] += Array(t).map(&:to_sym) }
        else
          @data[:skills][arg.to_sym] ||= []
        end
      end
    end
    def allow(*checks); @data[:allow] += checks.map(&:to_sym); end
    def objective(text); @data[:objective] = text; end
    def workflow(state); @data[:workflow_state] = state.to_sym; end
  end

  def self.register_guidance(tag, text)
    @guidance_registry[tag.to_sym] ||= []
    @guidance_registry[tag.to_sym] << text unless @guidance_registry[tag.to_sym].include?(text)
  end

  def self.guidance_for(tag); @guidance_registry[tag.to_sym] || []; end
  def self.config; Config; end
  def self.mcp(name, command = nil, args = [])
    @mcp_clients[name] ||= MCPClient.new(name, command, args) if command
    @mcp_clients[name]
  end

  def self.actions; @actions ||= {}; end

  def self.log_debug(msg, **context)
    Logger.instance.debug(msg, **context)
    # Konsolen-Ausgabe deaktiviert. Alles geht nur noch in die Logs.
  end

  def self.log_success(msg, **context)
    log_debug "SUCCESS: #{msg}", **context
  end

  def self.log_duration(name, **context)
    start_time = Time.now
    yield
  ensure
    duration = (Time.now - start_time) * 1000
    log_debug "Duration: #{name}", **context.merge(duration_ms: duration.round(2))
  end

  def self.define_action(name, &block)
    @actions[name] = Action.new(name, &block)
  end

  def self.tools; @tools; end
  def self.define_tool(name, &block)
    require_relative 'severin/action'
    @tools[name] = Action.new(name, &block)
  end

  def self.load_plugins_from(dir)
    @loaded_plugin_files ||= []
    return unless Dir.exist?(dir)
    Dir.glob(File.join(dir, "**/*.rb")).each do |file|
      abs_path = File.expand_path(file)
      next if @loaded_plugin_files.include?(abs_path)
      load file
      @loaded_plugin_files << abs_path
    end
  end

  def self.load_all_plugins
    load_plugins_from(File.expand_path("../../actions", __dir__))
    load_plugins_from(File.expand_path("severin/actions", project_root))
    load_plugins_from(File.expand_path("../../tools", __dir__))
    load_plugins_from(File.expand_path("severin/tools", project_root))
  end

  def self.define_suite(name, &block)
    suite = Suite.new(name, &block)
    @all_results << suite.result
    suite
  end

  def self.define_skill(name, &block)
    suite = Suite.new("Skill: #{name}", &block)
    @skills[name] = suite.result
    @all_results << suite.result
    suite
  end

  def self.all_results; @all_results; end

  def self.sh(command)
    require 'open3'
    log_debug "Executing shell command", command: command, pwd: Dir.pwd
    out, err, status = Open3.capture3(command)

    result = []
    result << "📂 PWD: #{Dir.pwd}"
    result << "🚀 CMD: #{command}"
    result << "---"
    result << out unless out.empty?
    result << "⚠️ STDERR:\n#{err}" unless err.empty?
    result << "❌ EXIT STATUS: #{status.exitstatus}" unless status.success?

    result.join("\n")
  end

  def self.reset!
    @all_results = []
    @environments = []
    @skills = {}
  end
  @skills = {}
  def self.skills; @skills; end
  @environments = []
  def self.environments; @environments; end

  def self.define_environment(path, &block)
    @environments ||= []
    require_relative 'severin/environment'
    env = Environment.new(path)
    env.instance_eval(&block) if block_given?
    @environments << env
    env
  end
end

def define_suite(name, &block); Severin.define_suite(name, &block); end
def define_skill(name, &block); Severin.define_skill(name, &block); end
def define_environment(path, &block); Severin.define_environment(path, &block); end
