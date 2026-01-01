module Api
  module V1
    class SessionsController < ApplicationController
      ADMIN_PASSWORD = "password123"

      def create
        user_id = params[:user_id]
        password = params[:password]

        if user_id == "admin"
          if password == ADMIN_PASSWORD
            session[:user_id] = user_id
            session[:is_admin] = true
            render json: { user: { id: user_id, is_admin: true } }
          else
            render json: { error: "Invalid password" }, status: :unauthorized
          end
        elsif user_id.present?
          session[:user_id] = user_id
          session[:is_admin] = false
          render json: { user: { id: user_id, is_admin: false } }
        else
          render json: { error: "Missing user_id" }, status: :unprocessable_entity
        end
      end

      def destroy
        session[:user_id] = nil
        session[:is_admin] = nil
        render json: { status: "ok" }
      end

      def show
        if session[:user_id]
          render json: { user: { id: session[:user_id], is_admin: session[:is_admin] } }
        else
          render json: { error: "Not logged in" }, status: :unauthorized
        end
      end
    end
  end
end
