class CreateCustomizations < ActiveRecord::Migration[8.1]
  def change
    create_table :customizations do |t|
      t.string :placeholder_column

      t.timestamps
    end
  end
end
