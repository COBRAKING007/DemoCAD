class Admin::DesignsController < ApplicationController
  layout "admin"
  before_action :authenticate_admin!
  before_action :authenticate_admin!

  def index
    @designs = Design.includes(:material).order(created_at: :desc)
  end

  def new
    @design = Design.new
    @requirements = Requirement.all
  end

  def create
    @design = Design.new(design_params)
    
    if @design.save
      respond_to do |format|
        format.html { redirect_to admin_dashboard_path(tab: 'designs'), notice: "Design was successfully uploaded." }
        format.turbo_stream { flash.now[:notice] = "Design was successfully uploaded." }
      end
    else
      @requirements = Requirement.all
      render :new, status: :unprocessable_entity
    end
  end

  def destroy
    @design = Design.find(params[:id])
    @design.destroy
    respond_to do |format|
      format.html { redirect_to admin_dashboard_path(tab: 'designs'), notice: "Design was successfully deleted." }
      format.turbo_stream { flash.now[:notice] = "Design was successfully deleted." }
    end
  end

  private

  def design_params
    params.require(:design).permit(:material_id, :file, specifications: {})
  end
end
