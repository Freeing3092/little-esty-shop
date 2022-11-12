class BulkDiscount < ApplicationRecord
  belongs_to :merchant
  validates_presence_of :merchant_id
  validates_presence_of :minimum_item_quantity
  validates_presence_of :discount_percentage
end