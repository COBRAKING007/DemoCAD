class Admin::RequirementsController < ApplicationController
  layout "admin"
  before_action :authenticate_admin!
  before_action :authenticate_admin!
  before_action :set_requirement, only: [:edit, :update, :destroy]

  def index
    @requirements = Requirement.all.order(created_at: :desc)
  end

  def new
    @requirement = Requirement.new
  end

  def create
    @requirement = Requirement.new(requirement_params)
    
    if @requirement.save
      respond_to do |format|
        format.html { redirect_to admin_dashboard_path(tab: 'requirements'), notice: "Requirement was successfully created." }
        format.turbo_stream { flash.now[:notice] = "Requirement was successfully created." }
      end
    else
      render :new, status: :unprocessable_entity
    end
  end

  def edit
  end

  def update
    if @requirement.update(requirement_params)
      respond_to do |format|
        format.html { redirect_to admin_dashboard_path(tab: 'requirements'), notice: "Requirement was successfully updated." }
        format.turbo_stream { flash.now[:notice] = "Requirement was successfully updated." }
      end
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @requirement.destroy
    respond_to do |format|
      format.html { redirect_to admin_dashboard_path(tab: 'requirements'), notice: "Requirement was successfully deleted." }
      format.turbo_stream { flash.now[:notice] = "Requirement was successfully deleted." }
    end
  end

  private

  def set_requirement
    @requirement = Requirement.find(params[:id])
  end

  def requirement_params
    params.require(:requirement).permit(:name, :options_csv)
  end
end
