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
    redirect_to merchant_bulk_discounts_path(@merchant.id)
  end
  
  def destroy
    merchant = Merchant.find(params[:merchant_id])
    BulkDiscount.destroy(params[:id])
    redirect_to merchant_bulk_discounts_path(merchant.id)
  end
  
  def show
    @merchant = Merchant.find(params[:merchant_id])
    @bulk_discount = BulkDiscount.find(params[:id])
  end
  
  def edit
    @merchant = Merchant.find(params[:merchant_id])
    @bulk_discount = BulkDiscount.find(params[:id])
  end
  
  def update
    merchant = Merchant.find(params[:merchant_id])
    bulk_discount = BulkDiscount.find(params[:id])
    bulk_discount.update(bulk_discount_params)
    redirect_to merchant_bulk_discount_path(merchant.id, bulk_discount.id)
  end
  
  private
  def bulk_discount_params
    params.permit(:name, :minimum_item_quantity, :discount_percentage, :merchant_id)
  end
end