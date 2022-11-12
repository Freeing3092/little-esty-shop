require 'rails_helper'

RSpec.describe Merchant do
  describe 'relationships' do
    it { should have_many(:items)}
    it { should have_many(:invoice_items).through(:items) }
    it { should have_many(:invoices).through(:invoice_items) }
    it { should have_many(:customers).through(:invoices) }
    it { should have_many(:transactions).through(:invoices) }
    it { should have_many(:bulk_discounts)}
  end

  describe 'validations' do
    it { should validate_presence_of :name }
    it { should define_enum_for(:status).with_values(disabled: 0, enabled: 1) }
  end

  before :each do
    @merchant1 = Merchant.create!(name: "Billy's Baby Book Barn")
    @merchant2 = Merchant.create!(name: "Candy's Child Compendium Collection")
    @item1 = @merchant1.items.create!(name: 'Learn to Count, Dummy!', description: "Educational Children's Book",
                                      unit_price: 2400)
    @item2 = @merchant1.items.create!(name: 'Go to Sleep Please, Mommy Just Wants to Watch Leno',
                                      description: 'Baby Book', unit_price: 1500)
    @item3 = @merchant2.items.create!(name: 'There ARE More Than Seven Animals But This is a Good Start',
                                      description: "Educational Children's Book", unit_price: 2100)
    @item4 = create(:item, merchant: @merchant2)
    @mary = Customer.create!(first_name: 'Mary', last_name: 'Mommy')
    @daniel = Customer.create!(first_name: 'Daniel', last_name: 'Daddy')
    @annie = Customer.create!(first_name: 'Annie', last_name: 'Auntie')
    @invoice1 = @mary.invoices.create!(status: 2)
    @invoice2 = @daniel.invoices.create!(status: 2)
    @invoice3 = @annie.invoices.create!(status: 2)
    @invoiceitem1 = InvoiceItem.create!(item: @item1, invoice: @invoice1, quantity: 1, unit_price: @item1.unit_price,
                                        status: 0)
    @invoiceitem2 = InvoiceItem.create!(item: @item2, invoice: @invoice1, quantity: 2, unit_price: @item2.unit_price,
                                        status: 0)
    @invoiceitem3 = InvoiceItem.create!(item: @item1, invoice: @invoice2, quantity: 1, unit_price: @item1.unit_price,
                                        status: 0)
    @invoiceitem4 = InvoiceItem.create!(item: @item3, invoice: @invoice3, quantity: 1, unit_price: @item3.unit_price,
                                        status: 0)
    @invoiceitem5 = InvoiceItem.create!(item: @item4, invoice: @invoice2, quantity: 1, unit_price: @item1.unit_price,
                                        status: 1)
    @invoiceitem6 = InvoiceItem.create!(item: @item3, invoice: @invoice3, quantity: 1, unit_price: @item3.unit_price,
                                        status: 2)
  end

  describe 'instance methods' do
    describe '#unique_invoices' do
      it 'returns a unique list of invoices for a merchant' do
        expect(@merchant1.unique_invoices).to match([@invoice1, @invoice2])
      end
    end

    describe '#invoice_items_for_this_invoice' do
      it 'returns invoice items only for this invoice' do
        expect(@merchant1.items_for_this_invoice(@invoice1.id)).to match([@invoiceitem1, @invoiceitem2])
      end
    end

    describe '#invoice_revenue' do
      it 'returns the total revenue for items sold on this invoice' do
        expect(@merchant1.invoice_revenue(@invoice1.id)).to eq(5400)
      end
    end

    describe '#invoices_not_shipped' do
      it "returns a list of items for invoices that are either 'packaged' or 'pending'" do
        expect(@merchant2.invoices_not_shipped).to eq([@invoiceitem5, @invoiceitem4])
      end
    end

    describe '#merchant_top_5_customers' do
      it 'returns the top 5 customers for the merchant' do
        merchant = create(:merchant)
        merchant2 = create(:merchant)
        item_1 = create(:item, merchant: merchant)
        item_2 = create(:item, merchant: merchant)
        item_3 = create(:item, merchant: merchant)
        item_4 = create(:item, merchant: merchant2)

        customer1 = create(:customer)
        customer2 = create(:customer)
        customer3 = create(:customer)
        customer4 = create(:customer)
        customer5 = create(:customer, first_name: 'The Trouble Maker')
        customer6 = create(:customer)
        customer7 = create(:customer)

        customer1_invoice = create(:invoice, customer: customer1)
        customer2_invoice = create(:invoice, customer: customer2)
        customer3_invoice = create(:invoice, customer: customer3)
        customer4_invoice = create(:invoice, customer: customer4)
        customer5_invoice = create(:invoice, customer: customer5)
        customer5_invoice2 = create(:invoice, customer: customer5)
        customer6_invoice = create(:invoice, customer: customer6)
        customer7_invoice = create(:invoice, customer: customer7)

        customer1_transactions = create_list(:transaction, 2, invoice: customer1_invoice, result: 'failed')
        customer2_transactions = create_list(:transaction, 4, invoice: customer2_invoice, result: 'success')
        customer3_transactions = create_list(:transaction, 3, invoice: customer3_invoice, result: 'success')
        customer4_transactions = create_list(:transaction, 2, invoice: customer4_invoice, result: 'success')
        customer5_transactions = create_list(:transaction, 6, invoice: customer5_invoice, result: 'success')
        customer5_transactions2 = create_list(:transaction, 6, invoice: customer5_invoice2, result: 'success')
        customer6_transactions = create_list(:transaction, 5, invoice: customer6_invoice, result: 'success')
        customer7_transactions = create_list(:transaction, 7, invoice: customer7_invoice, result: 'success')

        customer1_invoice_item = create(:invoice_item, invoice: customer1_invoice, item: item_1, status: 0)
        customer2_invoice_item = create(:invoice_item, invoice: customer2_invoice, item: item_2, status: 1)
        customer3_invoice_item = create(:invoice_item, invoice: customer3_invoice, item: item_3, status: 2)
        customer4_invoice_item = create(:invoice_item, invoice: customer4_invoice, item: item_1, status: 0)
        customer5_invoice_item = create(:invoice_item, invoice: customer5_invoice, item: item_2, status: 1)
        customer5_invoice_item2 = create(:invoice_item, invoice: customer5_invoice2, item: item_4, status: 1)
        customer6_invoice_item = create(:invoice_item, invoice: customer6_invoice, item: item_3, status: 2)
        customer7_invoice_item = create(:invoice_item, invoice: customer7_invoice, item: item_3, status: 2)

        expect(merchant.merchant_top_5_customers).to eq([customer7, customer5, customer6, customer2, customer3])
      end
    end

    describe '#top_five_merchants' do
      it 'returns the top five merchants by revenue from successful transactions' do
        merchant = create(:merchant)
        merchant2 = create(:merchant)
        merchant3 = create(:merchant)
        merchant4 = create(:merchant)
        merchant5 = create(:merchant)
        
        item_1 = create(:item, merchant: merchant, unit_price: 1)
        item_2 = create(:item, merchant: merchant2, unit_price: 1000)
        item_3 = create(:item, merchant: merchant3, unit_price: 10)
        item_4 = create(:item, merchant: merchant4, unit_price: 10000)
        item_5 = create(:item, merchant: merchant5, unit_price: 100)

        customer1 = create(:customer)
        customer2 = create(:customer)
        customer3 = create(:customer)
        customer4 = create(:customer)
        customer5 = create(:customer)

        customer1_invoice = create(:invoice, customer: customer1)
        customer2_invoice = create(:invoice, customer: customer2)
        customer3_invoice = create(:invoice, customer: customer3)
        customer4_invoice = create(:invoice, customer: customer4)
        customer5_invoice = create(:invoice, customer: customer5)

        customer1_transactions = create_list(:transaction, 1, invoice: customer1_invoice, result: 'success')
        customer2_transactions = create_list(:transaction, 1, invoice: customer2_invoice, result: 'success')
        customer3_transactions = create_list(:transaction, 1, invoice: customer3_invoice, result: 'success')
        customer4_transactions = create_list(:transaction, 1, invoice: customer4_invoice, result: 'success')
        customer5_transactions = create_list(:transaction, 1, invoice: customer5_invoice, result: 'success')

        customer1_invoice_item = create(:invoice_item, invoice: customer1_invoice, item: item_1, unit_price: 1, quantity: 1, status: 0)
        customer2_invoice_item = create(:invoice_item, invoice: customer2_invoice, item: item_2, unit_price: 1000, quantity: 1, status: 1)
        customer3_invoice_item = create(:invoice_item, invoice: customer3_invoice, item: item_3, unit_price: 10, quantity: 1, status: 2)
        customer4_invoice_item = create(:invoice_item, invoice: customer4_invoice, item: item_4, unit_price: 10000, quantity: 1, status: 0)
        customer5_invoice_item = create(:invoice_item, invoice: customer5_invoice, item: item_5, unit_price: 100, quantity: 1, status: 1)

        expect(Merchant.top_five_merchants).to match([merchant4, merchant2, merchant5, merchant3, merchant])
      end
    end

    describe '#top_revenue_date' do
      it 'returns the date the merchant made the most revenue' do
        merchant = create(:merchant)
        
        item_1 = create(:item, merchant: merchant, unit_price: 1)
        item_2 = create(:item, merchant: merchant, unit_price: 1000)
        item_3 = create(:item, merchant: merchant, unit_price: 10)
        item_4 = create(:item, merchant: merchant, unit_price: 10000)
        item_5 = create(:item, merchant: merchant, unit_price: 100)

        customer1 = create(:customer)
        customer2 = create(:customer)
        customer3 = create(:customer)
        customer4 = create(:customer)
        customer5 = create(:customer)

        customer1_invoice = create(:invoice, customer: customer1)
        customer2_invoice = create(:invoice, customer: customer2)
        customer3_invoice = create(:invoice, customer: customer3)
        customer4_invoice = create(:invoice, customer: customer4, created_at: DateTime.new(2022, 10, 31, 9, 54, 9))
        customer5_invoice = create(:invoice, customer: customer5)

        customer1_transactions = create_list(:transaction, 1, invoice: customer1_invoice, result: 'success')
        customer2_transactions = create_list(:transaction, 1, invoice: customer2_invoice, result: 'success')
        customer3_transactions = create_list(:transaction, 1, invoice: customer3_invoice, result: 'success')
        customer4_transactions = create_list(:transaction, 1, invoice: customer4_invoice, result: 'success')
        customer5_transactions = create_list(:transaction, 1, invoice: customer5_invoice, result: 'success')

        customer1_invoice_item = create(:invoice_item, invoice: customer1_invoice, item: item_1, unit_price: 1, quantity: 1, status: 0)
        customer2_invoice_item = create(:invoice_item, invoice: customer2_invoice, item: item_2, unit_price: 1000, quantity: 1, status: 1)
        customer3_invoice_item = create(:invoice_item, invoice: customer3_invoice, item: item_3, unit_price: 10, quantity: 1, status: 2)
        customer4_invoice_item = create(:invoice_item, invoice: customer4_invoice, item: item_4, unit_price: 10000, quantity: 1, status: 0)
        customer5_invoice_item = create(:invoice_item, invoice: customer5_invoice, item: item_5, unit_price: 100, quantity: 1, status: 1)

        expect(merchant.top_revenue_date).to match("10/31/22")
      end
    end

    describe '#five_most_popular_items_by_revenue' do
      it 'returns the 5 most popular items by revenue' do
        merchant = create(:merchant)

        item_1 = create(:item, merchant: merchant)
        item_2 = create(:item, merchant: merchant)
        item_3 = create(:item, merchant: merchant)
        item_4 = create(:item, merchant: merchant)
        item_5 = create(:item, merchant: merchant)
        item_6 = create(:item, merchant: merchant)

        customer1 = create(:customer)

        customer1_invoice = create(:invoice, customer: customer1)

        customer1_transactions = create(:transaction, invoice: customer1_invoice, result: 'success')

        customer1_invoice_item = create(:invoice_item, invoice: customer1_invoice, item: item_1, status: 0, unit_price: 100, quantity: 1)
        customer1_invoice_item = create(:invoice_item, invoice: customer1_invoice, item: item_2, status: 1, unit_price: 500, quantity: 1)
        customer1_invoice_item = create(:invoice_item, invoice: customer1_invoice, item: item_3, status: 2, unit_price: 700, quantity: 1)
        customer1_invoice_item = create(:invoice_item, invoice: customer1_invoice, item: item_4, status: 0, unit_price: 4800, quantity: 2)
        customer1_invoice_item = create(:invoice_item, invoice: customer1_invoice, item: item_5, status: 1, unit_price: 900, quantity: 1)
        customer1_invoice_item = create(:invoice_item, invoice: customer1_invoice, item: item_6, status: 2, unit_price: 1000, quantity: 1)

        method_return = merchant.five_most_popular_items_by_revenue

        names = []
        method_return.each do |x|
          names << x.item_name
        end

        expect(names).to eq([item_4.name, item_6.name, item_5.name, item_3.name, item_2.name])
      end
    end

    describe '#best_day' do
      it 'tests for the best day for each item' do
        merchant = create(:merchant)

        item_1 = create(:item, merchant: merchant)

        customer1 = create(:customer)

        customer1_invoice = create(:invoice, customer: customer1, created_at: DateTime.new(2012, 03, 25, 8, 54, 9))
        customer1_transactions = create(:transaction, invoice: customer1_invoice, result: 'success')
        customer1_invoice_item = create(:invoice_item, invoice: customer1_invoice, item: item_1, status: 0, unit_price: 100, quantity: 4)

        customer1_invoice2 = create(:invoice, customer: customer1, created_at: DateTime.new(2012, 03, 24, 9, 54, 9))
        customer1_transactions2 = create(:transaction, invoice: customer1_invoice2, result: 'success')
        customer1_invoice_item2 = create(:invoice_item, invoice: customer1_invoice2, item: item_1, status: 1, unit_price: 100, quantity: 1)


        expected = merchant.best_day(item_1.id)
        expect(expected[0].created_at).to eq(customer1_invoice.created_at)
      end
    end
  end
end
