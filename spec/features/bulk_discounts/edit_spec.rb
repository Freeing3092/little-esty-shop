require 'rails_helper'

RSpec.describe 'Bulk Discount Edit' do
  before :each do
    @merchant1 = create(:merchant)
    @merchant2 = create(:merchant)
    @merchant1_discounts = create_list(:bulk_discount, 2, merchant: @merchant1)
    @merchant2_discount = create(:bulk_discount, merchant: @merchant2)
    @first_discount = @merchant1_discounts.first
    @second_discount = @merchant1_discounts.last
    
    visit edit_merchant_bulk_discount_path(@merchant1.id, @first_discount.id)
  end
  
  describe 'as a merchant' do
    it "I see that the discounts current attributes are pre-poluated in the
    form When I change any/all of the information and click submit Then I am
    redirected to the bulk discount's show page And I see that the discount's
    attributes have been updated" do
      expect(page).to have_field('name', with: @first_discount.name)
      expect(page).to have_field('minimum_item_quantity', with: @first_discount.minimum_item_quantity)
      expect(page).to have_field('discount_percentage', with: @first_discount.discount_percentage)
      expect(page).to have_button("Submit")
      
      fill_in "name", with: "Buy 20 get 30% off"
      fill_in "minimum_item_quantity", with: 20
      fill_in "discount_percentage", with: 0.3
      click_button "Submit"
      
      expect(current_path).to eq(merchant_bulk_discount_path(@merchant1.id, @first_discount.id))
      expect(page).to have_content("Discount: 30% --- Quantity Threshold: 20")
      expect(page).to have_link("Buy 20 get 30% off")
    end
  end
end