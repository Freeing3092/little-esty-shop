require 'rails_helper'

RSpec.describe 'Bulk Discount Index' do
  before :each do
    @merchant1 = create(:merchant)
    @merchant2 = create(:merchant)
    @merchant1_discounts = create_list(:bulk_discount, 2, merchant: @merchant1)
    @merchant2_discount = create(:bulk_discount, merchant: @merchant2)
    @first_discount = @merchant1_discounts.first
    @second_discount = @merchant1_discounts.last
    
    visit merchant_bulk_discounts_path(@merchant1.id)
  end
  
  describe 'as a merchant' do
    it "I see all of my bulk discounts including their percentage
    discount and quantity thresholds" do
      within("#merchant-discounts") do
        expect(page).to have_content("Discount: #{(@first_discount.discount_percentage * 100).truncate()}% --- Quantity Threshold: #{@first_discount.minimum_item_quantity}")
        expect(page).to have_content("Discount: #{(@second_discount.discount_percentage * 100).truncate()}% --- Quantity Threshold: #{@second_discount.minimum_item_quantity}")
        expect(page).to_not have_content("Discount: #{@merchant2_discount.discount_percentage}% --- Quantity Threshold: #{@merchant2_discount.minimum_item_quantity}")
        
        expect(page).to have_link(@first_discount.name)
        expect(page).to have_link(@second_discount.name)
        expect(page).to_not have_link(@merchant2_discount.name)
      end
    end
    
    describe 'create discount' do
      it "I see a link to create a new discount. When I click this link, I am 
      taken to a new page where I see a form to add a new bulk discount" do
        expect(page).to have_link("Create New Discount")
        click_link "Create New Discount"
        
        expect(current_path).to eq(new_merchant_bulk_discount_path(@merchant1.id))
      end
    end
    describe 'delete discount' do
      it "next to each bulk discount I see a link to delete it, when I click
      this link Then I am redirected back to the bulk discounts index page and
      I no longer see the discount listed" do
        expect(page).to have_link("Delete #{@first_discount.name}")
        expect(page).to have_link("Delete #{@second_discount.name}")
        expect(page).to_not have_link("Delete #{@merchant2_discount.name}")
        
        click_link "Delete #{@first_discount.name}"
        
        expect(current_path).to eq(merchant_bulk_discounts_path(@merchant1.id))
        expect(page).to_not have_content("Discount: #{(@first_discount.discount_percentage * 100).truncate()}% --- Quantity Threshold: #{@first_discount.minimum_item_quantity}")
        expect(page).to have_content("Discount: #{(@second_discount.discount_percentage * 100).truncate()}% --- Quantity Threshold: #{@second_discount.minimum_item_quantity}")
      end
    end
  end
end