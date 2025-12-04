class Admin::SessionsController < ApplicationController
  layout "admin"
  before_action :redirect_if_logged_in, only: [:new, :create]

  def new
    # Render login form
  end

  def create
    user = User.find_by(email: params[:email])
    
    if user&.authenticate(params[:password]) && user.role == "admin"
      session[:user_id] = user.id
      redirect_to admin_dashboard_path, notice: "Welcome back, #{user.email}!"
    else
      flash.now[:alert] = "Invalid email or password, or you don't have admin access."
      render :new, status: :unprocessable_entity
    end
  end

  def destroy
    session[:user_id] = nil
    redirect_to admin_login_path, notice: "You have been logged out."
  end

  private

  def redirect_if_logged_in
    if logged_in? && current_user.role == "admin"
      redirect_to admin_dashboard_path, notice: "You are already logged in."
    end
  end
end
