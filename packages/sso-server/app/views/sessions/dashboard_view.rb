module Views
  module Sessions
    class DashboardView < Views::Base
      def initialize(present_users:, latest_actions:, return_to: "/")
        @present_users = present_users
        @latest_actions = latest_actions
        @return_to = return_to
      end

      def view_template
        div(class: "sso-container dashboard") do
          h1 { "Makerspace Dashboard" }
          p { "Wer ist gerade da und woran wird gearbeitet?" }

          div(class: "room-stats") do
            @present_users.group_by(&:room).each do |room, presences|
              section(class: "room-section") do
                h2 { room&.name || "Kein Raum" }
                div(class: "user-list") do
                  presences.each do |presence|
                    user = UserLoader.find_user(presence.user_id)
                    action = @latest_actions[presence.user_id]

                    form(action: "/sessions/create", method: "post", class: "user-card-form") do
                      input(type: "hidden", name: "authenticity_token", value: form_authenticity_token)
                      input(type: "hidden", name: "user_id", value: presence.user_id)
                      input(type: "hidden", name: "return_to", value: @return_to)

                      button(type: "submit", class: "user-card") do
                        div(class: "user-info") do
                          if user["avatar"]
                            img(src: user["avatar"], class: "avatar-small")
                          end
                          span(class: "user-name") { user["name"] }
                        end

                        div(class: "user-activity") do
                          if action
                            span(class: "action-type") { format_action(action["action_type"]) }
                            span(class: "action-gid") { action["gid"] }
                            span(class: "action-time") { "vor #{time_ago_in_words(action["timestamp"])}" }
                          else
                            span(class: "no-activity") { "Keine Aktivität heute" }
                          end
                        end
                      end
                    end
                  end
                end
              end
            end
          end

          a(href: root_path(return_to: @return_to), class: "back-link") { "Zurück zum Login" }
        end

        style do
          <<-CSS.html_safe
            .dashboard {
              max-width: 1000px;
            }
            .room-section {
              margin-bottom: 40px;
              text-align: left;
            }
            .user-list {
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
              gap: 20px;
              margin-top: 20px;
            }
            .user-card-form {
              display: block;
              border: none;
              padding: 0;
              background: none;
            }
            .user-card {
              width: 100%;
              text-align: left;
              background: white;
              border: 1px solid #eee;
              border-radius: 8px;
              padding: 15px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.05);
              cursor: pointer;
              transition: transform 0.2s, box-shadow 0.2s;
              display: block;
            }
            .user-card:hover {
              transform: scale(1.02);
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            .user-info {
              display: flex;
              align-items: center;
              gap: 10px;
              margin-bottom: 10px;
              border-bottom: 1px solid #f5f5f5;
              padding-bottom: 10px;
            }
            .avatar-small {
              width: 32px;
              height: 32px;
              border-radius: 50%;
            }
            .user-name {
              font-weight: bold;
            }
            .user-activity {
              font-size: 0.9rem;
              color: #666;
              display: flex;
              flex-direction: column;
              gap: 4px;
            }
            .action-type {
              color: #4caf50;
              font-weight: bold;
            }
            .action-time {
              font-size: 0.8rem;
              color: #999;
            }
            .no-activity {
              font-style: italic;
              color: #bbb;
            }
          CSS
        end
      end

      private

      def format_action(type)
        case type
        when "project_open" then "Öffnet Projekt"
        when "step_view" then "Liest Schritt"
        when "step_complete" then "Schritt abgeschlossen"
        when "task_check" then "Aufgabe erledigt"
        when "quiz_attempt" then "Quiz-Versuch"
        when "quiz_success" then "Quiz gelöst"
        else type
        end
      end

      def time_ago_in_words(timestamp)
        # Simple implementation
        seconds = (Time.current - Time.parse(timestamp)).to_i
        case seconds
        when 0..60 then "#{seconds}s"
        when 61..3600 then "#{seconds/60}m"
        else "#{seconds/3600}h"
        end
      end
    end
  end
end
