class SessionsController < ApplicationController
  layout Views::Layouts::ApplicationLayout

  def index
    @presences = Presence.includes(:room).all.index_by(&:user_id)

    render Views::Sessions::IndexView.new(
      admins: UserLoader.admins,
      users: UserLoader.users,
      return_to: params[:return_to] || "/",
      super_mode: session[:admin_id].present?,
      presences: @presences
    )
  end

  def toggle_presence
    return render json: { error: "Admin session required" }, status: :unauthorized unless session[:admin_id]

    user_id = params[:user_id]
    room_id = params[:room_id]
    is_present = Presence.toggle(user_id, room_id: room_id)

    # We could redirect back or return JSON for an AJAX request
    # For now, a simple redirect back to the index
    redirect_to root_path(return_to: params[:return_to])
  end

  def create
    user_id = params[:user_id]
    return_to = params[:return_to]
    user = UserLoader.find_user(user_id)

    if user
      if session[:admin_id].present?
        # Super-mode active: Direct login
        finalize_login(user_id, user, return_to)
      elsif UserLoader.admin?(user_id)
        # Admin tile clicked: Ask for password
        render Views::Sessions::SuperLoginView.new(user_id: user_id, user: user, return_to: return_to)
      else
        # Normal user: Ask for PIN
        render Views::Sessions::PinView.new(user_id: user_id, user: user, return_to: return_to)
      end
    else
      redirect_to root_path(return_to: return_to), alert: "User not found"
    end
  end

  def verify_pin
    user_id = params[:user_id]
    pin = params[:pin]
    return_to = params[:return_to]
    user = UserLoader.find_user(user_id)

    if UserLoader.verify_pin(user_id, pin)
      finalize_login(user_id, user, return_to)
    else
      render Views::Sessions::PinView.new(
        user_id: user_id,
        user: user,
        return_to: return_to,
        error: "Falsche PIN"
      )
    end
  end

  def super_login
    user_id = params[:user_id]
    password = params[:password]
    return_to = params[:return_to]
    user = UserLoader.find_user(user_id)

    if UserLoader.verify_admin_password(user_id, password)
      session[:admin_id] = user_id
      redirect_to root_path(return_to: return_to), notice: "Super-Mode aktiviert"
    else
      render Views::Sessions::SuperLoginView.new(
        user_id: user_id,
        user: user,
        return_to: return_to,
        error: "Falsches Passwort"
      )
    end
  end

  def super_logout
    session.delete(:admin_id)
    redirect_to root_path(return_to: params[:return_to]), notice: "Super-Mode beendet"
  end

  def dashboard
    @present_users = Presence.includes(:room).where(is_present: true)
    user_ids = @present_users.pluck(:user_id)
    @return_to = params[:return_to] || "/"

    # Fetch latest actions from achievements server
    achievements_url = "http://localhost:#{ENV.fetch('ACHIEVEMENTS_PORT', 3102)}/api/v1/actions/latest"
    begin
      response = Net::HTTP.get(URI("#{achievements_url}?#{user_ids.map { |id| "user_ids[]=#{id}" }.join('&')}"))
      @latest_actions = JSON.parse(response)
    rescue => e
      @latest_actions = {}
      Rails.logger.error "Failed to fetch actions: #{e.message}"
    end

    render Views::Sessions::DashboardView.new(
      present_users: @present_users,
      latest_actions: @latest_actions,
      return_to: @return_to
    )
  end

  def user_history
    @user_id = params[:user_id]
    @return_to = params[:return_to] || "/"
    @user = UserLoader.find_user(@user_id)
    @visits = Visit.includes(:room).where(user_id: @user_id).order(started_at: :desc)

    # Fetch actions from achievements server
    achievements_url = "http://localhost:#{ENV.fetch('ACHIEVEMENTS_PORT', 3102)}/api/v1/actions/user/#{@user_id}"
    begin
      response = Net::HTTP.get(URI(achievements_url))
      @actions = JSON.parse(response)
    rescue => e
      @actions = []
      Rails.logger.error "Failed to fetch user actions: #{e.message}"
    end

    render Views::Sessions::UserHistoryView.new(
      user_id: @user_id,
      user: @user,
      visits: @visits,
      actions: @actions,
      return_to: @return_to
    )
  end

  private

  def finalize_login(user_id, user, return_to)
    is_admin = UserLoader.admin?(user_id)
    token = JwtService.encode(
      user_id: user_id,
      name: user["name"],
      admin: is_admin,
      avatar: user["avatar"],
      is_present: Presence.present?(user_id)
    )

    separator = return_to.include?("?") ? "&" : "?"
    redirect_to "#{return_to}#{separator}token=#{token}", allow_other_host: true
  end
end
