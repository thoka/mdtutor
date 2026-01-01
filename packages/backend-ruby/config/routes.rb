Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      resources :actions, only: [:create] do
        collection do
          get :latest
          get "user/:user_id", to: "actions#user_history"
          get "user/:user_id/state", to: "actions#user_state"
        end
      end

      get "auth/me", to: "sessions#show"
      get "system/stats", to: "system#stats"
    end
  end
end
