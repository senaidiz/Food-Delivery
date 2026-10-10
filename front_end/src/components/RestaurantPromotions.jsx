import { API_URL } from "../config";
import { useEffect, useState } from "react";
import "../styles/RestaurantPromotions.css";

export default function RestaurantPromotions({ restaurantId }) {
  const [promos, setPromos] = useState([]);
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    async function fetchPromos() {
      try {
        const res = await fetch(
          `${API_URL}/promotions/restaurant/${restaurantId}`
        );
        const data = await res.json();
        setPromos(data);
      } catch (err) {
        console.error("Failed to load promotions", err);
      }
    }

    fetchPromos();
  }, [restaurantId]);

  function copyCode(code) {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);

    setTimeout(() => setCopiedCode(null), 2000);
  }

  if (promos.length === 0) return null;

return (
  <div className="promo-strip">
    {promos.map((promo) => (
      <div key={promo.promo_id} className="promo-chip">
        <span className="promo-icon">%</span>

        <div className="promo-text">
          <strong>{promo.code}</strong>
          <span>{promo.discount_percent}% OFF</span>
        </div>

        <button
          className="promo-copy-btn"
          onClick={() => copyCode(promo.code)}
        >
          {copiedCode === promo.code ? "Copied" : "Copy"}
        </button>
      </div>
    ))}
  </div>
);

}
