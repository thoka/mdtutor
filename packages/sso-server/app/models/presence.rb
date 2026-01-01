class Presence < ApplicationRecord
  include Uuidable
  belongs_to :room, optional: true
  validates :user_id, presence: true, uniqueness: true

  def self.present?(user_id)
    find_by(user_id: user_id)&.is_present || false
  end

  def self.toggle(user_id, room_id: nil)
    p = find_or_initialize_by(user_id: user_id)

    # Use default room if none provided
    room_id ||= Room.find_by(slug: "default")&.id

    if p.is_present
      # Check-out
      p.is_present = false
      p.room_id = nil
      # End open visit
      Visit.where(user_id: user_id, ended_at: nil).update_all(ended_at: Time.current)
    else
      # Check-in
      p.is_present = true
      p.room_id = room_id
      # Start new visit
      Visit.create!(user_id: user_id, room_id: room_id, started_at: Time.current)
    end

    p.save!
    p.is_present
  end

  def self.present_user_ids
    where(is_present: true).pluck(:user_id)
  end
end
