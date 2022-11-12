class Merchant < ApplicationRecord
  has_many :items
  has_many :invoice_items, through: :items
  has_many :invoices, through: :invoice_items
  has_many :customers, through: :invoices
  has_many :transactions, through: :invoices

  has_many :bulk_discounts
  
  validates_presence_of :name

  enum status: {
    disabled: 0,
    enabled: 1
  }

  def unique_invoices
    invoices.distinct.order(:created_at)
  end

  def items_for_this_invoice(invoice_id)
    invoice_items.where(invoice_id: invoice_id)
  end

  def invoice_revenue(invoice_id)
    items_for_this_invoice(invoice_id).sum('invoice_items.unit_price * invoice_items.quantity')
  end

  def invoices_not_shipped
    invoice_items.select('invoice_items.*')
    .where(status: [0, 1])
    .joins(:invoice)
    .order('invoices.created_at')
  end

  def merchant_top_5_customers
    Customer.select(:id, :first_name, :last_name, 'count(transactions.*) as number_transactions')
    .joins(invoices: [:items, :transactions])
    .where(['items.merchant_id = ? and transactions.result = ?', self.id, 'success'])
    .group(:id).order('number_transactions desc')
    .limit(5)
  end

  def self.top_five_merchants
    self.joins(:transactions, items: :merchant).where(transactions: {result: :success}).select('merchants.*, sum(invoice_items.quantity * invoice_items.unit_price) as total_revenue').group('merchants.id').order(total_revenue: :desc).limit(5)
  end

  def top_revenue_date
    invoices.joins(:transactions).where(transactions: { result: :success }).group(:id).select('invoices.created_at', 'SUM(invoice_items.quantity * invoice_items.unit_price) AS revenue').order('revenue desc', 'created_at desc').first.numerical_date
  end

  def five_most_popular_items_by_revenue
    items.select('distinct items.name as item_name, items.id as item_id, invoice_items.unit_price * invoice_items.quantity as total_revenue')
         .joins(invoices: :transactions)
         .where('result = ?', 'success')
         .order('total_revenue desc')
         .limit(5)

  end

  def best_day(item_id)
    invoices.select('invoices.created_at, items.name as item_name')
            .joins(:invoice_items)
            .joins(:items)
            .where('items.id = ?', item_id)
            .order('invoices.created_at desc')
            .limit(1)
  end
end
