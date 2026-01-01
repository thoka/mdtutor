class SessionsController < ApplicationController
  def index
    @admins = UserLoader.admins
    @users = UserLoader.users
    @return_to = params[:return_to] || "/"
  end

  def create
    user_id = params[:user_id]
    user = UserLoader.find_user(user_id)

    if user
      is_admin = UserLoader.admin?(user_id)
      token = JwtService.encode(
        user_id: user_id,
        name: user["name"],
        admin: is_admin
      )

      redirect_to "#{params[:return_to]}?token=#{token}", allow_other_host: true
    else
      redirect_to root_path, alert: "User not found"
    end
  end
end
