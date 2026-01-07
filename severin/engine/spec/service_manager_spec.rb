require 'spec_helper'
require 'severin/service_manager'
require 'yaml'

RSpec.describe Severin::ServiceManager do
  let(:state_file) { File.expand_path("../../tmp/spec/services.yml", __dir__) }
  let(:services_dir) { File.expand_path("../../tmp/spec/services", __dir__) }
  let(:manager) { Severin::ServiceManager.new(state_file, services_dir) }

  before do
    FileUtils.mkdir_p(services_dir)
    FileUtils.rm_f(state_file)
  end

  it "saves and loads services" do
    service = Severin::Service.new(name: "api", command: "ls", port: 3000)
    manager.register(service)
    manager.save!

    expect(File.exist?(state_file)).to be true

    new_manager = Severin::ServiceManager.new(state_file, services_dir)
    expect(new_manager.services.key?("api")).to be true
    expect(new_manager.services["api"].port).to eq(3000)
    expect(new_manager.services["api"].state).to eq(:stopped)
  end

  it "handles concurrent access with locking" do
    # This is a bit tricky to test in a single thread,
    # but we can verify that flock is called.
    # We'll just test that multiple instances don't corrupt each other.

    m1 = Severin::ServiceManager.new(state_file, services_dir)
    m2 = Severin::ServiceManager.new(state_file, services_dir)

    m1.register(Severin::Service.new(name: "s1", command: "c1"))
    m1.save!

    m2.load!
    m2.register(Severin::Service.new(name: "s2", command: "c2"))
    m2.save!

    m1.load!
    expect(m1.services.keys).to contain_exactly("s1", "s2")
  end
end
