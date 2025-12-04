class HomeController < ApplicationController
  def index
    @materials = Material.all.order(created_at: :desc)
  end

  def select_requirements
    @material = Material.find(params[:id])
    @requirements = Requirement.all
  end

  def show_design
    @material = Material.find(params[:id])
    
    # Construct specifications from params
    # Expected params: specifications: { "Color" => "Red", "Finish" => "Matte" }
    @specifications = params[:specifications] || {}
    
    # Find the design matching material and specifications
    # We need to query where the JSONB column contains the specifications
    # For exact match of keys and values, we can use the @> operator in Postgres, 
    # but we also want to ensure no extra keys are in the DB if we want strict equality.
    # However, for this use case, finding a design that *contains* the selected specs is likely what we want,
    # or strictly matches. Given our unique index is on (material_id, specifications), we should look for exact match.
    
    @design = Design.find_by(material: @material, specifications: @specifications)
  end
end
