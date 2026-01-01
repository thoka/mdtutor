module Api
  module V1
    class ActionsController < ApplicationController
      before_action :authenticate_user!

      def create
        if params[:action_type].present?
          TrackActionService.call(
            user_id: current_user[:user_id],
            action: params[:action_type],
            gid: params[:gid],
            metadata: params[:metadata]&.to_unsafe_h || {}
          )
          render json: { status: "ok" }, status: :created
        else
          render json: { error: "Missing parameters" }, status: :unprocessable_entity
        end
      end
    end
  end
end
