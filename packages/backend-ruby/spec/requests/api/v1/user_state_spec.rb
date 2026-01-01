require 'rails_helper'

RSpec.describe "Api::V1::UserStates", type: :request do
  describe "GET /api/v1/actions/user/:user_id/state" do
    let(:user_id) { "user_#{SecureRandom.hex(4)}" }

    before do
      # Setup some actions
      # Space Talk project
      # Step 0: Task 0 checked, then unchecked
      create(:action, user_id: user_id, gid: "RPL:PROJ:space-talk", action_type: "task_check", metadata: { step: 0, task_index: 0 }, timestamp: 2.hours.ago)
      create(:action, user_id: user_id, gid: "RPL:PROJ:space-talk", action_type: "task_uncheck", metadata: { step: 0, task_index: 0 }, timestamp: 1.hour.ago)

      # Step 1: Task 0 checked
      create(:action, user_id: user_id, gid: "RPL:PROJ:space-talk", action_type: "task_check", metadata: { step: 1, task_index: 0 }, timestamp: 30.minutes.ago)

      # Step 2: Quiz success
      create(:action, user_id: user_id, gid: "RPL:PROJ:space-talk", action_type: "quiz_success", metadata: { step: 2 }, timestamp: 20.minutes.ago)

      # Step Views
      create(:action, user_id: user_id, gid: "RPL:PROJ:space-talk", action_type: "step_view", metadata: { step: 0 }, timestamp: 3.hours.ago)
      create(:action, user_id: user_id, gid: "RPL:PROJ:space-talk", action_type: "step_view", metadata: { step: 1 }, timestamp: 2.hours.ago)

      # Another project: catch-the-bus
      create(:action, user_id: user_id, gid: "RPL:PROJ:catch-the-bus", action_type: "step_view", metadata: { step: 5 }, timestamp: 5.minutes.ago)
    end

    it "returns the aggregated state for the user" do
      get "/api/v1/actions/user/#{user_id}/state"
      expect(response).to have_http_status(:ok)

      json = JSON.parse(response.body)

      # Check space-talk project
      space_talk = json["projects"]["RPL:PROJ:space-talk"]
      expect(space_talk).to be_present

      # Check tasks
      # step 0, task 0 should be unchecked (false) because the uncheck was later
      expect(space_talk["tasks"]["0_0"]).to eq(false)
      # step 1, task 0 should be checked (true)
      expect(space_talk["tasks"]["1_0"]).to eq(true)

      # Check quizzes
      expect(space_talk["quizzes"]).to include(2)

      # Check views
      expect(space_talk["last_step"]).to eq(1)

      # Check catch-the-bus project
      catch_the_bus = json["projects"]["RPL:PROJ:catch-the-bus"]
      expect(catch_the_bus["last_step"]).to eq(5)
    end
  end
end
