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
    end
  end
end
