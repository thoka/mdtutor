require 'rails_helper'

RSpec.describe UserLoader do
  describe '.load_config' do
    it 'loads the users.yaml file' do
      config = described_class.load_config
      expect(config).to have_key('admins')
      expect(config).to have_key('users')
    end
  end

  describe '.find_user' do
    it 'finds an admin by id' do
      user = described_class.find_user('mentor_1')
      expect(user).not_to be_nil
      expect(user['name']).to include('Mentor')
    end

    it 'finds a student by id' do
      user = described_class.find_user('student_a')
      expect(user).not_to be_nil
      expect(user['name']).to eq('Alice')
    end

    it 'returns nil for unknown id' do
      expect(described_class.find_user('unknown')).to be_nil
    end
  end

  describe '.admin?' do
    it 'returns true for admins' do
      expect(described_class.admin?('mentor_1')).to be true
    end

    it 'returns false for regular users' do
      expect(described_class.admin?('student_a')).to be false
    end
  end

  describe '.verify_pin' do
    it 'returns true for correct pin' do
      expect(described_class.verify_pin('student_a', '1111')).to be true
    end

    it 'returns false for incorrect pin' do
      expect(described_class.verify_pin('student_a', 'wrong')).to be false
    end
  end

  describe '.verify_admin_password' do
    it 'returns true for correct password' do
      expect(described_class.verify_admin_password('mentor_1', 'admin')).to be true
    end

    it 'returns false for incorrect password' do
      expect(described_class.verify_admin_password('mentor_1', 'wrong')).to be false
    end
  end
end
