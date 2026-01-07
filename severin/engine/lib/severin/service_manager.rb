require 'yaml'
require 'fileutils'
require_relative 'service'

module Severin
  class ServiceManager
    attr_reader :services

    def initialize(state_file = nil, services_dir = nil)
      root = find_root
      EnvLoader.load(root)
      @state_file = state_file || File.join(root, "severin/state/services.yml")
      @services_dir = services_dir || File.join(root, "severin/services")
      @services = {}
      load_definitions!
      load!
    end

    def find_root
      # Try to find the directory that contains 'severin/rules'
      curr = Dir.pwd
      while curr != "/"
        return curr if Dir.exist?(File.join(curr, "severin/rules"))
        curr = File.dirname(curr)
      end
      Dir.pwd # Fallback
    end

    def load_definitions!
      return unless Dir.exist?(@services_dir)

      files = Dir.glob(File.join(@services_dir, "*.yml"))
      files.each do |file|
        begin
          content = File.read(file)
          interpolated_content = EnvLoader.interpolate(content)
          raw_attrs = YAML.safe_load(interpolated_content)
          unless raw_attrs
            next
          end

          # Manually symbolize keys
          attrs = {}
          raw_attrs.each { |k, v| attrs[k.to_sym] = v }

          # Ensure port is an integer if it's a string from env
          attrs[:port] = attrs[:port].to_i if attrs[:port] && attrs[:port].is_a?(String)

          name = attrs[:name] || File.basename(file, ".yml")
          attrs[:name] = name
          @services[name] = Service.new(attrs)
        rescue => e
          # Ignore error for now or log it
        end
      end
    end

    def register(service)
      @services[service.name] = service
    end

    def start_service(name, log_dir)
      service = @services[name.to_s]
      return unless service
      return if service.running? || service.starting?

      # Start dependencies first
      service.depends_on.each do |dep_name|
        start_service(dep_name, log_dir)
      end

      service.start!(log_dir)
    end

    def load!
      return unless File.exist?(@state_file)

      File.open(@state_file, File::RDONLY) do |f|
        f.flock(File::LOCK_SH)
        data = YAML.safe_load(f.read, permitted_classes: [Symbol, Time]) || {}
        data.each do |name, attrs|
          # YAML returns string keys, we need to convert them to symbols for Service.new
          symbolized_attrs = {}
          attrs.each { |k, v| symbolized_attrs[k.to_sym] = v }

          if @services[name]
            # Update existing definition with saved state
            svc = @services[name]
            svc.state = symbolized_attrs[:state].to_sym if symbolized_attrs[:state]
            svc.pid = symbolized_attrs[:pid]
            svc.last_error = symbolized_attrs[:last_error]
            svc.started_at = symbolized_attrs[:started_at]
          else
            # New service from state file (not in definitions)
            service = Service.new(symbolized_attrs)
            service.state = symbolized_attrs[:state].to_sym if symbolized_attrs[:state]
            @services[name] = service
          end
        end
      end
    rescue => e
      # In case of corruption or other issues, we start fresh
      # but we should probably log this if debug is on
      @services = {}
    end

    def save!
      FileUtils.mkdir_p(File.dirname(@state_file))

      File.open(@state_file, File::RDWR|File::CREAT, 0644) do |f|
        f.flock(File::LOCK_EX)

        # Merge existing data to not lose other services if they were added concurrently
        # Simple implementation: reread and merge
        existing_data = {}
        begin
          f.rewind
          existing_data = YAML.safe_load(f.read, permitted_classes: [Symbol, Time]) || {}
        rescue
          existing_data = {}
        end

        current_data = {}
        @services.each do |name, service|
          current_data[name] = service.to_h
        end

        merged_data = existing_data.merge(current_data)

        f.rewind
        f.write(YAML.dump(merged_data))
        f.flush
        f.truncate(f.pos)
      end
    end
  end
end
