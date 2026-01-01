class CreatePresences < ActiveRecord::Migration[7.2]
  def change
    create_table :presences do |t|
      t.string :user_id
      t.boolean :is_present

      t.timestamps
    end
    add_index :presences, :user_id
  end
end
