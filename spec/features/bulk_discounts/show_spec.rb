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
    it "Then I see the bulk discount's quantity threshold and percentage 
    discount" do
      expect(page).to have_content("Discount: #{(@first_discount.discount_percentage * 100).truncate()}% --- Quantity Threshold: #{@first_discount.minimum_item_quantity}")
      expect(page).to_not have_content("Discount: #{(@second_discount.discount_percentage * 100).truncate()}% --- Quantity Threshold: #{@second_discount.minimum_item_quantity}")
    end
  end
end