require 'rails_helper'

RSpec.describe Invoice, type: :model do

  describe 'relationships' do
    it { should belong_to :customer }
    it { should have_many :invoice_items }
    it { should have_many(:items).through(:invoice_items) }
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
    @invoiceitem1 = InvoiceItem.create!(item: @item1, invoice: @invoice1, quantity: 1, unit_price: @item1.unit_price, status: 0 )
    @invoiceitem2 = InvoiceItem.create!(item: @item2, invoice: @invoice1, quantity: 2, unit_price: @item2.unit_price, status: 0 )
    @invoiceitem3 = InvoiceItem.create!(item: @item1, invoice: @invoice2, quantity: 1, unit_price: @item1.unit_price, status: 0 )
    @invoiceitem4 = InvoiceItem.create!(item: @item3, invoice: @invoice3, quantity: 1, unit_price: @item3.unit_price, status: 0 )
    @invoiceitem5 = InvoiceItem.create!(item: @item3, invoice: @invoice1, quantity: 1, unit_price: @item1.unit_price, status: 0 )
  end

  describe 'model methods' do
    describe '#formatted_date' do
      it "displays the date as 'Weekday, Month Day, Year'" do
        expect(@invoice1.formatted_date).to eq(@invoice1.created_at.strftime('%A, %B%e, %Y'))
      end
    end

    describe '#numerical_date' do
      it "displays the date as 'Weekday, Month Day, Year'" do
        expect(@invoice1.numerical_date).to eq(@invoice1.created_at.strftime('%-m/%-e/%y'))
      end
    end

    describe "#incomplete_invoices" do
    
      before(:each) do
        @customer_1 = Customer.create!(first_name: "Luke", last_name: "Harison")
        
        @merchant_1 = Merchant.create!(name: "Target")
        @merchant_2 = Merchant.create!(name: "Amazon")
        @merchant_3 = Merchant.create!(name: "Fred Meyer")

        @invoice_4 = @customer_1.invoices.create!(status: 0)
        @invoice_5 = @customer_1.invoices.create!(status: 0)
        @invoice_6 = @customer_1.invoices.create!(status: 1)
        @invoice_7 = @customer_1.invoices.create!(status: 2)
        
        @item_1 = Item.create!(merchant_id: @merchant_1.id, name: "Candy Dispenser", description: "Dispenses Candy", unit_price: 4291)
        @item_2 = Item.create!(merchant_id: @merchant_1.id, name: "Towel", description: "100% Cotton", unit_price: 15)
        @item_3 = Item.create!(merchant_id: @merchant_2.id, name: "Bowl", description: "Ceramic, Blue", unit_price: 5)
        @item_4 = Item.create!(merchant_id: @merchant_2.id, name: "Napkin Holder", description: "Shaped Like A Taco", unit_price: 45)
        @item_5 = Item.create!(merchant_id: @merchant_2.id, name: "Rocket Ship", description: "For Trip To Space", unit_price: 10000000)
        @item_6 = Item.create!(merchant_id: @merchant_3.id, name: "TV", description: "52 Inch Flat Screen", unit_price: 90999)
        
        @invoice_item_1 = InvoiceItem.create!(item_id: @item_1.id, invoice_id: @invoice_4.id, quantity: 738, unit_price: 4291, status: 0)
        @invoice_item_2 = InvoiceItem.create!(item_id: @item_2.id, invoice_id: @invoice_4.id, quantity: 12, unit_price: 15, status: 2)
        @invoice_item_3 = InvoiceItem.create!(item_id: @item_3.id, invoice_id: @invoice_4.id, quantity: 554, unit_price: 5, status: 2)
        @invoice_item_4 = InvoiceItem.create!(item_id: @item_4.id, invoice_id: @invoice_5.id, quantity: 44567, unit_price: 45, status: 2)
        @invoice_item_5 = InvoiceItem.create!(item_id: @item_5.id, invoice_id: @invoice_5.id, quantity: 1, unit_price: 10000000, status: 2)
        @invoice_item_6 = InvoiceItem.create!(item_id: @item_6.id, invoice_id: @invoice_6.id, quantity: 738, unit_price: 90999, status: 2)
        @discount1 = create(:bulk_discount, minimum_item_quantity: 250, discount_percentage: 0.1, merchant_id: @merchant_1.id)
        @discount2 = create(:bulk_discount, minimum_item_quantity: 700, discount_percentage: 0.2, merchant_id: @merchant_1.id)
        @discount3 = create(:bulk_discount, minimum_item_quantity: 500, discount_percentage: 0.3, merchant_id: @merchant_2.id)
      end
      
      it "returns a list of all unique invoices that have items that have not been shipped from newest to oldest based on when
        the invoice was created " do
          expect(Invoice.incomplete_invoices).to eq([@invoice1, @invoice2, @invoice3, @invoice_4])
          expect(Invoice.incomplete_invoices).to_not include(@invoice_5, @invoice_6)    
      end 

      describe "#total_revenue" do
        it "should return the toal revenue that will be generated by the specified invoice" do
          invoice_4_rev = ([@invoice_item_1.quantity * @invoice_item_1.unit_price, @invoice_item_2.quantity * @invoice_item_2.unit_price, @invoice_item_3.quantity * @invoice_item_3.unit_price]).sum
          invoice_5_rev = ([@invoice_item_4.quantity * @invoice_item_4.unit_price, @invoice_item_5.quantity * @invoice_item_5.unit_price]).sum
          invoice_6_rev = @invoice_item_6.quantity * @invoice_item_6.unit_price
          expect(@invoice_4.total_revenue).to eq(invoice_4_rev)
          expect(@invoice_5.total_revenue).to eq(invoice_5_rev)
          expect(@invoice_6.total_revenue).to eq(invoice_6_rev)
        end 
      end
      
      describe 'total_discount' do
        it "returns the total discount applied for all items that qualify for
        a discount on an invoice." do
          total_disc = ([@invoice_item_1.quantity * @invoice_item_1.unit_price * @discount2.discount_percentage, 
            @invoice_item_3.quantity * @invoice_item_3.unit_price * @discount3.discount_percentage]).sum
          expect(@invoice_4.total_discount).to eq(total_disc)
        end
      end
      
      describe 'discounted_revenue' do
        it "returns the total_revenue of an invoice less the total_discount" do
          total_disc = ([@invoice_item_1.quantity * @invoice_item_1.unit_price * @discount2.discount_percentage, 
            @invoice_item_3.quantity * @invoice_item_3.unit_price * @discount3.discount_percentage]).sum
          total_rev = ([@invoice_item_1.quantity * @invoice_item_1.unit_price, 
            @invoice_item_2.quantity * @invoice_item_2.unit_price,
            @invoice_item_3.quantity * @invoice_item_3.unit_price]).sum
            
          expect(@invoice_4.discounted_revenue).to eq(total_rev - total_disc)
        end
      end
    end 
  end 
end