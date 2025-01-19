/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Button,
  Divider,
  Input,
  InputNumber,
  Pagination,
  Select,
  Tabs,
} from "antd";
import { currencyFormat } from "../../../../utils/utils";
import usePos from "./usePos";
import { useEffect, useState } from "react";
import styled from "styled-components";
import Receipt from "./receipt";

const { Search } = Input;

const StyledSearch = styled(Search)`
  &.ant-input-search {
    width: 100%;
    max-width: 600px;

    .ant-input {
      height: 40px;
      transition: border-color 0.3s;
      padding: 2px !important;
    }

    .ant-input-group-addon {
      background-color: #b0e0e6;
    }

    .ant-btn {
      background-color: #b0e0e6;
      color: black;
      border: none;
      border-radius: 8px;
      height: 40px;
      font-weight: bold;

      &:hover {
        background-color: #357abd;
      }
    }
  }
`;

export const PointofSalePage = () => {
  const {
    handleAddToCart,
    handleCategoryChange,
    handleOrderSubmission,
    handlePaymentAmountChange,
    handleQuantityChange,
    setPaymentMethod,
    setGcashCustomerInfo,
    setGcashReference,
    setOrderSuccess,
    setCart,
    setPaymentAmount,
    setChange,
    gcashCustomerInfo,
    gcashReference,
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
    orderSuccess,
  } = usePos();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const handleReset = () =>{
    setCart([]);
    setPaymentAmount(0);
    setChange(0);
    setOrderSuccess(false)
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleSearchChange = (e: any) => {
    setSearchTerm(e.target.value);
  };

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedProducts = products
    .filter(
      (p) =>
        (!selectedCategory || p.category.toString() === selectedCategory) &&
        (!debouncedSearchTerm ||
          p.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
    )
    .slice(startIndex, endIndex);

  const handlePageChange = (page: number, pageSize: number) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  const renderGCashFields = () => (
    <>
      <div className="gcash-reference mb-4 flex gap-4 items-center">
        <h4 className="text-md font-semibold text-gray-600">
          Reference Number:
        </h4>
        <Input
          className="flex-1 border rounded-lg p-2"
          value={gcashReference}
          onChange={(e) => setGcashReference(e.target.value)}
          placeholder="Enter GCash reference number"
        />
      </div>
      <div className="gcash-customer mb-4 flex gap-4 items-center">
        <h4 className="text-md font-semibold text-gray-600">
          Customer Name/Number:
        </h4>
        <Input
          className="flex-1 border rounded-lg p-2"
          value={gcashCustomerInfo}
          onChange={(e) => setGcashCustomerInfo(e.target.value)}
          placeholder="Enter customer name or number"
        />
      </div>
    </>
  );
  return (
    <div className="min-h-screen p-4 bg-gray-100">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <h2 className="text-2xl md:text-3xl font-semibold mb-2 md:mb-0">
          Point of Sale
        </h2>
        <p className="text-gray-600">{currentDateTime}</p>
      </div>

      <Divider className="my-4" />

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Products Section */}
        <div className="flex-1">
          <Tabs
            type="card"
            defaultActiveKey="0"
            items={items}
            onChange={handleCategoryChange}
          />
          <div className="p-4 flex justify-between items-center">
            <StyledSearch
              placeholder="Search for products..."
              allowClear
              enterButton="Search"
              size="small"
              onSearch={(e) => handleSearchChange(e)}
              onChange={(e) => handleSearchChange(e)}
              className="w-full md:w-2/3 lg:w-1/2"
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
            {paginatedProducts
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
                      : "border-2 border-gray-300 bg-gray-300 text-gray-900"
                  } transition ease-in-out duration-300 shadow-md rounded-lg p-4 min-h-[220px] cursor-pointer flex flex-col items-center justify-center`}
                  onClick={() => orderSuccess ? null : handleAddToCart(product)}
                >
                  <img
                    className="w-[80px] h-[80px] md:w-[100px] md:h-[100px] rounded-full mb-2"
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
                  {product?.returnDays && (
                    <p className="text-center">
                      Return Period: {product.returnDays}
                    </p>
                  )}
                </div>
              ))}
          </div>
          <div className="w-full flex justify-center items-center">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={
                products.filter(
                  (p) =>
                    !selectedCategory ||
                    p.category.toString() === selectedCategory
                ).length
              }
              onChange={handlePageChange}
              className="mt-4 text-center"
            />
          </div>
        </div>

        {/* Cart Section */}
        <div className="w-full lg:w-[400px] border-l-2 lg:border-l pl-4 min-h-screen bg-white shadow-lg rounded-lg p-4">
          {orderSuccess ? (<div>
            <div>
              <Receipt
                cart={cart}
                subtotal={subtotal}
                grandTotal={grandTotal}
                paymentAmount={paymentAmount}
                change={change}
                handleReset={() => handleReset()}
              />
            </div>
          </div>) : (<div>
            <h3 className="text-2xl font-semibold mb-6 border-b pb-2 text-gray-700">
            Cart
          </h3>
          {cart.length > 0 ? (
            cart.map((item) => (
              <div
                className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200"
                key={item.product.id}
              >
                <div className="grid grid-cols-5 items-center justify-between gap-4">
                  <div className="col-span-1 items-center gap-4">
                    <img
                      src={item.img}
                      className="w-[60px] h-[60px] object-cover rounded-lg"
                      alt={item.product.name}
                    />
                  </div>
                  <div className="col-span-4 w-full flex flex-col gap-2">
                    <span className="font-medium text-gray-700 text-lg break-words">
                      {item.product.name}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        size="middle"
                        className="border-gray-300"
                        onClick={() =>
                          handleQuantityChange(
                            item.product.id,
                            item.quantity - 1
                          )
                        }
                      >
                        -
                      </Button>
                      <InputNumber
                        min={1}
                        value={item.quantity}
                        className="w-16 border border-gray-300 text-center rounded"
                        onChange={(value) =>
                          handleQuantityChange(item.product.id, value)
                        }
                      />
                      <Button
                        size="middle"
                        className="border-gray-300"
                        onClick={() =>
                          handleQuantityChange(
                            item.product.id,
                            item.quantity + 1
                          )
                        }
                      >
                        +
                      </Button>
                    </div>
                    <span className="font-semibold text-end w-full text-lg text-gray-700">
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
                        <Divider className="my-6" />
              <div className="cart-summary p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
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
                  </Select>
                </div>
                {paymentMethod === "GCash" && renderGCashFields()}
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
          </div>)}

        </div>
      </div>
    </div>
  );
};
