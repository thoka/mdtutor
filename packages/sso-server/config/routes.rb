Rails.application.routes.draw do
  root "sessions#index"
  post "sessions/create", to: "sessions#create"
  post "sessions/verify_pin", to: "sessions#verify_pin"
  post "sessions/super_login", to: "sessions#super_login"
  post "sessions/super_logout", to: "sessions#super_logout"
  post "sessions/toggle_presence", to: "sessions#toggle_presence"
  get "dashboard", to: "sessions#dashboard"
  get "users/:user_id", to: "sessions#user_history"
  get "api/system/stats", to: "system#stats"
end
