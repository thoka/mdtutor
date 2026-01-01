class Visit < ApplicationRecord
  include Uuidable
  belongs_to :room
end
