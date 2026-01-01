Rails.application.routes.draw do
  root "sessions#index"
  post "sessions/create", to: "sessions#create"
end
