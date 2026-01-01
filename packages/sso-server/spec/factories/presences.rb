FactoryBot.define do
  factory :presence do
    user_id { "student_a" }
    is_present { true }
    room
  end
end

