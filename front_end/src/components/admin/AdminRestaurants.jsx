import { API_URL } from "../../config";
import React, { useState, useEffect } from "react";
import RestaurantForm from "./RestaurantForm";
import MenuManager from "./MenuManager";
import PromoManager from "./PromoManager";
import "../../styles/AdminRestaurants.css";

function AdminRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [tags, setTags] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [showTagsManager, setShowTagsManager] = useState(false);
  const [newTag, setNewTag] = useState({ name: "", img_url: "" });
  const [editingTag, setEditingTag] = useState(null);

  // FETCH RESTAURANTS FROM BACKEND 
  useEffect(() => {
    fetchRestaurants();
    fetchTags();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const result = await fetch(`${API_URL}/restaurants`);
      const data = await result.json();
      setRestaurants(data);
    } catch (error) {
      console.error("Failed to load restaurants:", error);
    }
  };

  const fetchTags = async () => {
    try {
      const result = await fetch(`${API_URL}/tags`);
      const data = await result.json();
      setTags(data);
    } catch (error) {
      console.error("Failed to load tags:", error);
    }
  };

  // DELETE RESTAURANT FOR BACKEND
  const deleteRestaurant = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this restaurant?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${API_URL}/restaurants/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("adminToken")}`
        }
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Delete failed");
        return;
      }

      if (data.action === "deleted") {
        // REMOVE RESTAURANT FROM LIST
        setRestaurants((prev) => prev.filter((r) => r.restaurant_id !== id));
        alert("Restaurant permanently deleted.");
      } else if (data.action === "deactivated") {
        // UPDATE RESTAURANT IN LIST :  to show as inactive
        setRestaurants((prev) =>
          prev.map((r) =>
            r.restaurant_id === id ? { ...r, is_active: false } : r
          )
        );
        alert("Restaurant has existing orders. It has been deactivated instead of deleted.");
      }
    } catch (err) {
      console.error("Failed to delete restaurant:", err);
      alert("Failed to delete restaurant");
    }
  };

  // TAG MANAGEMENT FUNCTIONS
  const handleCreateTag = async (e) => {
    e.preventDefault();
    
    if (!newTag.name.trim()) {
      alert("Tag name is required");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/tags/new-tags`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("adminToken")}`
        },
        body: JSON.stringify(newTag)
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to create tag");
        return;
      }

      setTags(prev => [...prev, data.tag]);
      setNewTag({ name: "", img_url: "" });
      alert("Tag created successfully!");
    } catch (err) {
      console.error("Failed to create tag:", err);
      alert("Failed to create tag");
    }
  };

  const handleUpdateTag = async (e) => {
    e.preventDefault();
    
    if (!editingTag.name.trim()) {
      alert("Tag name is required");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/tags/${editingTag.tag_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("adminToken")}`
        },
        body: JSON.stringify({
          name: editingTag.name,
          img_url: editingTag.img_url
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to update tag");
        return;
      }

      setTags(prev => prev.map(tag => 
        tag.tag_id === editingTag.tag_id ? { ...tag, ...data.tag } : tag
      ));
      setEditingTag(null);
      alert("Tag updated successfully!");
    } catch (err) {
      console.error("Failed to update tag:", err);
      alert("Failed to update tag");
    }
  };

  const handleDeleteTag = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this tag?");
    if (!confirmDelete) return;

    if (!id || id === "undefined") {
      alert("Invalid tag ID");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/tags/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("adminToken")}`
        }
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.action === "in_use") {
          alert("Cannot delete tag - it is currently being used by restaurants or menu items.");
        } else {
          alert(data.error || "Failed to delete tag");
        }
        return;
      }

      setTags(prev => prev.filter(tag => tag.tag_id !== id));
      alert("Tag deleted successfully!");
    } catch (err) {
      console.error("Failed to delete tag:", err);
      alert("Failed to delete tag");
    }
  };

  const startEditTag = (tag) => {
    setEditingTag({
      tag_id: tag.tag_id,
      name: tag.name,
      img_url: tag.img_url || ""
    });
  };

  const cancelEditTag = () => {
    setEditingTag(null);
  };

  //helper function to get the tag ID
  const getTagId = (tag) => {
    return tag.tag_id || tag.id;
  };

  return (
    <div className="admin-restaurants">
      <div className="top-bar">
        <h2 className="page-title">Restaurants</h2>
        <div className="top-bar-buttons">
          <button 
            className="manage-tags-btn"
            onClick={() => setShowTagsManager(!showTagsManager)}
          >
            {showTagsManager ? "Hide Tags" : "Manage Tags"}
          </button>
          <button className="add-btn" onClick={() => setShowAddForm(true)}>
            + Add Restaurant
          </button>
        </div>
      </div>

      {/* TAGS MANAGER SECTION */}
      {showTagsManager && (
        <div className="tags-manager-section">
          <h3>Manage Food Tags</h3>
          
          {/* ADD/EDIT TAG FORM */}
          <div className="tag-form-section">
            <h4>{editingTag ? "Edit Tag" : "Add New Tag"}</h4>
            <form onSubmit={editingTag ? handleUpdateTag : handleCreateTag}>
              <div className="form-row">
                <input
                  type="text"
                  placeholder="Tag Name (e.g., Pizza, Burger, Vegan)"
                  value={editingTag ? editingTag.name : newTag.name}
                  onChange={(e) => editingTag 
                    ? setEditingTag({...editingTag, name: e.target.value})
                    : setNewTag({...newTag, name: e.target.value})
                  }
                  required
                />
                <input
                  type="text"
                  placeholder="Image URL (optional)"
                  value={editingTag ? editingTag.img_url : newTag.img_url}
                  onChange={(e) => editingTag 
                    ? setEditingTag({...editingTag, img_url: e.target.value})
                    : setNewTag({...newTag, img_url: e.target.value})
                  }
                />
              </div>
              <div className="form-buttons">
                <button type="submit" className="save-tag-btn">
                  {editingTag ? "Update Tag" : "Add Tag"}
                </button>
                {editingTag && (
                  <button type="button" className="cancel-edit-btn" onClick={cancelEditTag}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* TAGS LIST */}
          <div className="tags-list-section">
            <h4>Existing Tags ({tags.length})</h4>
            {tags.length === 0 ? (
              <p className="no-tags-message">No tags yet. Add your first tag above.</p>
            ) : (
              <div className="tags-grid">
                {tags.map(tag => {
                  const tagId = getTagId(tag);
                  return (
                    <div key={tagId} className="tag-card">
                      <div className="tag-info">
                        <span className="tag-name">{tag.name}</span>
                        {tag.img_url && (
                          <small className="tag-img-info">Has image</small>
                        )}
                      </div>
                      <div className="tag-actions">
                        <button 
                          className="edit-tag-btn"
                          onClick={() => startEditTag(tag)}
                        >
                          Edit
                        </button>
                        <button 
                          className="delete-tag-btn"
                          onClick={() => {
                            handleDeleteTag(tagId);
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* RESTAURANT LIST */}
      <div className="restaurant-list">
        {restaurants.map(rest => (
          <div className="restaurant-card" key={rest.restaurant_id}>
            <img src={rest.restaurant_img} alt="" className="restaurant-img" />
            
            <div className="restaurant-info">
              <h3>{rest.name}</h3>
              {!rest.is_active && (
                <span className="inactive-badge">Inactive</span>
              )}
              <p className="restaurant-tags">
                {rest.tags?.map(tag => tag.name).join(", ") || "No tags"}
              </p>
            </div>

            <div className="buttons">
              <button className="manage-menu-btn" onClick={() => setSelectedRestaurant(rest)}>
                Manage Menu
              </button>

              <button
                className="edit-btn-restaurants"
                onClick={() => setSelectedRestaurant({ ...rest, mode: "edit" })}
              >
                Edit
              </button>

              <button 
                className="delete-btn-restaurants" 
                onClick={() => deleteRestaurant(rest.restaurant_id)}
              >
                Delete
              </button>

              <button 
                className="promo-btn-restaurants"
                onClick={() => setSelectedRestaurant({ ...rest, mode: "promo" })}
              >
                Manage Promos
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* POPUPS */}
      {showAddForm && (
        <RestaurantForm
          closeForm={() => setShowAddForm(false)}
          setRestaurants={setRestaurants}
          allTags={tags}
        />
      )}

      {selectedRestaurant?.mode === "edit" && (
        <RestaurantForm
          closeForm={() => setSelectedRestaurant(null)}
          setRestaurants={setRestaurants}
          restaurant={selectedRestaurant}
          allTags={tags}
        />
      )}

      {selectedRestaurant && !selectedRestaurant.mode && (
        <MenuManager
          restaurant={selectedRestaurant}
          close={() => setSelectedRestaurant(null)}
          setRestaurants={setRestaurants}
        />
      )}

      {selectedRestaurant?.mode === "promo" && (
        <PromoManager
          restaurant={selectedRestaurant}
          close={() => setSelectedRestaurant(null)}
        />
      )}
    </div>
  );
}

export default AdminRestaurants;