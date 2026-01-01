class UserLoader
  def self.load_config
    YAML.load_file(Rails.root.join("config", "users.yaml"))
  end

  def self.admins
    load_config["admins"] || {}
  end

  def self.users
    load_config["users"] || {}
  end

  def self.find_user(id)
    admins[id] || users[id]
  end

  def self.admin?(id)
    admins.key?(id)
  end
end

