module Views
  module Sessions
    class UserHistoryView < Views::Base
      def initialize(user_id:, user:, visits:, actions:)
        @user_id = user_id
        @user = user
        @visits = visits
        @actions = actions
      end

      def view_template
        div(class: "sso-container dashboard") do
          h1 { "Benutzer-Historie: #{@user['name']}" }

          div(class: "history-grid") do
            section(class: "history-section") do
              h2 { "Besuche im Makerspace" }
              div(class: "history-list") do
                @visits.each do |visit|
                  div(class: "history-item") do
                    span(class: "history-date") { visit.started_at.strftime("%d.%m.%Y") }
                    span(class: "history-room") { visit.room.name }
                    span(class: "history-time") {
                      time_range = "#{visit.started_at.strftime("%H:%M")} - "
                      time_range += visit.ended_at ? visit.ended_at.strftime("%H:%M") : "Aktiv"
                      time_range
                    }
                  end
                end
              end
            end

            section(class: "history-section") do
              h2 { "Letzte Achievements" }
              div(class: "history-list") do
                @actions.each do |action|
                  div(class: "history-item") do
                    span(class: "history-date") { Time.parse(action["timestamp"]).strftime("%d.%m.%Y %H:%M") }
                    span(class: "history-action") { format_action(action["action_type"]) }
                    span(class: "history-gid") { action["gid"] }
                  end
                end
              end
            end
          end

          a(href: root_path, class: "back-link") { "Zurück zum Login" }
        end

        style do
          <<-CSS.html_safe
            .history-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 40px;
              margin-top: 30px;
              text-align: left;
            }
            .history-section {
              background: white;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            }
            .history-list {
              display: flex;
              flex-direction: column;
              gap: 10px;
              margin-top: 15px;
            }
            .history-item {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid #f0f0f0;
              font-size: 0.9rem;
            }
            .history-date {
              font-weight: bold;
              min-width: 100px;
            }
            .history-action {
              color: #4caf50;
              font-weight: bold;
            }
            .history-time {
              color: #666;
            }
            .history-gid {
              color: #999;
              font-size: 0.8rem;
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
    end
  end
end
