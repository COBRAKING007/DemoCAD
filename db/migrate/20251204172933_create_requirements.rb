class CreateRequirements < ActiveRecord::Migration[8.1]
  def change
    create_table :requirements do |t|
      t.string :name, null: false
      t.json :options, default: []

      t.timestamps
    end
    add_index :requirements, :name
  end
end
