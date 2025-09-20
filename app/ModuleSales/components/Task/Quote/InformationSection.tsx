"use client";

import React from "react";

const InformationSection: React.FC = () => {
    return (
        <div className="mt-4 grid grid-cols-4 gap-4 text-xs">
            {/* Included */}
            <div className="col-span-1 font-semibold">Included:</div>
            <div className="col-span-3 leading-relaxed">
                Orders Within Metro Manila: Free delivery for a minimum sales transaction of ₱5,000. <br />
                Orders outside Metro Manila Free delivery is available for a minimum sales transaction of ₱10,000 in Rizal, ₱15,000 in Bulacan and Cavite, and ₱25,000 in Laguna, Pampanga, and Batangas.
            </div>

            {/* Excluded */}
            <div className="col-span-1 font-semibold">Excluded:</div>
            <div className="col-span-3 leading-relaxed">
                All lamp poles are subject to a delivery charge. <br />
                Installation and all hardware/accessories not indicated above. <br />
                Freight charges, arrastre, and other processing fees.
            </div>

            {/* Note */}
            <div className="col-span-1 font-semibold">Note:</div>
            <div className="col-span-3 leading-relaxed">
                Deliveries are up to the vehicle unloading point only. <br />
                Additional shipping fee applies for other areas not mentioned above. <br />
                Subject to confirmation upon getting the actual weight and dimensions of the items. <br />
                In cases of client error, there will be a 10% restocking fee for returns, refunds, and exchanges.
            </div>

            {/* Terms and Conditions */}
            <div className="col-span-4 font-semibold">Terms and Conditions</div>

            {/* Availability */}
            <div className="col-span-1 font-semibold">Availability:</div>
            <div className="col-span-3 leading-relaxed">
                *5-7 days if on stock upon receipt of approved PO. <br />
                *For items not on stock/indent order, an estimate of 45-60 days upon receipt of approved PO & down payment. Barring any delay in shipping and customs clearance beyond Ecoshift's control.
            </div>

            {/* Warranty */}
            <div className="col-span-1 font-semibold">Warranty:</div>
            <div className="col-span-3 leading-relaxed">
                One (1) year from the time of delivery for all busted lights except the damaged fixture. <br />
                The warranty will be VOID under the following circumstances: <br />
                *If the unit is being tampered with. <br />
                *If the item(s) is/are altered in any way by unauthorized technicians. <br />
                *If it has been subjected to misuse, mishandling, neglect, or accident. <br />
                *If damaged due to spillage of liquids, tear corrosion, rusting, or stains. <br />
                *This warranty does not cover loss of product accessories such as remote control, adaptor, battery, screws, etc. <br />
                *Shipping costs for warranty claims are for customers' account. <br />
                *If the product purchased is already phased out when the warranty is claimed, the latest model or closest product SKU will be given as a replacement.
            </div>

            {/* SO Validity */}
            <div className="col-span-1 font-semibold">SO Validity:</div>
            <div className="col-span-3 leading-relaxed">
                Sales order has validity period of 14 working days (excluding holidays and Sundays)
                from the date of issuance. Any sales order not confirmed and no verified payment within this 14-day period will be automatically cancelled.
            </div>

            {/* Storage */}
            <div className="col-span-1 font-semibold">Storage:</div>
            <div className="col-span-3 leading-relaxed">
                Orders with confirmation/verified payment but undelivered after 14 working days (excluding holidays and Sundays starting from picking date)
                due to clients’ request or shortcomings will be charged a storage fee of 10% of the value of the orders per month (10% / 30 days =  0.33% per day)
            </div>

            {/* Return */}
            <div className="col-span-1 font-semibold">Return:</div>
            <div className="col-span-3 leading-relaxed">
                <span className="text-red-500">7 days return policy</span> - if the product received is defective, damaged, or incomplete.
                This must be communicated to Ecoshift, and Ecoshift has duly acknowledged communication as received within a maximum of 7 days to qualify for replacement.
            </div>

            {/* Payment Section */}
            <div className="col-span-1 font-semibold">Payment:</div>
            <div className="col-span-3 leading-relaxed text-xs space-y-2">
                {/* Payment Notes */}
                <div>
                    Cash on Delivery (COD) <br />
                    <span className="text-[10px]">
                        NOTE: Orders below 10,000 pesos can be paid in cash at the time of delivery.
                        Exceeding 10,000 pesos should be transacted through bank deposit or mobile electronic transactions.
                    </span> <br />
                    For special items, Seventy Percent (70%) down payment, 30% upon delivery.
                </div>

                {/* Two-column layout */}
                <div className="grid grid-cols-2 gap-4 mt-2">
                    {/* Left column - Bank details */}
                    <div className="space-y-1">
                        <div className="font-semibold underline">BANK DETAILS</div>
                        <div>
                            Payee to: ECOSHIFT CORPORATION <br />
                            Bank: Metrobank <br />
                            Account Name: Ecoshift Corporation <br />
                            Account Number: 243-7-243805100
                        </div>
                        <div className="mt-2">
                            Bank: BDO <br />
                            Account Name: Ecoshift Corporation <br />
                            Account Number: 0021-8801-7271
                        </div>
                    </div>

                    {/* Right column - QR Code image */}
                    <div className="flex justify-center items-start">
                        <img
                            src="/qr-code.png"
                            alt="QR Code"
                            className="w-32 h-32 object-contain border rounded"
                        />
                    </div>
                </div>
            </div>

            {/* Delivery */}
            <div className="col-span-1 font-semibold">Delivery:</div>
            <div className="col-span-3 leading-relaxed">
                Delivery/Pick up is subject to confirmation. for replacement.
            </div>

            {/* Delivery */}
            <div className="col-span-1 font-semibold">Validity:</div>
            <div className="col-span-3 leading-relaxed">
                <span className="text-red-500">Twelve (12) calendar days from the date of this offer.</span> <br />
                In the event of changes in prevailing market conditions, duties, taxes, and all other importation charges, quoted prices are subject to change.
            </div>

            {/* Cancellation */}
            <div className="col-span-1 font-semibold">Cancellation:</div>
            <div className="col-span-3 leading-relaxed">
                1. Above quoted items are non-cancellable. <br />
                2. If the customer cancels the order under any circumstances, the client shall be responsible for 100% cost incurred by Ecoshift, 
                including freight and delivery charges.<br />
                3. Downpayment for items not in stock/indent and order/special items are non-refundable and will be forfeited if the order is canceled. <br />
                4. COD transaction payments should be ready upon delivery. 
                If the payment is not ready within seven (7) days from the date of order, the transaction is automatically canceled. <br />
                5. Cancellation for Special Projects (SPF) are not allowed and will be subject to a 100% charge.
            </div>

            {/* Thank You */}
            <div className="col-span-4 font-semibold">
                Thank you for allowing us to service your requirements. We hope that the above offer merits your acceptance. <br />
                Unless otherwise indicated in your Approved Purchase Order, you are deemed to have accepted the Terms and Conditions of this Quotation.
            </div>
        </div>
    );
};

export default InformationSection;
