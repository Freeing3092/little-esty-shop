require 'rails_helper'

RSpec.describe 'Bulk Discount Index' do
  before :each do
    @merchant1 = create(:merchant)
    @merchant2 = create(:merchant)
    @merchant1_discounts = create_list(:bulk_discount, 2, merchant: @merchant1)
    @merchant2_discount = create(:bulk_discount, merchant: @merchant2)
    visit "/merchants/#{@merchant1.id}/bulk_discounts"
  end
  
  describe 'as a merchant' do
    it "I see all of my bulk discounts including their percentage
    discount and quantity thresholds" do
      
      within("#merchant-discounts") do
        first_discount = @merchant1_discounts.first
        second_discount = @merchant1_discounts.last
        
        expect(page).to have_content("Discount: #{first_discount.discount_percentage * 100}% --- Quantity Threshold: #{first_discount.minimum_item_quantity}")
        expect(page).to have_content("Discount: #{second_discount.discount_percentage * 100}% --- Quantity Threshold: #{second_discount.minimum_item_quantity}")
        expect(page).to_not have_content("Discount: #{@merchant2_discount.discount_percentage}% --- Quantity Threshold: #{@merchant2_discount.minimum_item_quantity}")
        
        expect(page).to have_link(first_discount.name)
        expect(page).to have_link(second_discount.name)
        expect(page).to_not have_link(@merchant2_discount.name)
      end
    end
  end
end