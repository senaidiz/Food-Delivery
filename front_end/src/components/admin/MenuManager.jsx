import { API_URL } from "../../config";
import React, { useState, useEffect } from "react";
import "../../styles/MenuManager.css";

function MenuManager({ restaurant, close, setRestaurants }) {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true); //for page loading
  const [editingItem, setEditingItem] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingOptions, setEditingOptions] = useState(null);
  const [optionsForm, setOptionsForm] = useState({
    name: "",
    additional_price: "0"
  });

  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: "",
    image_url: "",
    category_id: "",
    is_available: true,
    tags: []
  });

  // FETCH MENU ITEMS , CATEGORIES and TAGS 
  useEffect(() => {
    fetchMenuItems();
    fetchCategories();
    fetchTags();
  }, [restaurant.restaurant_id]);

  const fetchMenuItems = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/admin/restaurant/${restaurant.restaurant_id}`);
      const data = await response.json();
      setMenuItems(data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch menu items:", error);
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/menu/categories/${restaurant.restaurant_id}`);
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await fetch(`${API_URL}/menu/tags`);
      const data = await response.json();
      setTags(data);
    } catch (error) {
      console.error("Failed to fetch tags:", error);
    }
  };

  // ADD NEW CATEGORY
  const addCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      alert("Please enter a category name");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/menu/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("adminToken")}`
        },
        body: JSON.stringify({
          restaurant_id: restaurant.restaurant_id,
          name: newCategoryName.trim()
        })
      });

      if (!response.ok) throw new Error("Failed to add category");

      // REFRESH CATEGORIES
      fetchCategories();
      setNewCategoryName("");
    } catch (error) {
      console.error("Error adding category:", error);
      alert("Failed to add category");
    }
  };

  // UODATE CATEGORY
  const updateCategory = async (e) => {
    e.preventDefault();
    if (!editingCategory.name.trim()) {
      alert("Please enter a category name");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/menu/categories/${editingCategory.category_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("adminToken")}`
        },
        body: JSON.stringify({
          name: editingCategory.name.trim()
        })
      });

      if (!response.ok) throw new Error("Failed to update category");

      // REFRESH CATEGORIES
      fetchCategories();
      setEditingCategory(null);
    } catch (error) {
      console.error("Error updating category:", error);
      alert("Failed to update category");
    }
  };

  // DELETE CATEGORY
  const deleteCategory = async (categoryId) => {
    if (!window.confirm("Are you sure you want to delete this category? Items in this category will become uncategorized.")) return;

    try {
      const response = await fetch(`${API_URL}/menu/categories/${categoryId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("adminToken")}`
        }
      });

      if (!response.ok) throw new Error("Failed to delete category");

      // REFRESH CATEGORIES and MENU ITEMS
      fetchCategories();
      fetchMenuItems();
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Failed to delete category");
    }
  };

  // ADD NEW MENU ITEM
  const addMenuItem = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/menu/item`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("adminToken")}`
        },
        body: JSON.stringify({
          restaurant_id: restaurant.restaurant_id,
          ...newItem,
          price: parseFloat(newItem.price)
        })
      });

      if (!response.ok) throw new Error("Failed to add item");

      const data = await response.json();

      // REFRESH MENU ITEMS 
      fetchMenuItems();

      // RESET FORM 
      setNewItem({
        name: "",
        description: "",
        price: "",
        image_url: "",
        category_id: "",
        is_available: true,
        tags: []
      });

    } catch (error) {
      console.error("Error adding menu item:", error);
      alert("Failed to add menu item");
    }
  };

  // UPDATE EXISTING MENU ITEM
  const updateMenuItem = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/menu/item/${editingItem.item_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("adminToken")}`
        },
        body: JSON.stringify({
          ...editingItem,
          price: parseFloat(editingItem.price)
        })
      });

      if (!response.ok) throw new Error("Failed to update item");

      // REFRESH MENU ITEMS
      fetchMenuItems();

      // RESET EDITING STATE
      setEditingItem(null);

    } catch (error) {
      console.error("Error updating menu item:", error);
      alert("Failed to update menu item");
    }
  };

  // DELETE MENU ITEM
  const deleteMenuItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      const response = await fetch(`${API_URL}/menu/item/${itemId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("adminToken")}`
        },
      });

      if (!response.ok) throw new Error("Failed to delete item");

      // REFRESH MENU ITEMS
      fetchMenuItems();

    } catch (error) {
      console.error("Error deleting menu item:", error);
      alert("Failed to delete menu item");
    }
  };

  // TOGGLE ITEM AVAILABILITY 
  const toggleAvailability = async (item) => {
    try {
      const response = await fetch(`${API_URL}/menu/item/${item.item_id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("adminToken")}`
        },
        body: JSON.stringify({
          is_available: !item.is_available
        })
      });

      if (!response.ok) throw new Error("Failed to update availability");

      // REFRESH MENU ITEMS
      fetchMenuItems();

    } catch (error) {
      console.error("Error toggling availability:", error);
      alert("Failed to update availability");
    }
  };

  // HANDLE TAG SELECTION 
  const handleTagToggle = (tagName, isEditing = false) => {
    if (isEditing) {
      setEditingItem(prev => {
        const tagExists = prev.tags?.some(t =>
          typeof t === 'object' ? t.name === tagName : t === tagName
        );

        const newTags = tagExists
          ? prev.tags.filter(t =>
            typeof t === 'object' ? t.name !== tagName : t !== tagName
          )
          : [...prev.tags, tagName];
        return { ...prev, tags: newTags };
      });
    } else {
      setNewItem(prev => {
        const tagExists = prev.tags.includes(tagName);
        const newTags = tagExists
          ? prev.tags.filter(t => t !== tagName)
          : [...prev.tags, tagName];
        return { ...prev, tags: newTags };
      });
    }
  };

  // GET ITEM OPTIONS : from backend
  const fetchItemOptions = async (itemId) => {
    try {
      const response = await fetch(`${API_URL}/menu/item/${itemId}/options`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to fetch options:", error);
      return [];
    }
  };

  // EDIT OPTIONS
  const startEditingOptions = async (item) => {
    const options = await fetchItemOptions(item.item_id);
    setEditingOptions({
      ...item,
      currentOptions: options
    });
    setOptionsForm({ name: "", additional_price: "0" });
  };

  // ADD NEW OPTION
  const addOption = async (e) => {
    e.preventDefault();
    if (!optionsForm.name.trim()) {
      alert("Please enter an option name");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/menu/item/${editingOptions.item_id}/options`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("adminToken")}`
          },
          body: JSON.stringify({
            name: optionsForm.name.trim(),
            additional_price: parseFloat(optionsForm.additional_price) || 0
          })
        }
      );

      if (!response.ok) throw new Error("Failed to add option");

      const newOption = await response.json();

      // UPDATE STATE 
      setEditingOptions(prev => ({
        ...prev,
        currentOptions: [...prev.currentOptions, newOption]
      }));

      // CLEAR FORM 
      setOptionsForm({ name: "", additional_price: "0" });

    } catch (error) {
      console.error("Error adding option:", error);
      alert("Failed to add option");
    }
  };

  // DELETE OPTION : for backend
  const deleteOption = async (optionId) => {
    if (!window.confirm("Are you sure you want to delete this option?")) return;

    try {
      const response = await fetch(
        `${API_URL}/menu/options/${optionId}`,
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("adminToken")}`
          }
        }
      );

      if (!response.ok) throw new Error("Failed to delete option");

      // UPDATE STATE
      setEditingOptions(prev => ({
        ...prev,
        currentOptions: prev.currentOptions.filter(opt => opt.option_id !== optionId)
      }));

    } catch (error) {
      console.error("Error deleting option:", error);
      alert("Failed to delete option");
    }
  };

  // UPDATE OPTION : for backend
  const updateOption = async (option) => {
    const newName = prompt("Enter new name for option:", option.name);
    if (!newName || newName === option.name) return;

    const newPrice = prompt("Enter new additional price:", option.additional_price);
    if (newPrice === null) return;

    try {
      const response = await fetch(
        `${API_URL}/menu/options/${option.option_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("adminToken")}`
          },
          body: JSON.stringify({
            name: newName.trim(),
            additional_price: parseFloat(newPrice) || 0
          })
        }
      );

      if (!response.ok) throw new Error("Failed to update option");

      const updatedOption = await response.json();

      // UPDATE STATE 
      setEditingOptions(prev => ({
        ...prev,
        currentOptions: prev.currentOptions.map(opt =>
          opt.option_id === option.option_id ? updatedOption : opt
        )
      }));

    } catch (error) {
      console.error("Error updating option:", error);
      alert("Failed to update option");
    }
  };

  // FOR LOADING PAGE 
  if (loading) {
    return (
      <div className="popup-overlay">
        <div className="popup-box menu-manager-box">
          <p>Loading menu items...</p>
        </div>
      </div>
    );
  }



  return (
    <div className="popup-overlay">
      <div className="popup-box menu-manager-box">
        <div className="menu-manager-header">
          <h3>Manage Menu – {restaurant.name}</h3>
          {/* <button className = "btn x-close-btn" onClick={close}>×</button> */}
        </div>

        {/* CATEGORY MANAGEMENT */}
        <div className="category-management">
          <h4>Menu Categories ({categories.length})</h4>
          <div className="categories-list">
            {categories.map(category => (
              <div key={category.category_id} className="category-item">
                {editingCategory?.category_id === category.category_id ? (
                  <form onSubmit={updateCategory} className="category-edit-form">
                    <input
                      type="text"
                      value={editingCategory.name}
                      onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                      autoFocus
                    />

                    <div className="category-management-btn">
                      <button type="submit" className="btn-category-save">Save</button>
                      <button type="button" className="btn-category-cancel" onClick={() => setEditingCategory(null)}>
                        Cancel
                      </button>
                    </div>
                  </form>

                ) : (
                  <>
                    <span>{category.name}</span>
                    <div className="category-actions">
                      <button
                        className="btn-category-edit"
                        onClick={() => setEditingCategory(category)}
                      >
                        Edit
                      </button>
                      <button
                        className = "btn-category-delete"
                        onClick={() => deleteCategory(category.category_id)}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
          <form onSubmit={addCategory} className="add-category-form">
            <input
              type="text"
              placeholder="New category name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              required
            />
            <button type="submit" className="btn-add-category">Add Category</button>
          </form>
        </div>

        {/* EXISTING MENU ITEMS */}
        <div className="menu-items-list">
          <h4>Menu Items ({menuItems.length})</h4>
          {menuItems.length === 0 ? (
            <p className="no-items">No menu items yet. Add your first item below.</p>
          ) : (
            menuItems.map(item => (
              <div className="menu-item-card" key={item.item_id}>
                <div className="item-image">
                  <img src={item.image_url || "/placeholder-food.jpg"} alt={item.name} />
                </div>
                <div className="item-details">
                  <div className="item-header">
                    <h4>{item.name}</h4>
                    <span className={`status ${item.is_available ? 'available' : 'unavailable'}`}>
                      {item.is_available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                  <p className="item-description">{item.description}</p>
                  <p className="item-price">{item.price}₺</p>
                  <p className="item-category">Category: {item.category_name || 'Uncategorized'}</p>
                  <div className="item-tags">
                    {item.tags.map(tag => (
                      <span key={tag.tag_id} className="tag">{tag.name}</span>
                    ))}
                  </div>
                  {item.options.length > 0 && (
                    <div className="item-options">
                      <small>Options: {item.options.map(opt => opt.name).join(', ')}</small>
                    </div>
                  )}
                </div>
                <div className="item-actions">

                  <div className="item-actions-buttons">
                    <button
                      className="btn-item-actions-edit"
                      onClick={() => {
                        const normalizedItem = {
                          ...item,
                          tags: item.tags.map(t => typeof t === 'object' ? t.name : t)
                        };
                        setEditingItem(normalizedItem);
                      }}
                    >
                      Edit
                    </button>

                    <button
                      className="btn-item-actions-manage-options"
                      onClick={() => startEditingOptions(item)}
                    >
                      Manage Options
                    </button>


                    <button
                      className={`btn-item-actions-disable ${item.is_available ? 'disable-btn' : 'enable-btn'}`}
                      onClick={() => toggleAvailability(item)}
                    >
                      {item.is_available ? 'Disable' : 'Enable'}
                    </button>


                    <button
                      className="btn-item-actions-delete"
                      onClick={() => deleteMenuItem(item.item_id)}
                    >
                      Delete
                    </button>
                  </div>

                </div>
              </div>
            ))
          )}
        </div>

        {/* EDIT ITEM FORM */}
        {editingItem && (
          <div className="edit-form-overlay">
            <div className="edit-form">
              <h4>Edit Menu Item</h4>
              <form onSubmit={updateMenuItem}>
                <input
                  type="text"
                  placeholder="Item Name"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  required
                />
                <textarea
                  placeholder="Description"
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Price"
                  step="0.01"
                  value={editingItem.price}
                  onChange={(e) => setEditingItem({ ...editingItem, price: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="Image URL"
                  value={editingItem.image_url || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, image_url: e.target.value })}
                />
                <select
                  className="select-cat"
                  value={editingItem.category_id || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, category_id: e.target.value })}
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.category_id} value={cat.category_id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <div className="tags-selection">
                  <p>Select Tags:</p>
                  <div className="tags-list">
                    {tags.map(tag => (
                      <label key={tag.tag_id} className="tag-checkbox">
                        <input
                          type="checkbox"
                          checked={editingItem.tags?.some(t =>
                            typeof t === 'object' ? t.name === tag.name : t === tag.name
                          )}
                          onChange={() => handleTagToggle(tag.name, true)}
                        />
                        {tag.name}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="form-buttons">
                  <button type="submit" className="btn-save-changes">Save Changes</button>
                  <button type="button" className="btn-cancel-changes" onClick={() => setEditingItem(null)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ADD NEW ITEM FORM */}
        <div className="add-item-form">
          <h4>Add New Menu Item</h4>
          <form onSubmit={addMenuItem}>
            <div className="form-row">
              <input
                type="text"
                placeholder="Item Name"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                required
              />
              <input
                className="input-price"
                type="number"
                placeholder="Price"
                step="0.01"
                value={newItem.price}
                onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                required
              />
            </div>
            <textarea
              placeholder="Description"
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
            />
            <div className="form-row">
              <input
                type="text"
                placeholder="Image URL"
                value={newItem.image_url}
                onChange={(e) => setNewItem({ ...newItem, image_url: e.target.value })}
              />
              <select
                value={newItem.category_id}
                onChange={(e) => setNewItem({ ...newItem, category_id: e.target.value })}
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.category_id} value={cat.category_id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="tags-selection">
              <p>Select Tags:</p>
              <div className="tags-list">
                {tags.map(tag => (
                  <label key={tag.tag_id} className="tag-checkbox">
                    <input
                      type="checkbox"
                      checked={newItem.tags.includes(tag.name)}
                      onChange={() => handleTagToggle(tag.name, false)}
                    />
                    {tag.name}
                  </label>
                ))}
              </div>
            </div>
            <div className="form-buttons">
              <button type="submit" className="btn-add-item">Add Item</button>
              <button type="button" className="btn-close-item" onClick={close}>
                Close
              </button>
            </div>
          </form>
        </div>
      </div>

      {editingOptions && (
        <div className="edit-form-overlay">
          <div className="edit-form">
            <div className="form-header">
              <h4>Manage Options for {editingOptions.name}</h4>
            </div>

            {/* Add New Option Form */}
            <div className="add-option-form">
              <h5>Add New Option</h5>
              <form className = "add-new-option-form" onSubmit={addOption}>
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="Option Name (e.g., Extra Cheese)"
                    value={optionsForm.name}
                    onChange={(e) => setOptionsForm({ ...optionsForm, name: e.target.value })}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Additional Price"
                    step="0.01"
                    value={optionsForm.additional_price}
                    onChange={(e) => setOptionsForm({ ...optionsForm, additional_price: e.target.value })}
                    min="0"
                  />
                </div>
                <button type="submit" className="btn-add-option">Add Option</button>
              </form>
            </div>

            {/* Existing Options List */}
            <div className="options-list">
              <h5>Current Options ({editingOptions.currentOptions.length})</h5>
              {editingOptions.currentOptions.length === 0 ? (
                <p className="no-options">No options added yet.</p>
              ) : (
                <div className="options-grid">
                  {editingOptions.currentOptions.map(option => (
                    <div key={option.option_id} className="option-item">
                      <div className="option-info">
                        <span className="option-name">{option.name}</span>
                        <span className="option-price">+{option.additional_price}₺</span>
                      </div>
                      <div className="option-actions">
                        <button
                          className="btn-edit"
                          onClick={() => updateOption(option)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => deleteOption(option.option_id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-buttons">
              <button
                className="btn-close-add-option"
                onClick={() => setEditingOptions(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MenuManager;