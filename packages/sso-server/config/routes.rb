Rails.application.routes.draw do
  root "sessions#index"
  post "sessions/create", to: "sessions#create"
  post "sessions/verify_pin", to: "sessions#verify_pin"
  post "sessions/super_login", to: "sessions#super_login"
  post "sessions/super_logout", to: "sessions#super_logout"
end
