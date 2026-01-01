require 'rails_helper'

RSpec.describe "Api::V1::Sessions", type: :request do
  describe "POST /api/v1/auth/login" do
    it "logs in a normal user and sets session" do
      post "/api/v1/auth/login", params: { user_id: 'toka' }
      expect(response).to have_http_status(:ok)
      expect(session[:user_id]).to eq('toka')
      expect(JSON.parse(response.body)['user']['id']).to eq('toka')
    end

    it "logs in an admin with correct password" do
      post "/api/v1/auth/login", params: { user_id: 'admin', password: 'password123' }
      expect(response).to have_http_status(:ok)
      expect(session[:user_id]).to eq('admin')
      expect(session[:is_admin]).to be true
    end

    it "fails to log in an admin with wrong password" do
      post "/api/v1/auth/login", params: { user_id: 'admin', password: 'wrong' }
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "DELETE /api/v1/auth/logout" do
    it "clears the session" do
      post "/api/v1/auth/login", params: { user_id: 'toka' }
      delete "/api/v1/auth/logout"
      expect(response).to have_http_status(:ok)
      expect(session[:user_id]).to be_nil
    end
  end

  describe "GET /api/v1/auth/me" do
    it "returns current user if logged in" do
      post "/api/v1/auth/login", params: { user_id: 'toka' }
      get "/api/v1/auth/me"
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)['user']['id']).to eq('toka')
    end

    it "returns 401 if not logged in" do
      get "/api/v1/auth/me"
      expect(response).to have_http_status(:unauthorized)
    end
  end
end
