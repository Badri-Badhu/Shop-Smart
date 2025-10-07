import React, { useEffect, useState } from "react";
import axios from "axios";
import "./css/MyAnalyticsPage.css"; 

import { Bar, Line, Pie } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

// ---------- KPI Card Component ----------
const KpiCard = ({ title, value }) => (
  <div className="kpi-card">
    <h3 className="kpi-title">{title}</h3>
    <p className="kpi-value">{value}</p>
  </div>
);

// ---------- Currency Formatter ----------
const formatCurrency = (num) => `₹${(num ?? 0).toLocaleString()}`;

// ---------- Main Analytics Page ----------
const MyAnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (!token || !storedUser) {
          setError("Dealer not logged in or user data missing.");
          setLoading(false);
          return;
        }

        const user = JSON.parse(storedUser);
        const dealerId = user._id;

        if (!dealerId) {
          setError("Dealer ID not found in user data.");
          setLoading(false);
          return;
        }

        const { data } = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/products/analytics/dealer?dealerId=${dealerId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAnalytics(data);
      } catch (err) {
        console.error("Analytics fetch error:", err);
        setError("Failed to fetch analytics.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) return <div className="loading-message">Loading analytics…</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!analytics) return <div className="loading-message">No analytics found</div>;

  const totalRevenue = (analytics.earnedRevenue ?? 0) + (analytics.pendingRevenue ?? 0);

  // ---------- Chart Data ----------
  const orderTrendData = {
    labels: analytics.orderTrend?.map((item) => item.date) || [],
    datasets: [
      {
        label: "Orders",
        data: analytics.orderTrend?.map((item) => item.orders) || [],
        borderWidth: 2,
        borderColor: "#0f9e99",
        backgroundColor: "rgba(15, 158, 153, 0.1)",
        fill: true,
      },
    ],
  };

  const topProductsData = {
    labels: analytics.topProducts?.map((item) => item.name) || [],
    datasets: [
      {
        label: "Top Products",
        data: analytics.topProducts?.map((item) => item.count) || [],
        backgroundColor: [
          "rgba(75, 192, 192, 0.6)",
          "rgba(255, 159, 64, 0.6)",
          "rgba(153, 102, 255, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 99, 132, 0.6)",
        ],
      },
    ],
  };

  const orderStatusData = {
    labels: ["Pending", "Confirmed", "Packed", "Shipped", "Out for Delivery", "Delivered", "Cancelled"],
    datasets: [
      {
        label: "Order Status",
        data: [
          analytics.Pending ?? 0,
          analytics.Confirmed ?? 0,
          analytics.Packed ?? 0,
          analytics.Shipped ?? 0,
          analytics["Out for Delivery"] ?? 0,
          analytics.Delivered ?? 0,
          analytics.Cancelled ?? 0,
        ],
        backgroundColor: [
          "rgba(255, 206, 86, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 159, 64, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(255, 99, 132, 0.6)",
          "rgba(153, 102, 255, 0.6)",
          "rgba(201, 203, 207, 0.6)",
        ],
      },
    ],
  };

  const revenueDiscountData = {
    labels: ["Earned Revenue", "Pending Revenue", "Dealer Discount"],
    datasets: [
      {
        label: "₹ Amount",
        data: [
          analytics.earnedRevenue ?? 0,
          analytics.pendingRevenue ?? 0,
          analytics.totalDealerDiscount ?? 0,
        ],
        backgroundColor: [
          "rgba(75, 192, 192, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 99, 132, 0.6)",
        ],
      },
    ],
  };

  const ordersByCategoryData = {
    labels: analytics.ordersByCategory?.map((item) => item.category) || [],
    datasets: [
      {
        label: "Orders",
        data: analytics.ordersByCategory?.map((item) => item.count) || [],
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)",
        ],
      },
    ],
  };

  return (
    <div className="analytics-container">
      <h1 className="page-title">My Analytics</h1>

      {/* KPI Grid */}
      <div className="kpi-grid">
        <KpiCard title="Total Orders" value={analytics.totalOrders ?? 0} />
        <KpiCard title="Total Revenue" value={formatCurrency(totalRevenue)} />
        <KpiCard title="Earned Revenue" value={formatCurrency(analytics.earnedRevenue)} />
        <KpiCard title="Pending Revenue" value={formatCurrency(analytics.pendingRevenue)} />
        <KpiCard title="Avg Order Value" value={formatCurrency(analytics.avgOrderValue)} />
        <KpiCard title="Total Website Discount" value={formatCurrency(analytics.totalDealerDiscount)} />
        <KpiCard title="Pending Orders" value={analytics.Pending ?? 0} />
        <KpiCard title="Confirmed Orders" value={analytics.Confirmed ?? 0} />
        <KpiCard title="Packed Orders" value={analytics.Packed ?? 0} />
        <KpiCard title="Shipped Orders" value={analytics.Shipped ?? 0} />
        <KpiCard title="Out for Delivery" value={analytics["Out for Delivery"] ?? 0} />
        <KpiCard title="Delivered Orders" value={analytics.Delivered ?? 0} />
        <KpiCard title="Cancelled Orders" value={analytics.Cancelled ?? 0} />
      </div>

      {/* Top Charts Grid */}
      <div className="chart-grid">
        <div className="chart-section">
          <div className="chart-card">
            <h3 className="chart-heading">Orders Over Time</h3>
            <Line data={orderTrendData} />
          </div>
        </div>

        <div className="chart-section">
          <div className="chart-card">
            <h3 className="chart-heading">Top Products</h3>
            <Bar data={topProductsData} />
          </div>
        </div>
      </div>

      {/* Bottom Charts Layout: Pie on left, Bar charts stacked on right */}
      <div className="bottom-charts-container">
        {/* Pie Chart on Left */}
        <div className="chart-card chart-section pie-chart-column">
          <h3 className="chart-heading">Order Status Distribution</h3>
          <div className="pie-chart-content-wrapper">
            <Pie data={orderStatusData} />
          </div>
        </div>

        {/* Bar Charts Stacked on Right */}
        <div className="bar-charts-stacked-column">
          <div className="chart-card chart-section stacked-bar-card">
            <h3 className="chart-heading">Revenue vs Dealer Discount</h3>
            <Bar data={revenueDiscountData} />
          </div>
          <div className="chart-card chart-section stacked-bar-card">
            <h3 className="chart-heading">Orders by Category</h3>
            <Bar data={ordersByCategoryData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAnalyticsPage;