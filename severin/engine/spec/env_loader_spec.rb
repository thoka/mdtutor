require 'spec_helper'
require 'severin/env_loader'

RSpec.describe Severin::EnvLoader do
  describe ".interpolate" do
    it "replaces variables from ENV" do
      ENV["TEST_VAR"] = "9999"
      expect(Severin::EnvLoader.interpolate("port: ${TEST_VAR}")).to eq("port: 9999")
    end

    it "uses default value if variable is missing" do
      ENV.delete("MISSING_VAR")
      expect(Severin::EnvLoader.interpolate("port: ${MISSING_VAR:-3000}")).to eq("port: 3000")
    end

    it "replaces multiple variables" do
      ENV["VAR1"] = "aaa"
      ENV["VAR2"] = "bbb"
      expect(Severin::EnvLoader.interpolate("${VAR1}/${VAR2}")).to eq("aaa/bbb")
    end
  end

  describe ".load_file" do
    it "parses a simple env file" do
      tmp_env = File.expand_path("../../tmp/spec/.env.test", __dir__)
      File.write(tmp_env, "FOO=bar\nBAZ=qux")

      ENV.delete("FOO")
      ENV.delete("BAZ")

      Severin::EnvLoader.load_file(tmp_env)
      expect(ENV["FOO"]).to eq("bar")
      expect(ENV["BAZ"]).to eq("qux")
    end
  end
end

