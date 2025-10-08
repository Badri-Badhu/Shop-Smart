import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ProductAddForm from "./Product Requirements/ProductAddForm";
import "../css/ProductManagement.css";
import FlashMessage from "../../components/common/FlashMessage";
import ProductHandler from "./Product Requirements/ProductHandler";
import DealerOrderPage from "./Product Requirements/DealerOrderPage";
import MyAnalyticsPage from "./Product Requirements/MyAnalyticsPage";

const ProductManagement = () => {
  const [activeTab, setActiveTab] = useState("productadder");
  const [searchParams, setSearchParams] = useSearchParams();
  const [flash, setFlash] = useState({ message: "", type: "" });

  // Corrected useEffect with dependencies
  useEffect(() => {
    const currentTab = searchParams.get("tab");
    if (currentTab) {
      setActiveTab(currentTab);
    }
  }, [searchParams]);

  const showFlash = (message, type) => {
    setFlash({ message, type });
  };
  
  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
    setSearchParams({ tab: tabName });
  };
  
  return (
    <div className="product-dashboard">
      {flash.message && (
        <FlashMessage
          message={flash.message}
          type={flash.type}
          onClose={() => setFlash({ message: "", type: "" })}
        />
      )}
      {/* Tabs */}
      <div className="product-tabs">
        <button
          className={activeTab === "productadder" ? "active" : ""}
          onClick={() => handleTabClick("productadder")}
        >
          Add Product
        </button>

        <button
          className={activeTab === "producthandler" ? "active" : ""}
          onClick={() => handleTabClick("producthandler")}
        >
          Manage Products
        </button>

        <button
          className={activeTab === "orders" ? "active" : ""}
          onClick={() => handleTabClick("orders")}
        >
          Orders Management
        </button>

        <button
          className={activeTab === "stats" ? "active" : ""}
          onClick={() => handleTabClick("stats")}
        >
          My Analytics
        </button>
      </div>

      {/* Content */}
      <div className={`product-content${activeTab === "orders" ? "no-padding" : ""}`}>
        {activeTab === "productadder" && <ProductAddForm showFlash={showFlash} />}
        {activeTab === "producthandler" && (
          <ProductHandler showFlash={showFlash} />
        )}
        {activeTab === "orders" && (
          <DealerOrderPage showFlash={showFlash} />
        )}
        {activeTab === "stats" && (
          <MyAnalyticsPage showFlash={showFlash} />
        )}
      </div>
    </div>
  );
};

export default ProductManagement;
