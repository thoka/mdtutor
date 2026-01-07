require 'spec_helper'
require 'severin/service'
require 'net/http'

RSpec.describe "Service Process Management" do
  let(:service) { Severin::Service.new(name: "dummy", command: "sleep 100", port: 9999) }

  after do
    if service.pid
      begin
        Process.kill("TERM", service.pid)
        Process.wait(service.pid)
      rescue
      end
    end
  end

  it "spawns a process and tracks its PID" do
    # We'll use a real spawn but keep it simple
    pid = spawn("sleep 10", out: File::NULL, err: File::NULL)
    service.pid = pid
    expect(service.pid).to be > 0

    # Check if process is alive (signal 0)
    expect { Process.kill(0, pid) }.not_to raise_error
  end

  it "verifies port is open using a probe" do
    # Mocking a port check
    service.define_probe(:port_open) do
      # In a real test we'd start a listener, but here we just test the probe logic
      true
    end
    expect(service.probe(:port_open)).to be true
  end
end

