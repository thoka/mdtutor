module Api
  module V1
    class ActionsController < ApplicationController
      def create
        if params[:user_id].present? && params[:action_type].present?
          TrackActionService.call(
            user_id: params[:user_id],
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
