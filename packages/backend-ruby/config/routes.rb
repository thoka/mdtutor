Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      resources :actions, only: [:create]

      post 'auth/login', to: 'sessions#create'
      delete 'auth/logout', to: 'sessions#destroy'
      get 'auth/me', to: 'sessions#show'
    end
  end
end
