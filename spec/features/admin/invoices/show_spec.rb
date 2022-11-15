require "rails_helper"

RSpec.describe "Admin Invoices Show Page", type: :feature do

  before(:each) do
    @merchant_1 = Merchant.create!(name: "Target", status: 1)
    @merchant_2 = Merchant.create!(name: "Amazon", status: 1)
    @merchant_3 = Merchant.create!(name: "Fred Meyer", status: 0)

    @customer_1 = Customer.create!(first_name: "Luke", last_name: "Harison")
    @customer_2 = Customer.create!(first_name: "Angela", last_name: "Leizer")
    @customer_3 = Customer.create!(first_name: "Matt", last_name: "Sorry")
    @customer_4 = Customer.create!(first_name: "Drake",last_name: "Pointer")
    @customer_5 = Customer.create!(first_name: "Fannie", last_name: "May")
    @customer_6 = Customer.create!(first_name: "Lorelai", last_name: "Gillmore")
    @customer_7 = Customer.create!(first_name: "Simon", last_name: "Garfunkle")
  
    @invoice_1 = @customer_1.invoices.create!(status: 0)
    @invoice_2 = @customer_1.invoices.create!(status: 0)
    @invoice_3 = @customer_1.invoices.create!(status: 1)
    @invoice_4 = @customer_1.invoices.create!(status: 2)
    @invoice_5 = @customer_1.invoices.create!(status: 2)
    @invoice_6 = @customer_2.invoices.create!(status: 0)
    @invoice_7 = @customer_2.invoices.create!(status: 0)
    @invoice_8 = @customer_3.invoices.create!(status: 0)
    @invoice_9 = @customer_3.invoices.create!(status: 0)
    @invoice_10 = @customer_3.invoices.create!(status: 2)
    @invoice_11 = @customer_3.invoices.create!(status: 0)
    @invoice_12 = @customer_4.invoices.create!(status: 1)
    @invoice_13 = @customer_4.invoices.create!(status: 1)
    @invoice_14 = @customer_4.invoices.create!(status: 2)
    @invoice_15 = @customer_5.invoices.create!(status: 0)
    @invoice_16 = @customer_5.invoices.create!(status: 0)
    @invoice_17 = @customer_6.invoices.create!(status: 1)
    @invoice_18 = @customer_6.invoices.create!(status: 2)
    @invoice_19 = @customer_6.invoices.create!(status: 2)
    @invoice_20 = @customer_7.invoices.create!(status: 0)
    
    @item_1 = Item.create!(merchant_id: @merchant_1.id, name: "Candy Dispenser", description: "Dispenses Candy", unit_price: 4291, status: 0)
    @item_2 = Item.create!(merchant_id: @merchant_1.id, name: "Towel", description: "100% Cotton", unit_price: 15, status: 1)
    @item_3 = Item.create!(merchant_id: @merchant_2.id, name: "Bowl", description: "Ceramic, Blue", unit_price: 5, status: 1)
    @item_4 = Item.create!(merchant_id: @merchant_2.id, name: "Napkin Holder", description: "Shaped Like A Taco", unit_price: 45, status: 1)
    @item_5 = Item.create!(merchant_id: @merchant_2.id, name: "Rocket Ship", description: "For Trip To Space", unit_price: 10000000, status: 1)
    @item_6 = Item.create!(merchant_id: @merchant_3.id, name: "TV", description: "52 Inch Flat Screen", unit_price: 90999, status: 0)
    
    @invoice_item_1 = InvoiceItem.create!(item_id: @item_1.id, invoice_id: @invoice_1.id, quantity: 738, unit_price: 4291, status: 0)
    @invoice_item_2 = InvoiceItem.create!(item_id: @item_2.id, invoice_id: @invoice_1.id, quantity: 12, unit_price: 15, status: 1)
    @invoice_item_3 = InvoiceItem.create!(item_id: @item_3.id, invoice_id: @invoice_1.id, quantity: 554, unit_price: 5, status: 2)
    @invoice_item_4 = InvoiceItem.create!(item_id: @item_4.id, invoice_id: @invoice_2.id, quantity: 44567, unit_price: 45, status: 1)
    @invoice_item_5 = InvoiceItem.create!(item_id: @item_5.id, invoice_id: @invoice_2.id, quantity: 1, unit_price: 10000000, status: 2)
    @invoice_item_6 = InvoiceItem.create!(item_id: @item_6.id, invoice_id: @invoice_3.id, quantity: 738, unit_price: 90999, status: 2)

    @transaction_1 = @invoice_1.transactions.create!(credit_card_number: 4654405418249632, result: "success")
    @transaction_2 = @invoice_2.transactions.create!(credit_card_number: 4580251236515201, result: "success")
    @transaction_3 = @invoice_3.transactions.create!(credit_card_number: 4354495077693036, result: "failed")
    @transaction_4 = @invoice_4.transactions.create!(credit_card_number: 4515551623735607, result: "failed")
    @transaction_5 = @invoice_5.transactions.create!(credit_card_number: 4844518708741275, result: "failed")
    @transaction_6 = @invoice_6.transactions.create!(credit_card_number: 4203696133194408, result: "success")
    @transaction_7 = @invoice_7.transactions.create!(credit_card_number: 4801647818676136, result: "success")
    @transaction_8 = @invoice_8.transactions.create!(credit_card_number: 4540842003561938, result: "success")
    @transaction_9 = @invoice_9.transactions.create!(credit_card_number: 4140149827486249, result: "success")
    @transaction_10 = @invoice_10.transactions.create!(credit_card_number: 4923661117104166, result: "failed")
    @transaction_11 = @invoice_11.transactions.create!(credit_card_number: 4800749911485986, result: "success")
    @transaction_12 = @invoice_12.transactions.create!(credit_card_number: 4017503416578382, result: "failed")
    @transaction_13 = @invoice_13.transactions.create!(credit_card_number: 4536896898764278, result: "failed")
    @transaction_14 = @invoice_14.transactions.create!(credit_card_number: 4411510861233607, result: "failed")
    @transaction_15 = @invoice_15.transactions.create!(credit_card_number: 4869639160798434, result: "success")
    @transaction_16 = @invoice_16.transactions.create!(credit_card_number: 4738848761455352, result: "success")
    @transaction_17 = @invoice_17.transactions.create!(credit_card_number: 4214497729954420, result: "failed")
    @transaction_18 = @invoice_18.transactions.create!(credit_card_number: 4436110257010678, result: "failed")
    @transaction_19 = @invoice_19.transactions.create!(credit_card_number: 4332881798016631, result: "failed")
    @transaction_20 = @invoice_20.transactions.create!(credit_card_number: 4886443388914010, result: "success")
  end

  it "the show page has the information related to the specified invoice, including invoice id, invoice status,
    invoice created_at date in the format 'Monday, July 18, 2019', customer first and last name" do
      visit "admin/invoices/#{@invoice_1.id}"
      
      expect(page).to have_content("Invoice #: #{@invoice_1.id}")
      expect(page).to have_content("#{@invoice_1.status}")
      expect(page).to have_content("Created On: #{@invoice_1.formatted_date}")
      expect(page).to have_content("Customer: #{@invoice_1.customer.first_name} #{@invoice_1.customer.last_name}")

      expect(page).to have_no_content("Invoice #: #{@invoice_2.id}")
  end 

  it "should list the total revenue that will be generated from the specified invoice" do
    visit "admin/invoices/#{@invoice_1.id}"
    invoice_1_rev = ([@invoice_item_1.unit_price * @invoice_item_1.quantity, @invoice_item_2.unit_price * @invoice_item_2.quantity, @invoice_item_3.unit_price * @invoice_item_3.quantity]).sum/100.round(2)
    result = '31,697.08'
    expect(page).to have_content("Total Revenue: $#{result}")
    expect(page).to have_no_content("Total Revenue: $10,000,045.00")
  end

  it "should have all of the items on the invoice including the item name, quantity of item
    ordered, the price the item sold for and the invoice_item status" do
      visit "admin/invoices/#{@invoice_1.id}"

      expect(page).to have_css("table")

      within("#invoice-#{@invoice_item_1.item.id}") do
        expect(page).to have_content(@invoice_item_1.item.name)
        expect(page).to have_content(@invoice_item_1.quantity)
        expect(page).to have_content("$4,291.00")
        expect(page).to have_content(@invoice_item_1.status)
      end

      expect(page).to have_no_content(@invoice_item_6.item.name)
  end

  it "the invoice status is a select field, and the invoice's current status is selected" do
    visit "admin/invoices/#{@invoice_1.id}"

    within("#invoice-#{@invoice_1.id}") do
      expect(page).to have_field("status")
      expect(page).to have_content("completed")
      expect(@invoice_1.status).to eq("completed")
      expect(page).to have_button("Update Invoice Status")
    end
  end 

  it "when the Update Invoice Status button is clicked, the item status will be
    updated with the status chosen and the user will be redirected back to the
    admin invoice show page" do
      visit "admin/invoices/#{@invoice_1.id}"

      within("#invoice-#{@invoice_1.id}") do
        expect(@invoice_1.status).to eq("completed")

        page.select("in progress", from: :status)
        click_button "Update Invoice Status"

        expect(current_path).to eq(admin_invoice_path(@invoice_1.id))
        expect(page).to have_content(@invoice_1.status)

        @current_invoice = Invoice.order(:updated_at).last

        expect(@current_invoice.id).to eq(@invoice_1.id)
        expect(@current_invoice.status).to eq("in progress")
      end
  end
end 
