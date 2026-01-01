FactoryBot.define do
  factory :action do
    user_id { "student_a" }
    action_type { "step_view" }
    gid { "RPL:PROJ:space-talk" }
    timestamp { Time.current }
    metadata { { step: 0 } }
  end
end

