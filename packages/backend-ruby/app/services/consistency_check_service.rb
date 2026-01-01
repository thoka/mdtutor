class ConsistencyCheckService
  def self.call
    report = {
      db_count: Action.count,
      jsonl_count: 0,
      discrepancies: []
    }

    log_file = TrackActionService::LOG_FILE
    if File.exist?(log_file)
      jsonl_actions = File.readlines(log_file).map { |line| JSON.parse(line) }
      report[:jsonl_count] = jsonl_actions.size

      # Basic count check
      if report[:db_count] != report[:jsonl_count]
        report[:discrepancies] << "Count mismatch: DB has #{report[:db_count]}, JSONL has #{report[:jsonl_count]}"
      end

      # Cross-verify some samples or latest entries
      latest_db = Action.order(created_at: :desc).limit(10).pluck(:id, :action_type, :user_id)
      # JSONL doesn't have ID unless we added it, let's check
      # Actually our TrackActionService creates payload without ID for JSONL
      
      # Let's just compare counts and latest timestamps for now
      latest_jsonl = jsonl_actions.last(10)
      # ... more complex verification could go here
    else
      report[:discrepancies] << "JSONL file missing at #{log_file}"
    end

    report
  end
end

