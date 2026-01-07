require 'spec_helper'
require 'severin/service_manager'
require 'socket'

RSpec.describe "Severin Service Integration" do
  let(:root) { File.expand_path("../../tmp/spec", __dir__) }
  let(:state_file) { File.join(root, "services.yml") }
  let(:services_dir) { File.join(root, "services") }
  let(:log_dir) { File.join(root, "log") }
  let(:manager) { Severin::ServiceManager.new(state_file, services_dir) }

  before do
    FileUtils.mkdir_p(services_dir)
    FileUtils.mkdir_p(log_dir)

    # Create a mock service definition
    # This mock service will just start a small TCP server on a random port
    @port = 3000 + rand(1000)
    File.write(File.join(services_dir, "mock-api.yml"), <<~YAML)
      name: mock-api
      command: ruby -e "require 'socket'; server = TCPServer.new(#{@port}); loop { client = server.accept; client.puts 'OK'; client.close }"
      port: #{@port}
    YAML

    manager.load_definitions!
  end

  after do
    svc = manager.services["mock-api"]
    svc&.stop!
    FileUtils.rm_rf(root)
  end

  it "manages the full lifecycle of a service" do
    service = manager.services["mock-api"]
    expect(service).not_to be_nil
    expect(service.state).to eq(:stopped)

    # 1. Start
    service.start!(log_dir)
    manager.save!
    expect(service.state).to eq(:starting)
    expect(service.pid).to be > 0

    # 2. Wait for it to be running (health check)
    # We poll refresh! until it's running or timeout
    10.times do
      service.refresh!
      break if service.running?
      sleep 0.5
    end
    expect(service.state).to eq(:running)
    expect(service.probe(:port_open)).to be true

    # 3. Stop
    service.stop!
    manager.save!
    expect(service.state).to eq(:stopped)
    expect(service.pid).to be_nil

    # Give OS a moment to release the port
    sleep 1.0

    # Check if port is closed
    expect(service.probe(:port_open)).to be false
  end

  it "detects when a process dies" do
    service = manager.services["mock-api"]
    service.start!(log_dir)

    # Wait for running
    10.times { service.refresh!; break if service.running?; sleep 0.5 }
    expect(service.state).to eq(:running)

    # Simulate crash: kill the process
    Process.kill("KILL", service.pid)
    sleep 0.5 # Give OS time to clean up

    service.refresh!
    expect(service.state).to eq(:error)
    expect(service.last_error).to include("died unexpectedly")
  end

  it "starts dependencies automatically" do
    File.write(File.join(services_dir, "db.yml"), <<~YAML)
      name: db
      command: sleep 100
    YAML
    File.write(File.join(services_dir, "api.yml"), <<~YAML)
      name: api
      command: sleep 100
      depends_on: [db]
    YAML

    manager.load_definitions!

    manager.start_service("api", log_dir)

    expect(manager.services["db"].state).to eq(:starting)
    expect(manager.services["api"].state).to eq(:starting)

    manager.services["api"].stop!
    manager.services["db"].stop!
  end
end
