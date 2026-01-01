module Views
  module Layouts
    class ApplicationLayout < Views::Base
      include Phlex::Rails::Layout

      def view_template(&block)
        doctype

        html do
          head do
            title { "SSO Server" }
            meta(name: "viewport", content: "width=device-width,initial-scale=1")
            csp_meta_tag
            csrf_meta_tags
            stylesheet_link_tag "application"
          end

          body do
            main(&block)
          end
        end
      end
    end
  end
end

