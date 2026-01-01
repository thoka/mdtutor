module Views
  module Sessions
    class SuperLoginView < Views::Base
      def initialize(user_id:, user:, return_to:, error: nil)
        @user_id = user_id
        @user = user
        @return_to = return_to
        @error = error
      end

      def view_template
        div(class: "sso-container") do
          h1 { "Admin Login" }
          p { "Logge dich ein, um den Super-Mode zu aktivieren." }
          
          div(class: "user-context") do
            div(class: "avatar") { img(src: @user["avatar"], class: "avatar-img") if @user["avatar"] }
            h2 { @user["name"] }
          end

          form(action: "/sessions/super_login", method: "post", class: "login-form") do
            input(type: "hidden", name: "authenticity_token", value: helpers.form_authenticity_token)
            input(type: "hidden", name: "user_id", value: @user_id)
            input(type: "hidden", name: "return_to", value: @return_to)
            
            div(class: "input-group") do
              label(for: "password") { "Passwort:" }
              input(
                type: "password", 
                name: "password", 
                id: "password", 
                autofocus: true,
                class: "password-input"
              )
            end

            if @error
              p(class: "error-message") { @error }
            end

            button(type: "submit", class: "submit-button admin-button") { "Super-Mode aktivieren" }
            a(href: root_path(return_to: @return_to), class: "back-link") { "Zurück" }
          end
        end

        style do
          <<-CSS.html_safe
            .password-input {
              font-size: 1.2rem;
              padding: 10px;
              border: 2px solid #ddd;
              border-radius: 8px;
              width: 250px;
            }
            .admin-button {
              background: #e91e63 !important;
            }
            .login-form {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 20px;
            }
          CSS
        end
      end
    end
  end
end

