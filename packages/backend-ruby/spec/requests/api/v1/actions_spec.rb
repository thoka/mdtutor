require 'rails_helper'

RSpec.describe "Api::V1::Actions", type: :request do
  describe "POST /api/v1/actions" do
    let(:valid_params) do
      {
        user_id: 'user123',
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

      post "/api/v1/actions", params: valid_params
      expect(response).to have_http_status(:created)
      expect(JSON.parse(response.body)).to eq({ "status" => "ok" })
    end

    it "returns error if parameters are missing" do
      post "/api/v1/actions", params: { user_id: '123' }
      expect(response).to have_http_status(:unprocessable_entity)
    end
  end
end
