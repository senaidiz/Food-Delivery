
import { useState } from "react";
import "../styles/PaymentProcessor.css";

export default function PaymentProcessor({
  amount,
  selectedCard,
  onSuccess,
  onCancel
}) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const handleDemoOrder = async () => {
    if (processing) return;

    setProcessing(true);
    setError("");

    try {
      await onSuccess();
    } catch (err) {
      setError(err.message || "Failed to create demo order");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="payment-processor">
      <div className="payment-header">
        <h3>Demo Checkout</h3>
      </div>

      <div className="demo-notice">
        This is a demonstration. No real payment will be
        processed or charged.
      </div>

      <div className="payment-summary">
        <div className="summary-item">
          <span>Order Total:</span>
          <span className="amount">
            ${amount.toFixed(2)}
          </span>
        </div>

        <div className="summary-item">
          <span>Demo Payment Method:</span>
          <span>
            {selectedCard?.card_nickname ||
              "No demo card selected"}
          </span>
        </div>

        {selectedCard && (
          <div className="summary-item">
            <span>Demo Card:</span>
            <span>
              •••• {selectedCard.last_four}
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="payment-actions">
        <button
          type="button"
          className="pay-button"
          onClick={handleDemoOrder}
          disabled={processing}
        >
          {processing
            ? "Creating Demo Order..."
            : "Place Demo Order"}
        </button>

        <button
          type="button"
          className="cancel-button"
          onClick={onCancel}
          disabled={processing}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
