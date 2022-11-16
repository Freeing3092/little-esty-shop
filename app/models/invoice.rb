class Invoice < ApplicationRecord
  belongs_to :customer
  has_many :invoice_items
  has_many :items, through: :invoice_items
  has_many :transactions
  has_many :merchants, through: :items
  has_many :bulk_discounts, through: :merchants

  enum status: [ :completed, :cancelled, "in progress" ]

  def formatted_date
    created_at.strftime('%A, %B%e, %Y')
  end

  def numerical_date
    created_at.strftime('%-m/%-e/%y')
  end

  def self.incomplete_invoices
    self.joins(:invoice_items).where.not(invoice_items: {status: 2}).distinct.order(:created_at)
  end
  
  def total_revenue
    invoice_items.sum('unit_price * quantity')
  end
  
  def total_discount(merchant_id)
    inner_query = self.invoice_items
    .select("max(bulk_discounts.discount_percentage) as disc_pct, avg(invoice_items.quantity) as qty, avg(invoice_items.unit_price) as price")
    .joins(item: [merchant: :bulk_discounts])
    .where("invoice_items.quantity >= bulk_discounts.minimum_item_quantity")
    .where("merchants.id = ?", merchant_id)
    .group("invoice_items.id")
    
    InvoiceItem.unscoped.select("sum( disc_pct * qty * price) as total")
    .from(inner_query).take.total.to_f
  end
  
  def discounted_revenue(merchant, invoice_id)
    merchant.invoice_revenue(invoice_id) - self.total_discount(merchant.id)
  end
end