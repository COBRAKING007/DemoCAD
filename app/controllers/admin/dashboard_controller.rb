class Admin::DashboardController < ApplicationController
  layout "admin"
  before_action :authenticate_admin!

  def index
    # Dashboard with tabs - materials tab will be loaded by default
    @materials = Material.all.order(created_at: :desc)
    @requirements = Requirement.all.order(created_at: :desc)
    @designs = Design.includes(:material).order(created_at: :desc)
  end
end
