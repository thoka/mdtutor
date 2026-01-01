Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      resources :actions, only: [:create]
      
      get "auth/me", to: "sessions#show"
    end
  end
end
