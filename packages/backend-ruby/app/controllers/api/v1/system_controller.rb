module Api
  module V1
    class SystemController < ApplicationController
      # No authentication required for public health/stats check
      def stats
        db_count = Action.count
        user_stats = Action.group(:user_id).count

        # Get project stats for Alice specifically to help E2E
        alice_projects = Action.where(user_id: 'student_a')
                               .pluck(:gid).uniq

        render json: {
          status: "ok",
          rails_env: Rails.env,
          counts: {
            actions: db_count,
            users: user_stats.keys.size
          },
          user_stats: user_stats,
          alice_projects: alice_projects,
          timestamp: Time.current
        }
      end
    end
  end
end
