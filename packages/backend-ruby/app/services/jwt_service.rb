class JwtService
  SECRET = ENV.fetch("SSO_JWT_SECRET") { "fallback_secret_for_dev_only" }

  def self.encode(payload)
    payload[:exp] = 24.hours.from_now.to_i
    JWT.encode(payload, SECRET, "HS256")
  end

  def self.decode(token)
    body = JWT.decode(token, SECRET, true, { algorithm: "HS256" })[0]
    HashWithIndifferentAccess.new(body)
  rescue JWT::DecodeError
    nil
  end
end
