require "rails_helper"

RSpec.describe "Dashboard", type: :request do
  describe "GET /dashboard" do
    let!(:room) { Room.find_or_create_by!(slug: 'main') { |r| r.name = "Test Room" } }
    let(:user_id) { "student_a" } # Use a user from users.yaml

    before do
      # Ensure student_a is present for the test
      Presence.find_or_initialize_by(user_id: user_id).tap do |p|
        p.is_present = true
        p.room = room
        p.save!
      end
    end

    it "renders the dashboard successfully" do
      get "/dashboard"
      expect(response).to have_http_status(:ok)
      expect(response.body).to include("Makerspace Dashboard")
      expect(response.body).to include("Alice") # student_a's name from YAML
    end
  end
end
