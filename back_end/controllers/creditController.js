import {db} from "../db.js";

//get all of the credit cards
export const getAllCredits = async (req, res) => {
  const userId = req.user.user_id;

  try {
    const result = await db.query(
      `SELECT
         card_id,
         card_nickname,
         card_brand,
         last_four,
         expiry_month,
         expiry_year,
         is_default,
         created_at
       FROM credit_cards
       WHERE user_id = $1
       ORDER BY is_default DESC, created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get credit cards" });
  }
};


//add new credit card, demo so not complex
export const addCreditCard = async (req, res) => {
  const userId = req.user.user_id;

  const {
    card_nickname,
    card_brand,
    last_four,
    expiry_month,
    expiry_year,
    is_default
  } = req.body;

  const validBrands = ["visa", "mastercard", "amex"];

  if (
    typeof card_brand !== "string" ||
    !validBrands.includes(card_brand.toLowerCase()) ||
    typeof last_four !== "string" ||
    !/^\d{4}$/.test(last_four) ||
    !Number.isInteger(expiry_month) ||
    expiry_month < 1 ||
    expiry_month > 12 ||
    !Number.isInteger(expiry_year) ||
    expiry_year < new Date().getFullYear() ||
    (card_nickname != null && typeof card_nickname !== "string") ||
    (is_default != null && typeof is_default !== "boolean")
  ) {
    return res.status(400).json({
      error: "Invalid demo card details"
    });
  }

  try {
    const result = await db.query(
      `INSERT INTO credit_cards
       (user_id, card_nickname, card_brand, last_four,
        expiry_month, expiry_year, is_default)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING card_id, card_nickname, card_brand,
                 last_four, expiry_month, expiry_year, is_default`,
      [
        userId,
        card_nickname || null,
        card_brand.toLowerCase(),
        last_four,
        expiry_month,
        expiry_year,
        false
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to add demo card"
    });
  }
};


//update existing credit card
export const updateCard = async (req, res) => {
  const userId = req.user.user_id;
  const { cardId } = req.params;
  const { card_nickname, expiry_month, expiry_year } = req.body;

  if (
    (card_nickname != null && typeof card_nickname !== "string") ||
    !Number.isInteger(expiry_month) ||
    expiry_month < 1 ||
    expiry_month > 12 ||
    !Number.isInteger(expiry_year) ||
    expiry_year < new Date().getFullYear()
  ) {
    return res.status(400).json({
      error: "Invalid card details"
    });
  }

  try {
    const result = await db.query(
      `UPDATE credit_cards
       SET card_nickname = $1,
           expiry_month = $2,
           expiry_year = $3
       WHERE card_id = $4 AND user_id = $5
       RETURNING card_id, card_nickname, card_brand,
                 last_four, expiry_month, expiry_year, is_default`,
      [
        card_nickname || null,
        expiry_month,
        expiry_year,
        cardId,
        userId
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Card not found"
      });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to update card"
    });
  }
};


//delete existing credit cards
export const deleteCard = async (req, res) => {
  const userId = req.user.user_id;
  const { cardId } = req.params;

  try {
    const result = await db.query(
      `DELETE FROM credit_cards
       WHERE card_id = $1 AND user_id = $2
       RETURNING card_id`,
      [cardId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Card not found"
      });
    }

    res.json({
      message: "Card deleted successfully"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to delete card"
    });
  }
};


//set a card as default

export const setDefault = async (req, res) => {
  const userId = req.user.user_id;
  const { cardId } = req.params;

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // Aynı kullanıcının eşzamanlı varsayılan kart
    // değişikliklerini sıraya al.
    await client.query(
      "SELECT user_id FROM users WHERE user_id = $1 FOR UPDATE",
      [userId]
    );

    // Seçilen kart gerçekten bu kullanıcıya mı ait?
    const card = await client.query(
      `SELECT card_id
       FROM credit_cards
       WHERE card_id = $1 AND user_id = $2`,
      [cardId, userId]
    );

    if (card.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        error: "Card not found"
      });
    }

    // Önce diğer kartların varsayılan durumunu kaldır.
    await client.query(
      `UPDATE credit_cards
       SET is_default = FALSE
       WHERE user_id = $1`,
      [userId]
    );

    // Seçilen kartı varsayılan yap.
    const result = await client.query(
      `UPDATE credit_cards
       SET is_default = TRUE
       WHERE card_id = $1 AND user_id = $2
       RETURNING card_id, card_nickname, card_brand,
                 last_four, expiry_month, expiry_year, is_default`,
      [cardId, userId]
    );

    await client.query("COMMIT");

    res.json(result.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({
      error: "Failed to set default card"
    });
  } finally {
    client.release();
  }
};
