module Views
  module Sessions
    class PinView < Views::Base
      def initialize(user_id:, user:, return_to:, error: nil)
        @user_id = user_id
        @user = user
        @return_to = return_to
        @error = error
      end

      def view_template
        div(class: "sso-container") do
          h1 { "PIN erforderlich" }
          
          div(class: "user-context") do
            div(class: "avatar") { img(src: @user["avatar"], class: "avatar-img") if @user["avatar"] }
            h2 { @user["name"] }
          end

          form(action: "/sessions/verify_pin", method: "post", class: "pin-form") do
            input(type: "hidden", name: "authenticity_token", value: helpers.form_authenticity_token)
            input(type: "hidden", name: "user_id", value: @user_id)
            input(type: "hidden", name: "return_to", value: @return_to)
            
            div(class: "input-group") do
              label(for: "pin") { "Gib deine 4-stellige PIN ein:" }
              input(
                type: "password", 
                name: "pin", 
                id: "pin", 
                maxlength: "4", 
                pattern: "[0-9]*", 
                inputmode: "numeric",
                autofocus: true,
                class: "pin-input"
              )
            end

            if @error
              p(class: "error-message") { @error }
            end

            button(type: "submit", class: "submit-button") { "Anmelden" }
            a(href: root_path(return_to: @return_to), class: "back-link") { "Zurück zur Übersicht" }
          end
        end

        style do
          <<-CSS.html_safe
            .user-context {
              margin-bottom: 30px;
            }
            .pin-form {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 20px;
            }
            .pin-input {
              font-size: 2rem;
              width: 150px;
              text-align: center;
              letter-spacing: 10px;
              padding: 10px;
              border: 2px solid #ddd;
              border-radius: 8px;
            }
            .submit-button {
              padding: 12px 30px;
              background: #4caf50;
              color: white;
              border: none;
              border-radius: 6px;
              font-weight: bold;
              cursor: pointer;
            }
            .error-message {
              color: #f44336;
              font-weight: bold;
            }
            .back-link {
              margin-top: 20px;
              color: #666;
              text-decoration: none;
            }
          CSS
        end
      end
    end
  end
end

