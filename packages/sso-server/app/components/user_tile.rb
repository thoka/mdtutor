module Components
  class UserTile < Components::Base
    def initialize(id, user, type:, return_to:, is_present: false, can_toggle: false, room_name: nil)
      @id = id
      @user = user
      @type = type
      @return_to = return_to
      @is_present = is_present
      @can_toggle = can_toggle
      @room_name = room_name
    end

    def view_template
      div(class: "tile-container") do
        if @can_toggle
          form(action: "/sessions/toggle_presence", method: "post", class: "presence-toggle") do
            input(type: "hidden", name: "authenticity_token", value: helpers.form_authenticity_token)
            input(type: "hidden", name: "user_id", value: @id)
            input(type: "hidden", name: "return_to", value: @return_to)
            input(
              type: "checkbox", 
              checked: @is_present, 
              onchange: "this.form.submit()",
              title: @is_present ? "Auschecken aus #{@room_name}" : "Einchecken in Hauptraum"
            )
          end
        elsif @is_present
          span(class: "presence-indicator", title: "In #{@room_name}")
        end

        form(action: "/sessions/create", method: "post") do
          # Rails CSRF protection
          input(type: "hidden", name: "authenticity_token", value: helpers.form_authenticity_token)
          input(type: "hidden", name: "user_id", value: @id)
          input(type: "hidden", name: "return_to", value: @return_to)

          button(class: "tile #{@type}-tile", type: "submit") do
            div(class: "avatar") do
              avatar_content(@user["avatar"])
            end
            span(class: "name") { @user["name"] }
          end
        end

        a(href: "/users/#{@id}", class: "history-link", title: "Verlauf ansehen") { "🕒" }
      end
    end

    private

    def avatar_content(avatar)
      if avatar&.start_with?("/") || avatar&.match?(/^https?:\/\//)
        img(src: avatar, alt: "Avatar", class: "avatar-img")
      else
        # Fallback to emoji
        span { avatar }
      end
    end
  end
end
