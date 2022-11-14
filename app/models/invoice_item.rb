class InvoiceItem < ApplicationRecord
  belongs_to :invoice
  belongs_to :item
  has_one :merchant, through: :item
  has_many :bulk_discounts, through: :merchant

  enum status: [ :pending, :packaged, :shipped ]

  def item_name
    item.name
  end
  
  def best_available_discount
    bulk_discounts.where('bulk_discounts.minimum_item_quantity <= ?', self.quantity)
    .order(discount_percentage: :desc)
    .limit(1).first
  end
end