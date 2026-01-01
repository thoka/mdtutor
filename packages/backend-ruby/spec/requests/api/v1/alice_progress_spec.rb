require 'rails_helper'

RSpec.describe "Alice Progress Verification", type: :request do
  let(:alice_id) { 'student_a' }
  let(:catch_the_bus_gid) { 'RPL:PROJ:catch-the-bus' }

  describe "GET /api/v1/actions/user/:user_id" do
    it "returns the actions that constitute > 60% progress for catch-the-bus" do
      get "/api/v1/actions/user/#{alice_id}"
      expect(response).to have_http_status(:ok)
      
      actions = JSON.parse(response.body)
      project_actions = actions.select { |a| a["gid"] == catch_the_bus_gid }
      
      # 66% progress means steps 0-5 are complete
      completed_steps = project_actions.select { |a| a["action_type"] == "step_complete" }
                                      .map { |a| a["metadata"]["step"] }
                                      .uniq
      expect(completed_steps).to include(0, 1, 2, 3, 4, 5)

      # Checkboxes should be marked for step 4
      step_4_tasks = project_actions.select { |a| a["action_type"] == "task_check" && a["metadata"]["step"] == 4 }
      expect(step_4_tasks.size).to be > 0
    end

    it "has half tasks completed for find-the-bug" do
      get "/api/v1/actions/user/#{alice_id}"
      actions = JSON.parse(response.body)
      ftb_actions = actions.select { |a| a["gid"] == "RPL:PROJ:find-the-bug" }
      
      # Step 1 has 10 tasks, 5 should be checked
      step_1_tasks = ftb_actions.select { |a| a["action_type"] == "task_check" && a["metadata"]["step"] == 1 }
      expect(step_1_tasks.size).to eq(5)
    end

    it "correctly handles task unchecking" do
      # 1. Check a task
      post "/api/v1/actions", params: {
        action_type: 'task_check',
        gid: catch_the_bus_gid,
        metadata: { step: 4, task_index: 99 }
      }, headers: { "Authorization" => "Bearer #{JwtService.encode({user_id: alice_id})}" }
      expect(response).to have_http_status(:created)

      # 2. Uncheck the same task
      post "/api/v1/actions", params: {
        action_type: 'task_uncheck',
        gid: catch_the_bus_gid,
        metadata: { step: 4, task_index: 99 }
      }, headers: { "Authorization" => "Bearer #{JwtService.encode({user_id: alice_id})}" }
      expect(response).to have_http_status(:created)

      # 3. Verify both actions are in history
      get "/api/v1/actions/user/#{alice_id}"
      actions = JSON.parse(response.body)
      task_actions = actions.select { |a| a["gid"] == catch_the_bus_gid && a["metadata"]["task_index"].to_i == 99 }
      expect(task_actions.map { |a| a["action_type"] }).to include("task_check", "task_uncheck")
      # Latest should be uncheck
      expect(task_actions.first["action_type"]).to eq("task_uncheck")
    end

    it "logs starting of scratch games" do
      post "/api/v1/actions", params: {
        action_type: 'scratch_start',
        gid: catch_the_bus_gid,
        metadata: { step: 0, scratch_id: '724160134' }
      }, headers: { "Authorization" => "Bearer #{JwtService.encode({user_id: alice_id})}" }
      expect(response).to have_http_status(:created)

      get "/api/v1/actions/user/#{alice_id}"
      actions = JSON.parse(response.body)
      expect(actions.any? { |a| a["action_type"] == "scratch_start" }).to be true
    end

    it "logs step views" do
      post "/api/v1/actions", params: {
        action_type: 'step_view',
        gid: catch_the_bus_gid,
        metadata: { step: 5 }
      }, headers: { "Authorization" => "Bearer #{JwtService.encode({user_id: alice_id})}" }
      expect(response).to have_http_status(:created)

      get "/api/v1/actions/user/#{alice_id}"
      actions = JSON.parse(response.body)
      expect(actions.any? { |a| a["action_type"] == "step_view" && a["metadata"]["step"].to_i == 5 }).to be true
    end
  end
end
