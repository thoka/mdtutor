class RecreatePresencesWithUuid < ActiveRecord::Migration[7.2]
  def change
    drop_table :presences if table_exists?(:presences)

    create_table :presences, id: :uuid do |t|
      t.string :user_id, index: true
      t.boolean :is_present, default: false
      t.references :room, type: :uuid, null: true, foreign_key: true

      t.timestamps
    end
  end
end
