class Presence < ApplicationRecord
  validates :user_id, presence: true, uniqueness: true

  def self.present?(user_id)
    find_by(user_id: user_id)&.is_present || false
  end

  def self.toggle(user_id)
    p = find_or_initialize_by(user_id: user_id)
    p.is_present = !p.is_present
    p.save!
    p.is_present
  end

  def self.present_user_ids
    where(is_present: true).pluck(:user_id)
  end
end

