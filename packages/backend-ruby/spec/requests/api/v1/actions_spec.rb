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
      Action.create!(user_id: "user1", action_type: "login", timestamp: Time.current)
      Action.create!(user_id: "user2", action_type: "logout", timestamp: Time.current)

      get "/api/v1/actions/latest", params: { user_ids: ["user1", "user2"] }
      expect(response).to have_http_status(:ok)

      json = JSON.parse(response.body)
      expect(json).to have_key("user1")
      expect(json).to have_key("user2")
      expect(json["user1"]["action_type"]).to eq("login")
    end
  end
end
