module Api
  module V1
    class SessionsController < ApplicationController
      def show
        token = request.headers["Authorization"]&.split(" ")&.last
        user = JwtService.decode(token) if token

        if user
          render json: { user: { id: user[:user_id], name: user[:name], is_admin: user[:admin] } }
        else
          render json: { error: "Not logged in" }, status: :unauthorized
        end
      end
    end
  end
end
