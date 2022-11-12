class AddNameToBulkDiscounts < ActiveRecord::Migration[5.2]
  def change
    add_column :bulk_discounts, :name, :string
  end
end
