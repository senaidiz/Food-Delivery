import { API_URL } from "../config";

import { useState, useEffect } from "react";
import "../styles/CreditCardSection.css";

const CREDIT_CARDS_URL = `${API_URL}/credit-cards`;

const emptyForm = {
  card_nickname: "",
  card_brand: "visa",
  last_four: "",
  expiry_month: "",
  expiry_year: ""
};

const cardBrands = {
  visa: "Visa",
  mastercard: "Mastercard",
  amex: "American Express"
};

export default function CreditCardSection({ token }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [formData, setFormData] = useState({ ...emptyForm });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setCards([]);
      setLoading(false);
      return;
    }

    let active = true;

    const load = async () => {
      setLoading(true);

      try {
        const res = await fetch(CREDIT_CARDS_URL, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!res.ok) throw new Error("Failed to load cards");

        const data = await res.json();

        if (active) {
          setCards(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error(err);
        if (active) {
          setErrors({ general: "Failed to load cards" });
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [token]);

  const loadCreditCards = async () => {
    try {
      const res = await fetch(CREDIT_CARDS_URL, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error("Failed to load cards");

      const data = await res.json();
      setCards(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setErrors({ general: "Failed to load cards" });
    }
  };

  const resetForm = () => {
    setFormData({ ...emptyForm });
    setEditingCard(null);
    setShowAddForm(false);
    setErrors({});
  };

  const startEdit = (card) => {
    setEditingCard(card);
    setFormData({
      card_nickname: card.card_nickname || "",
      card_brand: card.card_brand,
      last_four: card.last_four,
      expiry_month: String(card.expiry_month),
      expiry_year: String(card.expiry_year)
    });
    setErrors({});
    setShowAddForm(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    const month = Number(formData.expiry_month);
    const year = Number(formData.expiry_year);
    const now = new Date();

    if (!editingCard) {
      if (!cardBrands[formData.card_brand]) {
        newErrors.card_brand = "Select a valid card brand";
      }

      if (!/^\d{4}$/.test(formData.last_four)) {
        newErrors.last_four = "Enter exactly four digits";
      }
    }

    if (
      !Number.isInteger(month) ||
      month < 1 ||
      month > 12
    ) {
      newErrors.expiry_month = "Invalid month";
    }

    if (
      !Number.isInteger(year) ||
      year < now.getFullYear() ||
      (year === now.getFullYear() && month < now.getMonth() + 1)
    ) {
      newErrors.expiry_year = "Invalid expiry date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      card_nickname: formData.card_nickname.trim(),
      expiry_month: Number(formData.expiry_month),
      expiry_year: Number(formData.expiry_year)
    };

    if (!editingCard) {
      payload.card_brand = formData.card_brand;
      payload.last_four = formData.last_four;
    }

    try {
      const res = await fetch(
        editingCard
          ? `${CREDIT_CARDS_URL}/${editingCard.card_id}`
          : CREDIT_CARDS_URL,
        {
          method: editingCard ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save card");
      }

      resetForm();
      setSuccessMessage(
        editingCard
          ? "Demo card updated successfully!"
          : "Demo card added successfully!"
      );
      await loadCreditCards();
    } catch (err) {
      setErrors({ general: err.message });
    }
  };

  const handleDelete = async (cardId) => {
    if (!window.confirm("Delete this demo card?")) return;

    try {
      const res = await fetch(`${CREDIT_CARDS_URL}/${cardId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error("Failed to delete card");

      setSuccessMessage("Demo card deleted successfully!");
      await loadCreditCards();
    } catch (err) {
      setErrors({ general: err.message });
    }
  };

  const handleSetDefault = async (cardId) => {
    try {
      const res = await fetch(`${CREDIT_CARDS_URL}/${cardId}/default`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error("Failed to set default card");
      }

      setSuccessMessage("Default demo card updated!");
      await loadCreditCards();
    } catch (err) {
      setErrors({ general: err.message });
    }
  };

  const addDemoCards = async () => {
    const year = new Date().getFullYear();

    const demoCards = [
      {
        card_nickname: "My Primary Card",
        card_brand: "visa",
        last_four: "4242",
        expiry_month: 12,
        expiry_year: year + 2
      },
      {
        card_nickname: "Backup Card",
        card_brand: "mastercard",
        last_four: "4444",
        expiry_month: 6,
        expiry_year: year + 2
      }
    ];

    try {
      for (const card of demoCards) {
        const res = await fetch(CREDIT_CARDS_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(card)
        });

        if (!res.ok) throw new Error("Failed to add demo cards");
      }

      await loadCreditCards();
      setSuccessMessage("Demo cards added!");
    } catch (err) {
      setErrors({ general: err.message });
      await loadCreditCards();
    }
  };

  if (loading) {
    return <div className="loading-cards">Loading demo cards...</div>;
  }

  return (
    <div className="credit-cards-section">
      <div className="section-header">
        <h3>Payment Methods</h3>

        <div className="header-actions">
          {cards.length === 0 && (
            <button
              className="btn-secondary"
              onClick={addDemoCards}
            >
              Add Demo Cards
            </button>
          )}

          <button
            className="btn-primary"
            onClick={() => {
              resetForm();
              setShowAddForm(true);
            }}
          >
            <i className="fa-solid fa-plus"></i> Add Demo Card
          </button>
        </div>
      </div>

      <div className="demo-notice">
        <i className="fa-solid fa-info-circle"></i>
        <span>
          Demo only. Do not enter real card information.
          No payments are processed.
        </span>
      </div>

      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}

      {errors.general && (
        <div className="error-message">{errors.general}</div>
      )}

      {showAddForm && (
        <div className="card-form-overlay">
          <div className="card-form-modal">
            <div className="modal-header">
              <h4>
                {editingCard ? "Edit Demo Card" : "Add Demo Card"}
              </h4>
              <button
                type="button"
                className="close-btn"
                onClick={resetForm}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="credit-card-form">
              <div className="form-row">
                <div className="form-group full-width">
                  <label>Card Nickname (Optional)</label>
                  <input
                    type="text"
                    name="card_nickname"
                    value={formData.card_nickname}
                    onChange={handleInputChange}
                    placeholder="e.g., My Primary Card"
                    maxLength={50}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Card Brand *</label>
                  <select
                    name="card_brand"
                    value={formData.card_brand}
                    onChange={handleInputChange}
                    disabled={Boolean(editingCard)}
                  >
                    {Object.entries(cardBrands).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  {errors.card_brand && (
                    <span className="error-text">{errors.card_brand}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Last Four Digits *</label>
                  <input
                    type="text"
                    name="last_four"
                    value={formData.last_four}
                    onChange={handleInputChange}
                    placeholder="4242"
                    maxLength={4}
                    inputMode="numeric"
                    disabled={Boolean(editingCard)}
                    className={errors.last_four ? "error" : ""}
                  />
                  {errors.last_four && (
                    <span className="error-text">{errors.last_four}</span>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Expiry Month *</label>
                  <select
                    name="expiry_month"
                    value={formData.expiry_month}
                    onChange={handleInputChange}
                    className={errors.expiry_month ? "error" : ""}
                  >
                    <option value="">Month</option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {String(i + 1).padStart(2, "0")}
                      </option>
                    ))}
                  </select>
                  {errors.expiry_month && (
                    <span className="error-text">{errors.expiry_month}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Expiry Year *</label>
                  <select
                    name="expiry_year"
                    value={formData.expiry_year}
                    onChange={handleInputChange}
                    className={errors.expiry_year ? "error" : ""}
                  >
                    <option value="">Year</option>
                    {Array.from({ length: 10 }, (_, i) => {
                      const year = new Date().getFullYear() + i;
                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      );
                    })}
                  </select>
                  {errors.expiry_year && (
                    <span className="error-text">{errors.expiry_year}</span>
                  )}
                </div>
              </div>

              <div className="demo-tip">
                Only demo metadata is stored.
                Never enter real payment credentials.
              </div>

              <div className="form-buttons">
                <button type="submit" className="btn-primary">
                  {editingCard ? "Update Card" : "Add Card"}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="cards-grid">
        {cards.length === 0 ? (
          <div className="no-cards">
            <i className="fa-solid fa-credit-card"></i>
            <p>No demo cards saved yet.</p>
            <p className="demo-hint">
              Add a demo card to test the interface.
            </p>
          </div>
        ) : (
          cards.map(card => (
            <div
              key={card.card_id}
              className={`credit-card-item ${card.is_default ? "default" : ""}`}
            >
              <div className="card-header">
                <div className="card-type">
                  <i
                    className={`fa-brands fa-cc-${card.card_brand === "amex" ? "amex" : card.card_brand}`}
                  ></i>
                  <span>
                    {cardBrands[card.card_brand] || "Demo Card"}
                  </span>
                </div>

                {card.is_default && (
                  <span className="default-badge">Default</span>
                )}
              </div>

              <div className="card-number">
                <i className="fa-solid fa-asterisk"></i>
                <span>•••• •••• •••• {card.last_four}</span>
              </div>

              <div className="card-details">
                <div>
                  <small>Card Type</small>
                  <p>{cardBrands[card.card_brand] || "Demo"}</p>
                </div>
                <div>
                  <small>Expires</small>
                  <p>
                    {String(card.expiry_month).padStart(2, "0")}
                    /{card.expiry_year}
                  </p>
                </div>
              </div>

              {card.card_nickname && (
                <div className="card-nickname">
                  <i className="fa-solid fa-tag"></i>
                  <span>{card.card_nickname}</span>
                </div>
              )}

              <div className="demo-label">DEMO CARD</div>

              <div className="card-actions">
                <button
                  className="action-btn edit"
                  onClick={() => startEdit(card)}
                  aria-label="Edit demo card"
                >
                  <i className="fa-solid fa-edit"></i>
                </button>

                {!card.is_default && (
                  <button
                    className="action-btn default"
                    onClick={() => handleSetDefault(card.card_id)}
                    aria-label="Set as default"
                  >
                    <i className="fa-solid fa-star"></i>
                  </button>
                )}

                <button
                  className="action-btn delete"
                  onClick={() => handleDelete(card.card_id)}
                  aria-label="Delete demo card"
                >
                  <i className="fa-solid fa-trash"></i>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
