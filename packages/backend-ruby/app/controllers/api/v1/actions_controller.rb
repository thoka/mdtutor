module Api
  module V1
    class ActionsController < ApplicationController
      before_action :authenticate_user!, except: [:latest, :user_history]

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

      def latest
        user_ids = params[:user_ids] || []
        
        # Get the latest action for each user
        latest_actions = Action.where(user_id: user_ids)
                               .order(timestamp: :desc)
                               .group_by(&:user_id)
                               .transform_values(&:first)

        render json: latest_actions
      end

      def user_history
        user_id = params[:user_id]
        actions = Action.where(user_id: user_id).order(timestamp: :desc).limit(50)
        render json: actions
      end
    end
  end
end
