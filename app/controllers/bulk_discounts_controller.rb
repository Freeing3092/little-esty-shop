class BulkDiscountsController < ApplicationController
  def index
    @merchant = Merchant.find(params[:merchant_id])
  end
  
  def new
    @merchant = Merchant.find(params[:merchant_id])
  end
  
  def create
    @merchant = Merchant.find(params[:merchant_id])
    bulk_discount = BulkDiscount.create(bulk_discount_params)
    redirect_to "/merchants/#{@merchant.id}/bulk_discounts"
  end
  
  private
  def bulk_discount_params
    params.permit(:name, :minimum_item_quantity, :discount_percentage, :merchant_id)
  end
end