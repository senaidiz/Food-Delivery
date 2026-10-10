import { API_URL } from "../../config";
import React, { useEffect, useState } from "react";
import OrderStatusDropdown from "./OrderStatusDropdown";
import "../../styles/AdminOrders.css";

function AdminOrders({}) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true); //for page loading

  //get orders from backend
  useEffect(() => {
    async function fetchOrders() {
      try{
        const result = await fetch(`${API_URL}/orders/`);
        const data = await result.json();
        setOrders(data);
      }catch(err){
        console.error("Failed to load orders:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  //update order status to backend
  const updateStatus = async (orderId, newStatus) => {
    try {
      await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("adminToken")}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      //update local UI after updating status
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );

    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  if (loading) return <p>Loading orders...</p>;



  

  return (
  <div className="admin-orders">
    <h2 className="orders-page-title">Orders</h2>
    <div className="orders-wrapper">
        {orders.map(order => (
          <div key={order.id} className="order-card">

            {/* LEFT SIDE */}
            <div className="order-left">
              <div className="order-header">
                <h3 className="restaurant-name">{order.restaurant}</h3>
                <span className="order-id">Order #{order.id}</span>
              </div>

              <div className="order-info">
                <p><strong>User:</strong> {order.user}</p>
                <p><strong>Date:</strong> {new Date(order.date).toLocaleString()}</p>
              </div>

              <div className="order-items-section">
                <h4 className="items-title">Items</h4>

                <div className="order-items-table">
                  {order.items?.map((item, index) => (
                    <div key={index} className="order-item-row">
                      <span><b>Item Name:</b> {item.name}</span>
                      <span><b>Item Quantity:</b> x {item.quantity}</span>
                      <span><b>Item Total:</b> {item.itemTotal}₺</span>
                    </div>
                  ))}
                </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
            <div className="order-right">
              <span className="order-total">
                Total: {order.total}₺
              </span>

              <OrderStatusDropdown
                currentStatus={order.status}
                onChange={(newStatus) => updateStatus(order.id, newStatus)}
              />

              <span className={`status-badge ${order.status.toLowerCase()}`}>
                {order.status}
              </span>

            </div>

        </div>
        ))}
    </div>


  </div>


  );
}

export default AdminOrders;