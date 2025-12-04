class Admin::MaterialsController < ApplicationController
  layout "admin"
  before_action :authenticate_admin!
  before_action :authenticate_admin!
  before_action :set_material, only: [:edit, :update, :destroy]

  def index
    @materials = Material.all.order(created_at: :desc)
  end

  def new
    @material = Material.new
  end

  def create
    @material = Material.new(material_params)
    
    if @material.save
      respond_to do |format|
        format.html { redirect_to admin_materials_path, notice: "Material was successfully created." }
        format.turbo_stream { flash.now[:notice] = "Material was successfully created." }
      end
    else
      render :new, status: :unprocessable_entity
    end
  end

  def edit
  end

  def update
    if @material.update(material_params)
      respond_to do |format|
        format.html { redirect_to admin_materials_path, notice: "Material was successfully updated." }
        format.turbo_stream { flash.now[:notice] = "Material was successfully updated." }
      end
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @material.destroy
    respond_to do |format|
      format.html { redirect_to admin_materials_path, notice: "Material was successfully deleted." }
      format.turbo_stream { flash.now[:notice] = "Material was successfully deleted." }
    end
  end

  private

  def set_material
    @material = Material.find(params[:id])
  end

  def material_params
    params.require(:material).permit(:name, :image)
  end
end
