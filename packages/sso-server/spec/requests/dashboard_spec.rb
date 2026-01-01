require "rails_helper"

RSpec.describe "Dashboard", type: :request do
  describe "GET /dashboard" do
    it "renders the dashboard successfully" do
      get "/dashboard"
      expect(response).to have_http_status(:ok)
      expect(response.body).to include("Makerspace Dashboard")
    end
  end
end
