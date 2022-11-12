require 'faker'

FactoryBot.define do
  factory :customer, class: Customer do
    first_name {Faker::Name.first_name}
    last_name {Faker::Name.last_name}
  end
  
  factory :merchant, class: Merchant do
    name {Faker::Name.name}
  end
  
  factory :item, class: Item do
    name {Faker::Commerce.product_name}
    description {Faker::Marketing.buzzwords}
    unit_price {Faker::Number.within(range: 1000..10000)}
    status {0}
    association :merchant, factory: :merchant
  end
  
  factory :invoice, class: Invoice do
    status {Faker::Number.within(range: 0..2)}
    created_at {Time.now}
    association :customer, factory: :customer
  end
  
  factory :invoice_item, class: InvoiceItem do
    # status_hash = {0 => 'pending', 1 => 'packaged', 2 => 'shipped'}
    quantity {Faker::Number.within(range: 0..10)}
    unit_price {Faker::Number.within(range: 1000..10000)}
    status {Faker::Number.within(range: 0..2)}
    association :invoice, factory: :invoice
    association :item, factory: :item
  end
  
  factory :transaction, class: Transaction do
    result_hash = {0 => 'success', 1 => 'failed'}
    credit_card_number {Faker::Bank.account_number}
    cc_expiration_date {Faker::Date.between(from: '2022-09-23', to: '2027-09-25')}
    result {result_hash[Faker::Number.within(range: 0..1)]}
    association :invoice, factory: :invoice
  end
  
  factory :bulk_discount, class: BulkDiscount do
    name {Faker::Commerce.promotion_code(digits: 2)}
    minimum_item_quantity {Faker::Number.within(range: 2..100)}
    discount_percentage {Faker::Number.between(from: 0.05, to: 0.5).round(2)}
    association :merchant, factory: :merchant
  end
end