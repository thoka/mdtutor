class Action < ApplicationRecord
  include Uuidable
  serialize :metadata, coder: JSON

  scope :quizzes, -> { where(action_type: ['quiz_attempt', 'quiz_success']) }
  scope :for_question, ->(idx) { 
    # Use standard SQL for JSON searching if possible, 
    # but for SQLite/development we might need to filter in Ruby 
    # or use simple LIKE if the JSON structure is simple.
    all.select { |a| a.metadata["question_index"] == idx }
  }
end
