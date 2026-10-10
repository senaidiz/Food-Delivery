import { API_URL } from "../config";
import { useEffect, useState } from "react";
import "../styles/ItemModal.css";

export default function ItemModal({ itemId, onClose, onAdd }) {
  const [item, setItem] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [quantity, setQuantity] = useState(1); //quantity state

  //load item info from backend
  useEffect(() => {
    async function loadItem() {
      const res = await fetch(`${API_URL}/menu/item/${itemId}`);
      const data = await res.json();
      setItem(data);
    }
    loadItem();
  }, [itemId]);

  //toggle item options
  function toggleOption(optId) {
    setSelectedOptions((prev) =>
      prev.includes(optId)
        ? prev.filter((id) => id !== optId)
        : [...prev, optId]
    );
  }

  //increare or decrease item quality
  function increaseQuantity() {
    setQuantity(prev => prev + 1);
  }

  function decreaseQuantity() {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  }

  if (!item) return null; //if item does not exist return null

  return (
    <div className="modal-backdrop">
      <div className="modal-box">
        <button className="modal-close-btn" onClick={onClose}> ✖</button>

        <img className="modal-img" src={item.image_url} alt={item.name} />

        <h2>{item.name}</h2>
        <p>{item.description}</p>
        <h3>Base Price: {item.price} ₺</h3>

        {/* Add Quantity Selector */}
        <div className="quantity-selector">
          <h3>Quantity</h3>
          <div className="quantity-controls">
            <button 
              className="quantity-btn" 
              onClick={decreaseQuantity}
              disabled={quantity <= 1}
            >
              −
            </button>
            <span className="quantity-display">{quantity}</span>
            <button 
              className="quantity-btn" 
              onClick={increaseQuantity}
            >
              +
            </button>
          </div>
        </div>

        <h3>Extras</h3>
        <div className="options-list">
          {item.options?.map((opt) => (
            <label key={opt.option_id} className="option-item">
              <input id="modal-input"
                type="checkbox"
                checked={selectedOptions.includes(opt.option_id)}
                onChange={() => toggleOption(opt.option_id)}
              />
              {opt.name} (+{opt.additional_price} ₺)
            </label>
          ))}
        </div>

        <button
          className="modal-add-btn"
          onClick={() => onAdd(item, selectedOptions, quantity)} //pass quantity
        >
          Add to Cart ({quantity})
        </button>
      </div>
    </div>
  );
}