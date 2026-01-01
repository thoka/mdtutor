require 'rails_helper'

RSpec.describe TrackActionService do
  let(:user_id) { 'user123' }
  let(:action_type) { 'project_open' }
  let(:gid) { 'RPL:PROJ:space-talk' }
  let(:metadata) { { step: 1 } }
  let(:log_file) { TrackActionService.log_file }

  before do
    File.delete(log_file) if File.exist?(log_file)
  end

  describe '.call' do
    it 'appends a JSON line to the log file' do
      described_class.call(user_id: user_id, action: action_type, gid: gid, metadata: metadata)

      expect(File.exist?(log_file)).to be true
      lines = File.readlines(log_file)
      expect(lines.size).to eq(1)

      json = JSON.parse(lines.first)
      expect(json['user_id']).to eq(user_id)
      expect(json['action']).to eq(action_type)
      expect(json['gid']).to eq(gid)
      expect(json['metadata']).to eq(metadata.stringify_keys)
      expect(json['timestamp']).not_to be_nil
    end

    it 'appends multiple lines correctly' do
      described_class.call(user_id: user_id, action: 'a1')
      described_class.call(user_id: user_id, action: 'a2')

      lines = File.readlines(log_file)
      expect(lines.size).to eq(2)
      expect(JSON.parse(lines[0])['action']).to eq('a1')
      expect(JSON.parse(lines[1])['action']).to eq('a2')
    end
  end
end
