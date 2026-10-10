import { API_URL } from "../../config";
import React, { useState, useEffect } from "react";
import "../../styles/PromoManager.css";

function PromoManager({ restaurant, close }) {
  const [promotions, setPromotions] = useState([]);
  const [newPromo, setNewPromo] = useState({
    code: "",
    description: "",
    discount_percent: 10,
    valid_from: new Date().toISOString().split('T')[0],
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(true);//for page loading

  //get promotions from backend per restaurants
  useEffect(() => {
    fetchPromotions();
  }, [restaurant.restaurant_id]);

  const fetchPromotions = async () => {
    try {
      const response = await fetch(`${API_URL}/promotions/restaurant/${restaurant.restaurant_id}`);
      const data = await response.json();
      setPromotions(data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch promotions:", error);
      setLoading(false);
    }
  };

  //create a new promo for restaurant
  const createPromotion = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${API_URL}/promotions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("adminToken")}`
        },
        body: JSON.stringify({
          restaurant_id: restaurant.restaurant_id,
          ...newPromo
        })
      });

      if (!response.ok) throw new Error("Failed to create promotion");

      const data = await response.json();
      
      //refresh promotions
      fetchPromotions();
      
      //reset form
      setNewPromo({
        code: "",
        description: "",
        discount_percent: 10,
        valid_from: new Date().toISOString().split('T')[0],
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
      
      alert("Promotion created successfully!");
    } catch (error) {
      console.error("Error creating promotion:", error);
      alert("Failed to create promotion");
    }
  };

  //deactivate a promo
  const deactivatePromotion = async (promoId) => {
    if (!window.confirm("Are you sure you want to deactivate this promotion?")) return;

    try {
      const response = await fetch(`${API_URL}/promotions/${promoId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("adminToken")}`
        },
        body: JSON.stringify({ is_active: false })
      });

      if (!response.ok) throw new Error("Failed to deactivate promotion");

      //refresh promotions
      fetchPromotions();
      
      alert("Promotion deactivated successfully!");
    } catch (error) {
      console.error("Error deactivating promotion:", error);
      alert("Failed to deactivate promotion");
    }
  };

  if (loading) {
    return (
      <div className="popup-overlay">
        <div className="popup-box">
          <p>Loading promotions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="popup-overlay">
      <div className="popup-box promo-manager-box">
        <div className="promo-manager-header">
          <h3>Manage Promotions – {restaurant.name}</h3>
          <button className="close-btn" onClick={close}>×</button>
        </div>

        {/* Existing Promotions */}
        <div className="promotions-list">
          <h4>Active Promotions ({promotions.length})</h4>
          {promotions.length === 0 ? (
            <p className="no-promotions">No active promotions. Create your first one below.</p>
          ) : (
            <div className="promotions-grid">
              {promotions.map(promo => (
                <div key={promo.promo_id} className="promotion-card">
                  <div className="promotion-header">
                    <h5>{promo.code}</h5>
                    <span className="discount-badge">{promo.discount_percent}% OFF</span>
                  </div>
                  <p className="promo-description">{promo.description}</p>
                  <div className="promo-dates">
                    <small>Valid: {new Date(promo.valid_from).toLocaleDateString()} - {new Date(promo.valid_until).toLocaleDateString()}</small>
                  </div>
                  <button 
                    className="deactivate-btn"
                    onClick={() => deactivatePromotion(promo.promo_id)}
                  >
                    Deactivate
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create New Promotion Form */}
        <div className="create-promo-form">
          <h4>Create New Promotion</h4>
          <form onSubmit={createPromotion}>
            <div className="form-row">
              <input
                type="text"
                placeholder="Promo Code (e.g., SAVE20)"
                value={newPromo.code}
                onChange={(e) => setNewPromo({...newPromo, code: e.target.value})}
                required
              />
              <input
                type="number"
                placeholder="Discount %"
                min="1"
                max="100"
                value={newPromo.discount_percent}
                onChange={(e) => setNewPromo({...newPromo, discount_percent: parseInt(e.target.value)})}
                required
              />
            </div>
            <textarea
              placeholder="Description (e.g., 20% off all items)"
              value={newPromo.description}
              onChange={(e) => setNewPromo({...newPromo, description: e.target.value})}
              required
            />
            <div className="form-row">
              <div className="date-field">
                <label>Valid From:</label>
                <input
                  type="date"
                  value={newPromo.valid_from}
                  onChange={(e) => setNewPromo({...newPromo, valid_from: e.target.value})}
                  required
                />
              </div>
              <div className="date-field">
                <label>Valid Until:</label>
                <input
                  type="date"
                  value={newPromo.valid_until}
                  onChange={(e) => setNewPromo({...newPromo, valid_until: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="form-buttons">
              <button type="submit" className="create-btn">Create Promotion</button>
              <button type="button" className="cancel-btn" onClick={close}>
                Close
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default PromoManager;