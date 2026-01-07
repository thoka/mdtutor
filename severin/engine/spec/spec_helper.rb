require 'rspec'
require 'fileutils'
require_relative '../lib/severin'

RSpec.configure do |config|
  config.expect_with :rspec do |expectations|
    expectations.include_chain_clauses_in_custom_matcher_descriptions = true
  end

  config.mock_with :rspec do |mocks|
    mocks.verify_partial_doubles = true
  end

  config.shared_context_metadata_behavior = :apply_to_host_groups

  # Use a temporary directory for state files during tests
  config.before(:suite) do
    @tmp_dir = File.expand_path("../../tmp/spec", __dir__)
    FileUtils.mkdir_p(@tmp_dir)
  end

  config.after(:suite) do
    FileUtils.rm_rf(File.expand_path("../../tmp/spec", __dir__))
  end
end

