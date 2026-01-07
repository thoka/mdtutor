require 'spec_helper'
require 'severin/service'

RSpec.describe Severin::Service do
  let(:service) { Severin::Service.new(name: "test-api", command: "sleep 10", port: 3000) }

  describe "States" do
    it "starts in stopped state" do
      expect(service.state).to eq(:stopped)
      expect(service.stopped?).to be true
    end

    it "can transition to starting" do
      service.boot!
      expect(service.state).to eq(:starting)
      expect(service.starting?).to be true
    end

    it "can transition from starting to running" do
      service.boot!
      service.up!
      expect(service.state).to eq(:running)
      expect(service.running?).to be true
    end

    it "can transition to error from starting or running" do
      service.boot!
      service.fail!(message: "Port occupied")
      expect(service.state).to eq(:error)
      expect(service.last_error).to eq("Port occupied")
    end

    it "raises error on invalid transition" do
      expect { service.up! }.to raise_error(/Invalid transition/)
    end
  end

  describe "Probes" do
    it "defines a probe logic" do
      service.define_probe(:alive) { true }
      expect(service.probe(:alive)).to be true
    end
  end
end

