module Views
  module Sessions
    class IndexView < Views::Base
      def initialize(admins:, users:, return_to:)
        @admins = admins
        @users = users
        @return_to = return_to
      end

      def view_template
        div(class: "sso-container") do
          h1 { "Wer bist du?" }

          section(class: "user-group") do
            h2 { "Mentoren & Admins" }
            div(class: "tiles") do
              @admins.each do |id, user|
                render Components::UserTile.new(id, user, type: :admin, return_to: @return_to)
              end
            end
          end

          section(class: "user-group") do
            h2 { "Schüler & Gäste" }
            div(class: "tiles") do
              @users.each do |id, user|
                render Components::UserTile.new(id, user, type: :user, return_to: @return_to)
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

            .admin-tile {
              border-color: #e91e63;
            }

            .user-tile {
              border-color: #4caf50;
            }

            .avatar {
              font-size: 3rem;
              margin-bottom: 10px;
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

