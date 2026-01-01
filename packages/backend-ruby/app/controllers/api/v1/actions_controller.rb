module Api
  module V1
    class ActionsController < ApplicationController
      before_action :authenticate_user!, except: [:latest, :user_history, :user_state]

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
                               .order(timestamp: :desc, created_at: :desc)
                               .group_by(&:user_id)
                               .transform_values(&:first)

        render json: latest_actions
      end

      def user_history
        user_id = params[:user_id]
        # Remove limit to ensure we get enough history for progress calculation if needed
        actions = Action.where(user_id: user_id).order(timestamp: :desc, created_at: :desc)
        render json: actions
      end

      def user_state
        user_id = params[:user_id]
        actions = Action.where(user_id: user_id).order(timestamp: :asc)

        state = {
          user_id: user_id,
          projects: {}
        }

        actions.each do |action|
          gid = action.gid
          next unless gid.present?

          state[:projects][gid] ||= {
            tasks: {}, # "step_index" => boolean
            quizzes: [], # array of step indices
            last_step: 0,
            last_timestamp: nil
          }

          project_state = state[:projects][gid]
          meta = action.metadata || {}
          step = meta['step'].to_i if meta['step'].present?

          case action.action_type
          when 'task_check'
            task_idx = meta['task_index']
            project_state[:tasks]["#{step}_#{task_idx}"] = true if step && task_idx
          when 'task_uncheck'
            task_idx = meta['task_index']
            project_state[:tasks]["#{step}_#{task_idx}"] = false if step && task_idx
          when 'quiz_success'
            project_state[:quizzes] << step if step && !project_state[:quizzes].include?(step)
          when 'step_view'
            if step
              project_state[:last_step] = step
              project_state[:last_timestamp] = action.timestamp
            end
          end
        end

        render json: state
      end
    end
  end
end
