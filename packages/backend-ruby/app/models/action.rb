class Action < ApplicationRecord
  include Uuidable
  serialize :metadata, coder: JSON
end
