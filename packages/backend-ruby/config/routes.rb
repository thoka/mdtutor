Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      resources :actions, only: [:create] do
        collection do
          get :latest
          get "user/:user_id", to: "actions#user_history"
        end
      end

      get "auth/me", to: "sessions#show"
    end
  end
end
