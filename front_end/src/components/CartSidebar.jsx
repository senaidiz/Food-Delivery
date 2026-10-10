import { API_URL } from "../config";
import { useEffect, useState } from "react";
import PaymentProcessor from "../components/PaymentProcessor";
import "../styles/CartSidebar.css";

export default function CartSidebar({ isOpen, onClose }) {
  const [cartItems, setCartItems] = useState([]);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromotion, setAppliedPromotion] = useState(null);
  const [restaurantId, setRestaurantId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userAddress, setUserAddress] = useState(null);
  const [showAddressPrompt, setShowAddressPrompt] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [userCards, setUserCards] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  //load cart and user info from backend
  async function loadCartAndUser() {
    const token = localStorage.getItem("token");
    setLoading(true);

    try {
      //load cart
      const cartRes = await fetch(`${API_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const cartData = await cartRes.json();
      setCartItems(cartData.items || []);

      //get restaurant id from first item
      if (cartData.items && cartData.items.length > 0) {
        const firstRestaurantId = cartData.items[0]?.restaurant_id;
        if (firstRestaurantId) {
          setRestaurantId(firstRestaurantId);

          const allSameRestaurant = cartData.items.every(
            item => item.restaurant_id === firstRestaurantId
          );
        }
      } else {
        setRestaurantId(null);
      }

      //load user info to get address
      const userRes = await fetch(`${API_URL}/auth/user`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (userRes.ok) {
        const userData = await userRes.json();
        setUserAddress(userData.address);
      }

    } catch (err) {
      console.error("Failed to load cart or user info:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isOpen) loadCartAndUser();
  }, [isOpen]);

  //delete cart item
  async function deleteItem(cartItemId) {
    const token = localStorage.getItem("token");

    try {
      await fetch(`${API_URL}/cart/${cartItemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      //refresh cart
      loadCartAndUser();
    } catch (err) {
      console.error("Failed to delete item:", err);
      alert("Failed to delete item from cart");
    }
  }

  //apply promotion code for that restaurant
  async function applyPromoCode() {
    if (!promoCode.trim()) {
      alert("Please enter a promo code");
      return;
    }

    if (!restaurantId) {
      alert("Cannot apply promo code to empty cart or cart with items from different restaurants");
      return;
    }

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_URL}/promotions/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          promo_code: promoCode,
          restaurant_id: restaurantId
        })
      });

      const data = await res.json();

      if (data.error) {
        alert(data.error);
        return;
      }

      setAppliedPromotion(data.promotion);
      alert(`Promo code applied! You get ${data.promotion.discount_percent}% off`);
    } catch (err) {
      console.error("Failed to apply promo:", err);
      alert("Invalid promo code or expired");
    }
  }

  //update quantity
  async function updateQuantity(cartItemId, newQuantity) {
    if (newQuantity < 1) {
      //if quantity becomes zero, remove item
      deleteItem(cartItemId);
      return;
    }

    const token = localStorage.getItem("token");

    try {
      await fetch(`${API_URL}/cart/${cartItemId}/quantity`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ quantity: newQuantity })
      });

      //refresh cart
      loadCartAndUser();
    } catch (err) {
      console.error("Failed to update quantity:", err);
      alert("Failed to update quantity");
    }
  }

  //remove promotion
  function removePromotion() {
    setAppliedPromotion(null);
    setPromoCode("");
  }

  //calculate subtotal
  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const basePrice = Number(item.price_at_add || 0);
      const optionsTotal = item.options?.reduce((sum, opt) =>
        sum + Number(opt.additional_price || 0), 0) || 0;
      const pricePerItem = basePrice + optionsTotal;
      const itemTotal = pricePerItem * item.quantity;
      return total + itemTotal;
    }, 0);
  };

  //calculate discount
  const calculateDiscount = () => {
    if (!appliedPromotion) return 0;
    const subtotal = calculateSubtotal();
    return (subtotal * appliedPromotion.discount_percent) / 100;
  };

  //calculate total
  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    return subtotal - discount;
  };

  async function processPayment() {
    if (!selectedCardId) {
      alert("Please select a payment method");
      return;
    }

    const token = localStorage.getItem("token");

    //show processing modal
    setPaymentProcessing(true);
    setShowPaymentModal(false);

    try {
      //payment processing with steps
      const steps = [
        "Initializing payment...",
        "Validating card details...",
        "Processing payment...",
        "Verifying transaction...",
        "Finalizing order..."
      ];

      //show each step with delay
      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      //actual order creation
      const orderData = {
        promo_code: appliedPromotion?.code || null
      };

      const res = await fetch(`${API_URL}/orders/from-cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      const data = await res.json();

      if (data.error) {
        setPaymentProcessing(false);
        alert("Failed to place order: " + data.error);
        return;
      }

      //show success for 2 seconds
      await new Promise(resolve => setTimeout(resolve, 2000));

      setPaymentProcessing(false);

      if (data.orders && data.orders.length > 1) {
        alert(`Payment successful! Created ${data.orders.length} separate orders for different restaurants.`);
      } else {
        alert("Payment successful! Order placed successfully!");
      }

      onClose();
      setCartItems([]);
      setAppliedPromotion(null);
      setPromoCode("");
      setRestaurantId(null);
      setUserAddress(null);
      window.location.reload();
    } catch (err) {
      console.error("Failed to process payment:", err);
      setPaymentProcessing(false);
      alert("Payment failed. Please try again.");
    }
  }

  async function submitOrder() {
    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    if (!userAddress || userAddress.trim() === "") {
      setShowAddressPrompt(true);
      return;
    }

    //load user cards first
    await loadUserCards();

    if (userCards.length === 0) {
      //if no cards exist, show payment modal with option to add card
      setShowPaymentModal(true);
    } else {
      //show payment modal with card selection
      setShowPaymentModal(true);
    }
  }

  const handlePaymentSuccess = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("Please log in to place a demo order.");
    }

    const orderData = {
      promo_code: appliedPromotion?.code || null
    };

    const res = await fetch(
      `${API_URL}/orders/from-cart`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      }
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));

      throw new Error(
        errorData.error || "Failed to create demo order"
      );
    }

    setShowPaymentModal(false);

    alert("Demo order placed successfully! No payment was charged.");

    onClose();
    setCartItems([]);
    setAppliedPromotion(null);
    setPromoCode("");
    setRestaurantId(null);

    window.location.reload();
  };


  function goToAccountPage() {
    onClose(); //close cart sidebar
    window.location.href = "/account"; //navigate to account page
  }

  //load credit cards
  async function loadUserCards() {
    const token = localStorage.getItem("token");

    try {
      //get user info
      const userRes = await fetch(`${API_URL}/auth/user`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (userRes.ok) {
        const userData = await userRes.json();

        //get user's credit cards
        const cardsRes = await fetch(`${API_URL}/credit-cards`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (cardsRes.ok) {
          const cardsData = await cardsRes.json();
          setUserCards(cardsData);

          //set default card if exists
          const defaultCard = cardsData.find(card => card.is_default);
          if (defaultCard) {
            setSelectedCardId(defaultCard.card_id);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load credit cards:", err);
    }
  }

  return (
    <div className={`cart-sidebar ${isOpen ? "open" : ""}`}>
      <div className="cart-header">
        <h2>Your Cart</h2>
        <button onClick={onClose} className="cart-close-btn">✖</button>
      </div>

      <hr />

      {/* Address Warning Banner */}
      {(!userAddress || userAddress.trim() === "") && cartItems.length > 0 && (
        <div className="address-warning">
          <i className="fa-solid fa-map-marker-alt"></i>
          <span>Please add a delivery address to place an order</span>
          <button onClick={goToAccountPage} className="add-address-btn">
            Add Address
          </button>
        </div>
      )}

      {/* Address Prompt Modal */}
      {showAddressPrompt && (
        <div className="modal-overlay">
          <div className="address-prompt-modal">
            <h3>Delivery Address Required</h3>
            <p>You need to add a delivery address to place an order.</p>
            <div className="modal-buttons">
              <button
                onClick={goToAccountPage}
                className="modal-primary-btn"
              >
                Go to Account to Add Address
              </button>
              <button
                onClick={() => setShowAddressPrompt(false)}
                className="modal-secondary-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Promotion Section */}
      <div className="promotion-section">
        <h3>Promo Code</h3>
        {appliedPromotion ? (
          <div className="applied-promo">
            <p>
              <strong>{appliedPromotion.code}</strong> - {appliedPromotion.discount_percent}% off
              <button onClick={removePromotion} className="remove-promo-btn">Remove</button>
            </p>
            <small>{appliedPromotion.description}</small>
          </div>
        ) : (
          <div className="promo-input-group">
            <input
              type="text"
              placeholder="Enter promo code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              className="promo-input"
              disabled={!restaurantId || cartItems.length === 0}
            />
            <button
              onClick={applyPromoCode}
              className="apply-promo-btn"
              disabled={!restaurantId || cartItems.length === 0}
            >
              Apply
            </button>
          </div>
        )}
        {(!restaurantId || cartItems.length === 0) && !appliedPromotion && (
          <small className="promo-note">Add items to cart to apply promo codes</small>
        )}
      </div>

      <hr />

      <div className="cart-items">
        {loading ? (
          <p>Loading cart...</p>
        ) : cartItems.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          cartItems.map(item => {
            const itemTotal = (Number(item.price_at_add || 0) +
              (item.options?.reduce((sum, opt) => sum + Number(opt.additional_price || 0), 0) || 0)) * item.quantity;

            return (
              <div key={item.cart_item_id} className="cart-entry">
                <img src={item.image_url || "/placeholder-food.jpg"} alt={item.name} className="cart-img" />

                <div className="cart-info">
                  <h4>{item.name}</h4>
                  <p>Base: {item.price_at_add || 0} ₺</p>

                  {/* Add Quantity Controls */}
                  <div className="cart-quantity">
                    <button
                      className="quantity-btn-small"
                      onClick={() => updateQuantity(item.cart_item_id, item.quantity - 1)}
                    >
                      −
                    </button>
                    <span className="quantity-display-small">{item.quantity}</span>
                    <button
                      className="quantity-btn-small"
                      onClick={() => updateQuantity(item.cart_item_id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>

                  {item.options?.length > 0 && (
                    <ul className="cart-options">
                      {item.options.map(opt => (
                        <li key={opt.option_id}>
                          ➕ {opt.name} (+{opt.additional_price || 0} ₺)
                        </li>
                      ))}
                    </ul>
                  )}

                  <strong>Item Total: {itemTotal.toFixed(2)} ₺</strong>
                </div>

                <button
                  className="cart-delete-btn"
                  onClick={() => deleteItem(item.cart_item_id)}
                >
                  🗑
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Order Summary */}
      {cartItems.length > 0 && (
        <div className="order-summary">
          <hr />
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>{calculateSubtotal().toFixed(2)} ₺</span>
          </div>

          {appliedPromotion && (
            <div className="summary-row discount">
              <span>Discount ({appliedPromotion.discount_percent}%):</span>
              <span>-{calculateDiscount().toFixed(2)} ₺</span>
            </div>
          )}

          <div className="summary-row total">
            <span><strong>Total:</strong></span>
            <span><strong>{calculateTotal().toFixed(2)} ₺</strong></span>
          </div>
        </div>
      )}

      {cartItems.length !== 0 && (
        <button
          className="order-button"
          onClick={submitOrder}
          disabled={!userAddress || userAddress.trim() === ""}
          title={!userAddress ? "Please add a delivery address first" : ""}
        >
          {!userAddress ? "Add Address to Order" : "Order Now!"}
        </button>
      )}

      {showPaymentModal && (
        <div className="modal-overlay">
          <div className="payment-modal-container">
            <PaymentProcessor
              amount={calculateTotal()}
              selectedCard={selectedCard}
              onSuccess={handlePaymentSuccess}
              onCancel={() => setShowPaymentModal(false)}
              showDemoTips={true}
            />
          </div>
        </div>
      )}

      {paymentProcessing && (
        <div className="modal-overlay">
          <div className="payment-processing-modal">
            <div className="payment-spinner"></div>
            <h3>Processing Payment...</h3>
            <p>Please wait while we process your payment.</p>
            <div className="payment-progress">
              <div className="progress-bar">
                <div className="progress-fill"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}