import { API_URL } from "../config";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import "../styles/RestaurantPage.css";
import Header from "../components/Header";
import ItemModal from "../components/ItemModal";
import RestaurantPromotions from "../components/RestaurantPromotions";


export default function RestaurantPage() {
  const { id } = useParams(); //get clicked on restaurant's id

  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [loading, setLoading] = useState(true); //for loading page

  //open item modal
  function openModal(itemId) {
    setSelectedItemId(itemId);
  }

  //close item modal
  function closeModal() {
    setSelectedItemId(null);
  }

  //add item to cart
  async function handleAddToCart(item, selectedOptions, quantity = 1) { // Default quantity to 1
    try {
      const token = localStorage.getItem("token");

      console.log("Adding to cart:", {
        item_id: item.item_id,
        quantity,
        selectedOptions
      });

      const response = await fetch(`${API_URL}/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          item_id: item.item_id,
          options: selectedOptions,
          quantity: quantity //add quantity
        }),
      });

      const data = await response.json();
      console.log("Add to cart response:", data);

      closeModal();

      if (typeof window.openCartSidebar === "function") {
        window.openCartSidebar();
      }

    } catch (error) {
      console.error("Add to cart failed:", error);
      alert("Failed to add item to cart");
    }
  }

  //get restaurant info
  useEffect(() => {
    async function fetchRestaurant() {
      try {
        const res = await fetch(`${API_URL}/restaurants/${id}`);
        const data = await res.json();
        setRestaurant(data);
      } catch (error) {
        console.error("Failed to fetch restaurant:", error);
      }
    }

    fetchRestaurant();
  }, [id]);

  //get menu for restaurant
  useEffect(() => {
    async function fetchMenu() {
      try {
        const res = await fetch(`${API_URL}/menu/restaurant/${id}`);
        const data = await res.json();

        setMenuItems(Array.isArray(data) ? data : []);

        const uniqueCategories = [
          "All",
          ...new Set(
            (data || []).map(item => item.category_name || "Other")
          ),
        ];

        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Failed to load menu:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMenu();
  }, [id]);

  //loading
  if (loading) return <p>Loading menu...</p>;
  if (!restaurant) return <p>Restaurant not found.</p>;

  //filter menu by category
  const filteredMenu =
    selectedCategory === "All"
      ? menuItems
      : menuItems.filter(item => item.category_name === selectedCategory);

  return (
    <div className="restaurant-page">
      <Header />

      <div className="page-title-wrapper">
        <div className="restaurant-top">
          <div className="restaurant-image">
            <img src={restaurant.restaurant_img} alt={restaurant.name} />
          </div>

          <div className = "desc-promo">
            <div className="restaurant-details">
              <h2>{restaurant.name}</h2>
              <h3>⭐ {restaurant.rating}</h3>
              <p>{restaurant.description}</p>
              <p>{restaurant.address}</p>
            </div>

            {/*PROMOTIONS */}
            <div className="restaurant-promotions-wrapper">
              <RestaurantPromotions restaurantId={restaurant.restaurant_id} />
            </div>
          </div>  



          
        </div>

        <div className="restaurant-content">
          {/* === CATEGORIES SIDEBAR === */}
          <aside className="restaurant-categories">
            <h3>Categories</h3>
            <ul>
              {categories.map((cat, idx) => (
                <li
                  key={idx}
                  className={selectedCategory === cat ? "active" : ""}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </li>
              ))}
            </ul>
          </aside>

          {/* === MENU ITEMS === */}
          <section className="restaurant-menu">
            <h3>Menu — {selectedCategory}</h3>

            {filteredMenu.length === 0 ? (
              <p>No items found in this category.</p>
            ) : (
              <div className="menu-grid">
                {filteredMenu.map((item) => (
                  <div key={item.item_id} className="menu-card">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="menu-img"
                    />

                    <div className="menu-info">
                      <h4>{item.name}</h4>
                      <p className="menu-desc">{item.description}</p>

                      <div className="menu-bottom">
                        <span className="menu-price">{item.price} ₺</span>

                        <button
                          className="res-add-btn"
                          onClick={() => openModal(item.item_id)}
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {selectedItemId && (
        <ItemModal
          itemId={selectedItemId}
          onClose={closeModal}
          onAdd={handleAddToCart} //pass quantity from ItemModal
        />
      )}

    </div>
  );
}