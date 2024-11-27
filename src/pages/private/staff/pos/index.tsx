/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Divider, InputNumber, Select, Tabs } from "antd";
import { currencyFormat } from "../../../../utils/utils";
import usePos from "./usePos";

export const PointofSalePage = () => {
  const {
    handleAddToCart,
    handleCategoryChange,
    handleOrderSubmission,
    handlePaymentAmountChange,
    handleQuantityChange,
    setPaymentMethod,
    items,
    currentDateTime,
    loading,
    selectedCategory,
    products,
    cart,
    subtotal,
    grandTotal,
    paymentAmount,
    paymentMethod,
    change,
  } = usePos();
  return (
    <div className="min-h-screen p-4">
      <div className="flex justify-between items-center ">
        <h2 className="text-3xl">Point of Sale</h2>
        <p>{currentDateTime}</p>
      </div>

      <Divider className="my-4" />
      <div className="w-full flex gap-2 flex-nowrap">
        <div className="flex-1 h-max">
          <Tabs
            type="card"
            defaultActiveKey="0"
            items={items}
            onChange={handleCategoryChange}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto p-4">
            {products
              .filter(
                (p) =>
                  !selectedCategory ||
                  p.category.toString() === selectedCategory
              )
              .map((product) => (
                <div
                  key={product.id}
                  className={`${
                    cart?.find((v: any) => v.product.id === product.id)
                      ? "border-2 border-sky-600 bg-sky-500 text-white"
                      : "border-2 border-gray-300 bg-gray-300 text-white"
                  } transition ease-in-out duration-300 shadow-md rounded-lg p-4 h-[220px] cursor-pointer flex flex-col items-center justify-center`}
                  onClick={() => handleAddToCart(product)}
                >
                  <img
                    className="w-[100px] h-[100px] rounded-full mb-2"
                    src={product.image}
                    alt={product.name}
                  />
                  <p className="text-center font-bold text-ellipsis overflow-hidden whitespace-nowrap w-full">
                    {product.name}
                  </p>
                  <p className="text-center">{currencyFormat(product.price)}</p>
                  <p className="text-center text-sm text-gray-800">
                    {product.stock > 0
                      ? `Stock: ${product.stock}`
                      : "Out of Stock"}
                  </p>
                </div>
              ))}
          </div>
        </div>
        <div className="w-full md:w-[500px] border-l-2 pl-4 min-h-screen bg-gray-50 shadow-lg">
          <h3 className="text-2xl font-semibold mb-6 border-b pb-2 text-gray-700">
            Cart
          </h3>
          {cart.length > 0 ? (
            cart.map((item) => (
              <div
                className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200"
                key={item.product.id}
              >
                <div className="cart-item flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4 basis-[50%]">
                    <img
                      src={item.img}
                      className="w-[60px] h-[60px] object-cover rounded-lg border"
                      alt={item.product.name}
                    />
                    <span className="font-medium text-gray-700 text-lg break-words">
                      {item.product.name}
                    </span>
                  </div>
                  <div className="flex-grow flex items-center justify-between gap-2">
                    <Button
                      size="small"
                      className="border-gray-300"
                      onClick={() =>
                        handleQuantityChange(item.product.id, item.quantity - 1)
                      }
                    >
                      -
                    </Button>
                    <InputNumber
                      min={1}
                      value={item.quantity}
                      className="w-20 border border-gray-300 text-center rounded"
                      onChange={(value) =>
                        handleQuantityChange(item.product.id, value)
                      }
                    />
                    <Button
                      size="small"
                      className="border-gray-300"
                      onClick={() =>
                        handleQuantityChange(item.product.id, item.quantity + 1)
                      }
                    >
                      +
                    </Button>
                    <span className="font-semibold text-lg text-gray-700 flex-grow text-right">
                      {currencyFormat(
                        Number(item.product.price) * item.quantity
                      )}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-10">
              Your cart is empty. Add items to proceed.
            </p>
          )}
          {cart.length > 0 && (
            <>
              <Divider className="my-6" />
              <div className="cart-summary p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="flex justify-between mb-4">
                  <span className="font-semibold text-gray-600">Subtotal:</span>
                  <span className="text-gray-700">
                    {currencyFormat(subtotal)}
                  </span>
                </div>
                <Divider className="my-2" />
                <div className="flex justify-between mb-6">
                  <span className="text-lg font-semibold text-gray-700">
                    Grand Total:
                  </span>
                  <span className="text-lg font-semibold text-gray-700">
                    {currencyFormat(grandTotal)}
                  </span>
                </div>
                <div className="payment-method mb-4 flex gap-4 items-center">
                  <h4 className="text-md font-semibold text-gray-600">
                    Payment Method:
                  </h4>
                  <Select
                    className="flex-1"
                    value={paymentMethod}
                    onChange={(value) => setPaymentMethod(value)}
                  >
                    <Select.Option value="Cash">Cash</Select.Option>
                    <Select.Option value="GCash">GCash</Select.Option>
                    <Select.Option value="Credit Card">
                      Credit Card
                    </Select.Option>
                  </Select>
                </div>
                <div className="payment-amount mb-4 flex gap-4 items-center">
                  <h4 className="text-md font-semibold text-gray-600">
                    Customer Payment:
                  </h4>
                  <InputNumber
                    className="flex-1 border rounded-lg p-2"
                    value={paymentAmount}
                    onChange={handlePaymentAmountChange}
                    placeholder="Enter payment amount"
                  />
                </div>
                <div className="mb-4 flex gap-4 items-center">
                  <h4 className="text-md font-semibold text-gray-600">
                    Customer Change:
                  </h4>
                  <InputNumber
                    className="flex-1 border rounded-lg p-2"
                    value={change}
                    disabled
                  />
                </div>

                <Button
                  type="primary"
                  block
                  size="large"
                  className="mt-6 bg-blue-500 hover:bg-blue-600 border-none rounded-lg"
                  onClick={handleOrderSubmission}
                  loading={loading}
                >
                  Process Order
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
