require 'rails_helper'

RSpec.describe Presence, type: :model do
  let!(:default_room) { Room.create!(slug: 'default', name: 'Default Room') }
  let(:user_id) { 'student_a' }

  describe '.toggle' do
    it 'creates a presence and a visit when checking in' do
      expect {
        described_class.toggle(user_id)
      }.to change(Presence, :count).by(1)
       .and change(Visit, :count).by(1)

      p = Presence.find_by(user_id: user_id)
      expect(p.is_present).to be true
      expect(p.room).to eq(default_room)

      v = Visit.find_by(user_id: user_id, ended_at: nil)
      expect(v).not_to be_nil
      expect(v.room).to eq(default_room)
    end

    it 'updates presence and ends visit when checking out' do
      # Setup: check in first
      described_class.toggle(user_id)

      expect {
        described_class.toggle(user_id)
      }.to change(Presence, :count).by(0) # Record exists, just updated
       .and change(Visit, :count).by(0) # No new visit, just ended old one

      p = Presence.find_by(user_id: user_id)
      expect(p.is_present).to be false
      expect(p.room_id).to be_nil

      v = Visit.where(user_id: user_id).order(created_at: :desc).first
      expect(v.ended_at).not_to be_nil
    end

    it 'uses a specific room when provided' do
      lab = Room.create!(slug: 'lab', name: 'Laboratory')
      described_class.toggle(user_id, room_id: lab.id)

      p = Presence.find_by(user_id: user_id)
      expect(p.room).to eq(lab)
    end
  end
end
