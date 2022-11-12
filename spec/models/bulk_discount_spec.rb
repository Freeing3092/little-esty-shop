require 'rails_helper'

RSpec.describe BulkDiscount do
  describe 'relationships' do
    it { should belong_to(:merchant) }
  end
  describe 'validations' do
     it { should validate_presence_of(:merchant_id) }
     it { should validate_presence_of(:minimum_item_quantity) }
     it { should validate_presence_of(:discount_percentage) }
   end
end