require 'rails_helper'

RSpec.describe "Api::V1::Actions", type: :request do
  let(:user_payload) { { user_id: 'user123', name: 'Test User', admin: false } }
  let(:token) { JwtService.encode(user_payload) }
  let(:headers) { { "Authorization" => "Bearer #{token}" } }

  describe "POST /api/v1/actions" do
    let(:valid_params) do
      {
        action_type: 'project_open',
        gid: 'RPL:PROJ:space-talk',
        metadata: { step: 1 }
      }
    end

    it "tracks the action and returns success" do
      expect(TrackActionService).to receive(:call).with(
        user_id: 'user123',
        action: 'project_open',
        gid: 'RPL:PROJ:space-talk',
        metadata: hash_including('step' => '1')
      )

      post "/api/v1/actions", params: valid_params, headers: headers
      expect(response).to have_http_status(:created)
      expect(JSON.parse(response.body)).to eq({ "status" => "ok" })
    end

    it "returns 401 without token" do
      post "/api/v1/actions", params: valid_params
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "GET /api/v1/actions/latest" do
    it "returns the latest actions for given user_ids" do
      create(:action, user_id: "user1", action_type: "login")
      create(:action, user_id: "user2", action_type: "logout")

      get "/api/v1/actions/latest", params: { user_ids: ["user1", "user2"] }
      expect(response).to have_http_status(:ok)

      json = JSON.parse(response.body)
      expect(json).to have_key("user1")
      expect(json).to have_key("user2")
      expect(json["user1"]["action_type"]).to eq("login")
    end
  end

  describe "GET /api/v1/actions/user/:user_id" do
    it "returns all actions for a specific user" do
      # Use a unique user ID to avoid interference from seeds
      test_user_id = "test_user_#{SecureRandom.hex(4)}"
      create(:action, user_id: test_user_id, action_type: "task_check", metadata: { step: 1, task_index: 0 })
      create(:action, user_id: test_user_id, action_type: "quiz_success", metadata: { step: 2 })

      get "/api/v1/actions/user/#{test_user_id}"
      expect(response).to have_http_status(:ok)

      json = JSON.parse(response.body)
      expect(json.size).to eq(2)
      expect(json.map { |a| a["action_type"] }).to include("task_check", "quiz_success")
    end
  end
end
