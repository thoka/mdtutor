class TrackActionService
  LOG_FILE = Rails.root.join("log", "actions.jsonl")

  def self.call(user_id:, action:, gid: nil, metadata: {})
    payload = {
      user_id: user_id,
      action: action,
      gid: gid,
      metadata: metadata,
      timestamp: Time.current.iso8601
    }

    File.open(LOG_FILE, "a") do |f|
      f.puts(payload.to_json)
    end
  end
end
