class CreateDesigns < ActiveRecord::Migration[8.1]
  def change
    create_table :designs do |t|
      t.references :material, null: false, foreign_key: true
      t.references :requirement, null: false, foreign_key: true

      t.timestamps
    end
    add_index :designs, [:material_id, :requirement_id], unique: true
  end
end
