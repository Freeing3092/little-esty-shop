require 'rails_helper'

RSpec.describe 'New Bulk Discount' do
  describe 'as a merchant' do
    it "When I fill in the form with valid data, Then I am redirected back to
    the bulk discount index and I see my new bulk discount listed" do
      merchant = create(:merchant)
      visit new_merchant_bulk_discount_path(merchant.id)
      expect(page).to have_field :name
      expect(page).to have_field :minimum_item_quantity
      expect(page).to have_field :discount_percentage
      expect(page).to have_button("Submit")
      
      fill_in "name", with: "Buy 10 items get 20% off"
      fill_in "minimum_item_quantity", with: 10
      fill_in "discount_percentage", with: 0.2
      click_button "Submit"
      
      expect(current_path).to eq(merchant_bulk_discounts_path(merchant.id))
      expect(page).to have_content("Discount: 20% --- Quantity Threshold: 10")
      expect(page).to have_link("Buy 10 items get 20% off")
    end
  end
end