class CreateBulkDiscounts < ActiveRecord::Migration[5.2]
  def change
    create_table :bulk_discounts do |t|
      t.references :merchant, foreign_key: true
      t.integer :minimum_item_quantity
      t.decimal :discount_percentage, precision: 5, scale: 2
      
      t.timestamps
    end
  end
end
