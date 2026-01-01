module Views
  module Sessions
    class IndexView < Views::Base
      def initialize(admins:, users:, return_to:, super_mode: false, presences: {})
        @admins = admins
        @users = users
        @return_to = return_to
        @super_mode = super_mode
        @presences = presences
      end

      def view_template
        div(class: "sso-container") do
          h1 { "Wer bist du?" }

          section(class: "user-group") do
            h2 { "Mentoren & Admins" }
            div(class: "tiles") do
              @admins.each do |id, user|
                presence = @presences[id]
                render Components::UserTile.new(
                  id, 
                  user, 
                  type: :admin, 
                  return_to: @return_to,
                  is_present: presence&.is_present || false,
                  room_name: presence&.room&.name,
                  can_toggle: @super_mode
                )
              end
            end
          end

          section(class: "user-group") do
            h2 { "Schüler & Gäste" }
            div(class: "tiles") do
              @users.each do |id, user|
                presence = @presences[id]
                render Components::UserTile.new(
                  id, 
                  user, 
                  type: :user, 
                  return_to: @return_to,
                  is_present: presence&.is_present || false,
                  room_name: presence&.room&.name,
                  can_toggle: @super_mode
                )
              end
            end
          end

          section(class: "logout-section") do
            separator = @return_to.include?("?") ? "&" : "?"
            a(href: "#{@return_to}#{separator}token=logout", class: "logout-button") { "Abmelden / Logout" }
            a(href: "/dashboard", class: "dashboard-link") { "Makerspace Dashboard" }
          end

          if @super_mode
            div(class: "super-mode-footer") do
              span { "⚡ Super-Mode Aktiv" }
              form(action: "/sessions/super_logout", method: "post", style: "display: inline;") do
                input(type: "hidden", name: "authenticity_token", value: helpers.form_authenticity_token)
                input(type: "hidden", name: "return_to", value: @return_to)
                button(class: "super-logout-link") { "(Beenden)" }
              end
            end
          end
        end

        style do
          <<-CSS.html_safe
            .sso-container {
              max-width: 800px;
              margin: 40px auto;
              text-align: center;
              font-family: sans-serif;
            }

            .super-mode-footer {
              margin-top: 40px;
              padding: 15px;
              font-size: 0.8rem;
              color: #888;
              border-top: 1px dashed #eee;
            }

            .super-logout-link {
              background: none;
              border: none;
              color: #e91e63;
              text-decoration: underline;
              cursor: pointer;
              font-size: 0.8rem;
              margin-left: 5px;
            }

            .logout-section {
              margin-top: 60px;
              border-top: 1px solid #eee;
              padding-top: 20px;
            }

            .logout-button {
              display: inline-block;
              padding: 10px 20px;
              background: #f44336;
              color: white;
              text-decoration: none;
              border-radius: 6px;
              font-weight: bold;
              transition: background 0.2s;
            }

            .logout-button:hover {
              background: #d32f2f;
            }

            .dashboard-link {
              display: inline-block;
              margin-left: 20px;
              color: #2196f3;
              text-decoration: none;
              font-weight: bold;
            }

            .user-group {
              margin-bottom: 40px;
            }

            .tiles {
              display: flex;
              flex-wrap: wrap;
              justify-content: center;
              gap: 20px;
            }

            .tile {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              width: 150px;
              height: 150px;
              border: 2px solid #eee;
              border-radius: 12px;
              background: white;
              cursor: pointer;
              transition: transform 0.2s, box-shadow 0.2s;
              padding: 10px;
            }

            .tile:hover {
              transform: translateY(-5px);
              box-shadow: 0 8px 24px rgba(0,0,0,0.1);
            }

            .tile-container {
              position: relative;
            }

            .presence-toggle {
              position: absolute;
              top: 10px;
              right: 10px;
              z-index: 10;
            }

            .presence-indicator {
              position: absolute;
              top: 10px;
              right: 10px;
              width: 12px;
              height: 12px;
              background: #4caf50;
              border-radius: 50%;
              border: 2px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
              z-index: 10;
            }

            .history-link {
              position: absolute;
              bottom: 10px;
              right: 10px;
              text-decoration: none;
              font-size: 1.2rem;
              opacity: 0.3;
              transition: opacity 0.2s;
              z-index: 10;
            }

            .history-link:hover {
              opacity: 1;
            }

            .admin-tile {
              border-color: #e91e63;
            }

            .user-tile {
              border-color: #4caf50;
            }

            .avatar {
              font-size: 3rem;
              margin-bottom: 10px;
              width: 80px;
              height: 80px;
              display: flex;
              align-items: center;
              justify-content: center;
            }

            .avatar-img {
              max-width: 100%;
              max-height: 100%;
              object-fit: contain;
            }

            .name {
              font-weight: bold;
              color: #333;
            }
          CSS
        end
      end
    end
  end
end
