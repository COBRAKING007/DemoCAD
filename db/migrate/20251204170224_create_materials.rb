class CreateMaterials < ActiveRecord::Migration[8.1]
  def change
    create_table :materials do |t|
      t.string :name, null: false

      t.timestamps
    end
    add_index :materials, :name
  end
end
