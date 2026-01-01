FactoryBot.define do
  factory :visit do
    user_id { "student_a" }
    room
    started_at { Time.current - 1.hour }
  end
end

