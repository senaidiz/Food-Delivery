import { API_URL } from "../config";
import { useEffect, useState } from "react";

export default function OrderCard({ order, token }) {
    const [items, setItems] = useState([]);
    const [open, setOpen] = useState(false);
    const [delivery, setDelivery] = useState(null);
    const [promotion, setPromotion] = useState(null);

    //get order items from backend
    async function loadOrderItems() {
        if (items.length > 0) return;

        const res = await fetch(`${API_URL}/orders/${order.order_id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        setItems(data.items || []);
        setDelivery(data.delivery || null);
        setPromotion(data.promotion || null);
    }

    function toggleOpen() {
        if (!open) loadOrderItems();
        setOpen((prev) => !prev);
    }

    function handleButtonClick(e) {
        e.stopPropagation();
        toggleOpen();
    }

    //calculate item total with quantity and options
    const calculateItemTotal = (item) => {
        const basePrice = Number(item.price_at_purchase || 0);
        const optionsTotal = item.options?.reduce((sum, opt) => 
            sum + Number(opt.additional_price || 0), 0) || 0;
        return (basePrice + optionsTotal) * item.quantity;
    };

    return (
        <div className="order-card-box" onClick={toggleOpen}>
            {/* --- HEADER --- */}
            <div className="order-header">
                <div className="order-header-left">
                    <p className="order-restaurant">{order.restaurant_name}</p>

                    <span className={`status-badge ${order.status}`}>
                        {order.status}
                    </span>

                    <p className="order-updated">
                        Updated: {new Date(order.updated_at).toLocaleString()}
                    </p>
                    </div>

                    <div className="order-header-right">
                    <p className="order-total">{order.total_amount} ₺</p>

                    <button className="expand-btn" onClick={handleButtonClick}>
                        {open ? "▲" : "▼"}
                    </button>
                </div>
            </div>

            {/* --- DETAILS SECTION --- */}
            {open && (
                <div className="order-details">
                    <div className="order-items-list">
                        {items.map((it) => {
                        const itemTotal = calculateItemTotal(it);

                        return (
                            <div key={it.order_item_id} className="item-row">
                                <div className="item-row-header">
                                    <strong>{it.name}</strong>
                                    <span className="item-qty">× {it.quantity}</span>
                                    <span className="item-total">
                                    {itemTotal.toFixed(2)} ₺
                                    </span>
                                </div>

                                <div className="item-row-sub">
                                    <span className="base-price">
                                    Base: {it.price_at_purchase} ₺ each
                                    </span>

                                    {it.options?.length > 0 && (
                                    <ul className="item-options">
                                        {it.options.map((opt) => (
                                        <li key={opt.option_id}>
                                            + {opt.name} (+{opt.additional_price} ₺)
                                        </li>
                                        ))}
                                    </ul>
                                    )}
                                </div>
                            </div>
                        );
                        })}
                    </div>

                {/* Promotion Section */}
                {promotion && (
                    <div className="promotion-box">
                    <p>
                        <strong>Promotion Applied:</strong> {promotion.code}
                    </p>
                    <p>
                        <strong>Discount:</strong> {promotion.discount_percent}%
                    </p>
                    </div>
                )}

                {/* Delivery Section */}
                {delivery && (
                    <div className="delivery-box">
                    <p>
                        <strong>Driver:</strong> {delivery.driver_name}
                    </p>
                    <p>
                        <strong>Delivery Status:</strong> {delivery.status}
                    </p>
                    <p>
                        <strong>Assigned At:</strong>{" "}
                        {delivery.assigned_at
                        ? new Date(delivery.assigned_at).toLocaleString()
                        : "Unknown"}
                    </p>
                    </div>
                )}
                </div>
            )}
            </div>








    );
}