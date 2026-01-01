module Uuidable
  extend ActiveSupport::Concern

  included do
    before_create :generate_uuid
  end

  private

  def generate_uuid
    self.id ||= SecureRandom.uuid
  end
end

