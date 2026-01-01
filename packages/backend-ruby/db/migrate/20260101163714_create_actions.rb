class CreateActions < ActiveRecord::Migration[7.2]
  def change
    create_table :actions, id: :string do |t|
      t.string :user_id
      t.string :action_type
      t.string :gid
      t.text :metadata
      t.datetime :timestamp

      t.timestamps
    end
    add_index :actions, :user_id
    add_index :actions, :action_type
    add_index :actions, :gid
    add_index :actions, :timestamp
  end
end
