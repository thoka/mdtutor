class CreateVisits < ActiveRecord::Migration[7.2]
  def change
    create_table :visits, id: :uuid do |t|
      t.string :user_id
      t.references :room, null: false, foreign_key: true, type: :uuid
      t.datetime :started_at
      t.datetime :ended_at

      t.timestamps
    end
    add_index :visits, :user_id
    add_index :visits, :ended_at
  end
end
