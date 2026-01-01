class ApplicationController < ActionController::API
  include ActionController::Cookies

  def authenticate_user!
    token = request.headers["Authorization"]&.split(" ")&.last
    @current_user = JwtService.decode(token) if token
    render json: { error: "Not authorized" }, status: :unauthorized unless @current_user
  end

  def current_user
    @current_user
  end
end
