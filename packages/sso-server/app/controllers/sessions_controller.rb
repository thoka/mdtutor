class SessionsController < ApplicationController
  layout Views::Layouts::ApplicationLayout

  def index
    render Views::Sessions::IndexView.new(
      admins: UserLoader.admins,
      users: UserLoader.users,
      return_to: params[:return_to] || "/",
      super_mode: session[:admin_id].present?
    )
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

  private

  def finalize_login(user_id, user, return_to)
    is_admin = UserLoader.admin?(user_id)
    token = JwtService.encode(
      user_id: user_id,
      name: user["name"],
      admin: is_admin,
      avatar: user["avatar"]
    )

    separator = return_to.include?("?") ? "&" : "?"
    redirect_to "#{return_to}#{separator}token=#{token}", allow_other_host: true
  end
end
