module Components
  class UserTile < Components::Base
    def initialize(id, user, type:, return_to:)
      @id = id
      @user = user
      @type = type
      @return_to = return_to
    end

    def view_template
      form(action: "/sessions/create", method: "post") do
        # Rails CSRF protection
        input(type: "hidden", name: "authenticity_token", value: helpers.form_authenticity_token)
        input(type: "hidden", name: "user_id", value: @id)
        input(type: "hidden", name: "return_to", value: @return_to)

        button(class: "tile #{@type}-tile", type: "submit") do
          span(class: "avatar") { @user["avatar"] }
          span(class: "name") { @user["name"] }
        end
      end
    end
  end
end
