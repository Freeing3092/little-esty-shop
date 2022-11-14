require 'rails_helper'


RSpec.describe InvoiceItem, type: :model do
  describe 'relationships' do
    it { should belong_to :invoice }
    it { should belong_to :item }
    it { should have_one(:merchant).through(:item)}
    it { should have_many(:bulk_discounts).through(:merchant)}
  end

  describe 'enums' do
    it { should define_enum_for(:status) }
  end

  before :each do
    @merchant1 = Merchant.create!(name: "Billy's Baby Book Barn")
    @merchant2 = Merchant.create!(name: "Candy's Child Compendium Collection")
    @item1 = @merchant1.items.create!(name: "Learn to Count, Dummy!", description: "Educational Children's Book", unit_price: 2400)
    @item2 = @merchant1.items.create!(name: "Go to Sleep Please, Mommy Just Wants to Watch Leno", description: "Baby Book", unit_price: 1500)
    @item3 = @merchant2.items.create!(name: "There ARE More Than Seven Animals But This is a Good Start", description: "Educational Children's Book", unit_price: 2100)
    @mary = Customer.create!(first_name: "Mary", last_name: "Mommy")
    @daniel = Customer.create!(first_name: "Daniel", last_name: "Daddy")
    @annie = Customer.create!(first_name: "Annie", last_name: "Auntie")
    @invoice1 = @mary.invoices.create!(status: 2)
    @invoice2 = @daniel.invoices.create!(status: 2)
    @invoice3 = @annie.invoices.create!(status: 2)
    @invoiceitem1 = InvoiceItem.create!(item: @item1, invoice: @invoice1, quantity: 7, unit_price: @item1.unit_price, status: 0 )
    @invoiceitem2 = InvoiceItem.create!(item: @item2, invoice: @invoice1, quantity: 1, unit_price: @item2.unit_price, status: 0 )
    @invoiceitem3 = InvoiceItem.create!(item: @item1, invoice: @invoice2, quantity: 12, unit_price: @item1.unit_price, status: 0 )
    @invoiceitem4 = InvoiceItem.create!(item: @item3, invoice: @invoice3, quantity: 1, unit_price: @item3.unit_price, status: 0 )
  end

  describe 'instance methods' do
    describe '#item_name' do
      it 'returns the name of an invoice_item item' do
        expect(@invoiceitem1.item_name).to eq(@item1.name)
        expect(@invoiceitem2.item_name).to eq(@item2.name)
        expect(@invoiceitem3.item_name).to eq(@item1.name)
      end
    end
    describe '#best_available_discount' do
      it "returns the best bulk_discount given the item quantity. If no
      discounts are available, returns nil" do
        discount1 = create(:bulk_discount, minimum_item_quantity: 5, discount_percentage: 0.1, merchant_id: @merchant1.id)
        discount2 = create(:bulk_discount, minimum_item_quantity: 10, discount_percentage: 0.2, merchant_id: @merchant1.id)
        discount3 = create(:bulk_discount, minimum_item_quantity: 2, discount_percentage: 0.3, merchant_id: @merchant2.id)
        
        expect(@invoiceitem1.best_available_discount).to eq(discount1)
        expect(@invoiceitem3.best_available_discount).to eq(discount2)
        expect(@invoiceitem4.best_available_discount).to eq(nil)
      end
    end
  end

end