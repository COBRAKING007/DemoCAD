class ChangeDesignsStructure < ActiveRecord::Migration[8.1]
  def change
    remove_reference :designs, :requirement, foreign_key: true, index: false
    add_column :designs, :specifications, :jsonb, default: {}, null: false
    
    # Remove old index and add new one
    remove_index :designs, column: [:material_id, :requirement_id], unique: true if index_exists?(:designs, [:material_id, :requirement_id])
    
    # material_id index already exists from the original create_table
  end
end
