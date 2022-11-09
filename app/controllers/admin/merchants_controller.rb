class Admin::MerchantsController < ApplicationController
  def index
    @merchants = Merchant.all
  end

  def new
    @merchant = Merchant.new
  end

  def show
    @merchant = Merchant.find(params[:id])
  end

  def edit
    @merchant = Merchant.find(params[:id])
  end

  def create
    merchant = Merchant.new(merchant_params)
    if merchant.save
      redirect_to admin_merchants_path
    else
      flash[:notice] = "Merchant not created: Required information missing"
      redirect_to '/admin/merchants/new'
    end
  end

  def update
    @merchant = Merchant.find(params[:id])
    if params[:status].present?
      @merchant.update(status: params[:status])
      redirect_to admin_merchants_path
    elsif params.has_key?('merchant')
      @merchant.update(merchant_params)
      redirect_to admin_merchant_path(@merchant.id)
    end
  end

  private

  def merchant_params
    params.require(:merchant).permit(:name)
  end
end
