import { API_URL } from "../../config";
import React, { useState, useEffect } from "react";
import "../../styles/RestaurantForm.css";

function RestaurantForm({ closeForm, setRestaurants, restaurant }) {
  const isEdit = Boolean(restaurant); //check editing mode
  const [restaurantTags, setRestaurantTags] = useState([]);
  const [selectedRestaurantTags, setSelectedRestaurantTags] = useState([]);

  const [form, setForm] = useState({
    name: restaurant?.name || "",
    description: restaurant?.description || "",
    address: restaurant?.address || "",
    rating: restaurant?.rating || "",
    is_active: restaurant?.is_active ?? true,
    restaurant_img: restaurant?.restaurant_img || "" 
  });

  // FETCH RESTAURANT TAGS
  useEffect(() => {
    fetchRestaurantTags();
    if (isEdit && restaurant.tags) {
      // GET TAG IDS : from the tag objects
      const tagIds = restaurant.tags.map(tag => 
        typeof tag === 'object' ? tag.tag_id : tag
      );
      setSelectedRestaurantTags(tagIds);
    }
  }, [restaurant]);

  const fetchRestaurantTags = async () => {
    try {
      const response = await fetch(`${API_URL}/tags/restaurant-tags`);
      const data = await response.json();
      setRestaurantTags(data);
    } catch (error) {
      console.error("Failed to fetch restaurant tags:", error);
    }
  };

  // TOGGLE TAGS 
  const handleTagToggle = (tagId) => {
    setSelectedRestaurantTags(prev => {
      if (prev.includes(tagId)) {
        return prev.filter(id => id !== tagId);
      } else {
        return [...prev, tagId];
      }
    });
  };

  // SUBMITTING FORM : depending on editing or creating
  const handleSubmit = async (e) => {
    e.preventDefault();

    const method = isEdit ? "PUT" : "POST";
    const url = isEdit
      ? `${API_URL}/restaurants/${restaurant.restaurant_id}`
      : `${API_URL}/restaurants`;

    const payload = {
      ...form,
      tags: selectedRestaurantTags
    };

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("adminToken")}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();

      if (isEdit) {
        setRestaurants(prev =>
          prev.map(r => r.restaurant_id === data.restaurant_id ? data : r)
        );
      } else {
        setRestaurants(prev => [...prev, data]);
      }

      closeForm();
    } catch (err) {
      console.error("Failed:", err);
      alert(`Failed to ${isEdit ? "update" : "add"} restaurant: ${err.message}`);
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-box">
        <h3>{isEdit ? "Edit Restaurant" : "Add Restaurant"}</h3>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Restaurant Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />

          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <input
            type="text"
            placeholder="Address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            required
          />

          <input
            type="number"
            placeholder="Rating"
            step="0.1"
            min="0"
            max="5"
            value={form.rating}
            onChange={(e) => setForm({ ...form, rating: e.target.value })}
          />

          <input
            type="text"
            placeholder="Restaurant Image URL"
            value={form.restaurant_img}
            onChange={(e) => setForm({...form, restaurant_img: e.target.value})}
          />

          <select
            className="select-cat"
            value={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.value === "true" })}
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>

          {/* Restaurant Tags Section */}
          <div className="tags-selection">
            <p>Select Restaurant Tags:</p>
            <div className="tags-list">
              {restaurantTags.map(tag => (
                <label key={tag.tag_id} className="tag-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedRestaurantTags.includes(tag.tag_id)}
                    onChange={() => handleTagToggle(tag.tag_id)}
                  />
                  {tag.name}
                </label>
              ))}
            </div>
          </div>

          <button className="submit-btn">
            {isEdit ? "Save Changes" : "Add Restaurant"}
          </button>

          <button className="close-btn" onClick={closeForm}>Close</button>
        </form>

        
      </div>
    </div>
  );
}

export default RestaurantForm;