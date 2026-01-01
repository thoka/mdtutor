class TrackActionService
  LOG_FILE = Rails.root.join("log", "actions.jsonl")

  def self.call(user_id:, action:, gid: nil, metadata: {})
    timestamp = Time.current.iso8601

    payload = {
      user_id: user_id,
      action: action,
      gid: gid,
      metadata: metadata,
      timestamp: timestamp
    }

    # 1. Write to JSONL (Master Log)
    File.open(LOG_FILE, "a") do |f|
      f.puts(payload.to_json)
    end

    # 2. Write to DB (Query Index)
    Action.create!(
      user_id: user_id,
      action_type: action,
      gid: gid,
      metadata: metadata,
      timestamp: timestamp
    )
  end
end
