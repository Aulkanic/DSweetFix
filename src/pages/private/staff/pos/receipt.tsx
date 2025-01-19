/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef } from "react";
import { Button, Divider } from "antd";
import { currencyFormat } from "../../../../utils/utils";
import { useReactToPrint } from "react-to-print";

interface ReceiptProps {
  cart: any[];
  subtotal: number;
  grandTotal: number;
  paymentAmount: number;
  change: number;
  handleReset: () => void;
}

const Receipt = React.forwardRef<HTMLDivElement, ReceiptProps>(
  ({ cart, subtotal, grandTotal, paymentAmount, change, handleReset }) => {
    const contentRef = useRef<HTMLDivElement>(null);
    const handlePrint = useReactToPrint({
      contentRef,
      documentTitle: "Receipt",
      onAfterPrint: () => handleReset(),
    });

    return (
      <div>
        <div
          ref={contentRef}
          className="p-4 bg-white rounded-md shadow-md max-w-sm mx-auto border border-gray-300"
          style={{
            fontFamily: "Courier, monospace",
            fontSize: "12px",
            lineHeight: "1.5",
          }}
        >
          {/* Store Header */}
          <div className="text-center mb-4">
            <h1 className="text-lg font-bold">D'Sweet Fix</h1>
            <p>Baking & Confectionery Shop</p>
            <p>123 Sweet St, Candy City, CA 90210</p>
            <p>Tel: (123) 456-7890</p>
            <Divider />
          </div>

          {/* Receipt Details */}
          <div>
            <p>
              <strong>Date:</strong> {new Date().toLocaleDateString()}{" "}
              {new Date().toLocaleTimeString()}
            </p>
            <p>
              <strong>Receipt #:</strong> {Math.random().toString().slice(2, 10)}
            </p>
            <Divider />
          </div>

          {/* Cart Items */}
          {cart.map((item) => (
            <div key={item.product.id} className="flex justify-between mb-2">
              <span>
                {item.product.name} x{item.quantity}
              </span>
              <span>{currencyFormat(item.product.price * item.quantity)}</span>
            </div>
          ))}
          <Divider />

          {/* Payment Details */}
          <div className="mb-4">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{currencyFormat(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (Included):</span>
              <span>{currencyFormat(0)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Total:</span>
              <span>{currencyFormat(grandTotal)}</span>
            </div>
            <Divider />
            <div className="flex justify-between">
              <span>Payment:</span>
              <span>{currencyFormat(paymentAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Change:</span>
              <span>{currencyFormat(change)}</span>
            </div>
          </div>

          {/* Footer */}
          <Divider />
          <p className="text-center text-sm font-semibold">
            Thank you for your purchase!
          </p>
          <p className="text-center text-xs text-gray-500">
            Visit us again at D'Sweet Fix
          </p>
        </div>

        {/* Print Button */}
        <Button
          type="primary"
          block
          size="large"
          className="mt-6 bg-blue-500 hover:bg-blue-600 border-none rounded-lg"
          onClick={() =>handlePrint()}
        >
          Print Receipt
        </Button>
      </div>
    );
  }
);

export default Receipt;
