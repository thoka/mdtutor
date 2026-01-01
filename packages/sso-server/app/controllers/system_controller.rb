class SystemController < ApplicationController
  def stats
    render json: {
      status: "ok",
      rails_env: Rails.env,
      config: {
        users_loaded: UserLoader.all_users.keys
      },
      stats: {
        presences_active: Presence.where(is_present: true).count,
        visits_total: Visit.count
      },
      timestamp: Time.current
    }
  end
end
