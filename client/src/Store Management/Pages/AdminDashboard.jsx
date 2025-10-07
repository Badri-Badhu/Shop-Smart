import React, { useState , useEffect } from "react";
import { useSearchParams } from "react-router-dom"; // ✅ Import useSearchParams
import '../css/AdminDashboard.css'
import CouponManager from "./Admin Requirements/CouponManager";
import DealerApplications from "./Admin Requirements/DealerApplications";
import DealerList from "./Admin Requirements/DealerList";
import CustomerStats from "./Admin Requirements/CustomerStats";
import PendingOrders from "./Admin Requirements/PendingOrders";
import AllOrders from "./Admin Requirements/AllOrders";
import FlashMessage from "../../components/common/FlashMessage";
const AdminDashboard = () => {
    const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("dealer");
const [flash, setFlash] = useState({ message: "", type: "" });
const showFlash = (message, type) => {
    setFlash({ message, type });
  };
  useEffect(() => {
    const currentTab = searchParams.get("tab");
    if (currentTab) {
      setActiveTab(currentTab);
    }
  }, [searchParams]);

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
    setSearchParams({ tab: tabName }); // ✅ Update the URL when a tab is clicked
  };
  return (
    <div className="admin-dashboard">
        {flash.message && (
        <FlashMessage
          message={flash.message}
          type={flash.type}
          onClose={() => setFlash({ message: "", type: "" })}
        />
      )}
      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={activeTab === "dealer" ? "active" : ""}
          onClick={() => handleTabClick("dealer")}
        >
          Dealer List
        </button>
        <button
          className={activeTab === "requests" ? "active" : ""}
          onClick={() => handleTabClick("requests")}
        >
          Request Notifications
        </button>
        <button
          className={activeTab === "Coupon" ? "active" : ""}
          onClick={() => handleTabClick("Coupon")}
        >
          Coupon Manager
        </button>
        <button
          className={activeTab === "stats" ? "active" : ""}
          onClick={() => handleTabClick("stats")}
        >
          Customer stats
        </button>
        <button
          className={activeTab === "orders" ? "active" : ""}
          onClick={() => handleTabClick("orders")}
        >
          Pending Orders
        </button>
          <button
          className={activeTab === "allorders" ? "active" : ""}
          onClick={() => handleTabClick("allorders")}
        >
          All Orders
        </button>
      </div>

      {/* Content */}
      <div className="admin-content">
        {activeTab === "dealer" && <DealerList showFlash={showFlash} />}
        {activeTab === "requests" && <DealerApplications showFlash={showFlash}/>}
        {activeTab === "Coupon" && <CouponManager showFlash={showFlash} />}
        {activeTab === "stats" && <CustomerStats showFlash={showFlash} />}
        {activeTab === "orders" && <PendingOrders showFlash={showFlash} />}
        {activeTab === "allorders" && <AllOrders showFlash={showFlash} />}

      </div>
    </div>
  );
};

export default AdminDashboard;
