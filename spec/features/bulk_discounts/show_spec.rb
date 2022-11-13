require 'rails_helper'

RSpec.describe 'Bulk Discount Show' do
  
  before :each do
    @merchant1 = create(:merchant)
    @merchant2 = create(:merchant)
    @merchant1_discounts = create_list(:bulk_discount, 2, merchant: @merchant1)
    @merchant2_discount = create(:bulk_discount, merchant: @merchant2)
    @first_discount = @merchant1_discounts.first
    @second_discount = @merchant1_discounts.last
    
    visit merchant_bulk_discount_path(@merchant1.id, @first_discount.id)
  end
  
  describe 'as a merchant' do
    it "I see the bulk discount's quantity threshold and percentage 
    discount" do
      expect(page).to have_content("Discount: #{(@first_discount.discount_percentage * 100).truncate()}% --- Quantity Threshold: #{@first_discount.minimum_item_quantity}")
      expect(page).to_not have_content("Discount: #{(@second_discount.discount_percentage * 100).truncate()}% --- Quantity Threshold: #{@second_discount.minimum_item_quantity}")
    end
    it "I see a link to edit the bulk discount. When I click this link then I
    am taken to a new page with a form to edit the discount" do
      expect(page).to have_link("Edit #{@first_discount.name}")
      
      click_link "Edit #{@first_discount.name}"
      
      expect(current_path).to eq(edit_merchant_bulk_discount_path(@merchant1.id, @first_discount.id))
    end
  end
end