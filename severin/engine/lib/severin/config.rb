require 'json'
require 'fileutils'

module Severin
  class Config
    PATH = File.expand_path("../../config.json", __dir__)

    def self.load
      return { "debug" => false, "active_project" => nil } unless File.exist?(PATH)
      JSON.parse(File.read(PATH))
    rescue
      { "debug" => false, "active_project" => nil }
    end

    def self.save(data)
      File.write(PATH, JSON.generate(data))
    end

    def self.debug?
      load["debug"] == true
    end

    def self.set_debug(value)
      data = load
      data["debug"] = value
      save(data)
    end

    def self.set_project(path)
      data = load
      data["active_project"] = File.expand_path(path)
      save(data)
    end

    def self.active_project
      load["active_project"]
    end
  end
end
