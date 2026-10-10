import { API_URL } from "../config";
import { useSearchParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import RestaurantCard from "../components/RestaurantCard";
import "../styles/SearchResults.css";

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  
  const [searchResults, setSearchResults] = useState({
    restaurants: [],
    menuItems: []
  });
  const [loading, setLoading] = useState(true); //for loading page
  const [error, setError] = useState("");

  //perform search for query
  useEffect(() => {
    if (query.trim().length < 2) {
      setError("Search query must be at least 2 characters");
      setLoading(false);
      return;
    }

    async function performSearch() {
      try {
        setLoading(true);
        const res = await fetch(
          `${API_URL}/restaurants/search?query=${encodeURIComponent(query)}`
        );
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || "Search failed");
        }
        
        const data = await res.json();
        setSearchResults(data);
        setError("");
      } catch (err) {
        console.error("Search error:", err);
        setError(err.message || "Failed to perform search. Please try again.");
        setSearchResults({ restaurants: [], menuItems: [] });
      } finally {
        setLoading(false);
      }
    }

    performSearch();
  }, [query]);

  return (
    <div id="search-page-wrapper">
      <Header />
      
      <div className="search-results-page">
        <h2>Search Results for "{query}"</h2>
        
        {error && <p className="error-message">{error}</p>}
        
        {loading ? (
          <p>Searching...</p>
        ) : (
          <>
            {/* RESTAURANTS SECTION */}
            <div className="results-section">
              <h3>Restaurants ({searchResults.restaurants.length})</h3>
              {searchResults.restaurants.length === 0 ? (
                <p>No restaurants found</p>
              ) : (
                <div className="restaurant-list">
                  {searchResults.restaurants.map((r) => (
                    <RestaurantCard 
                      key={r.restaurant_id}
                      name={r.name}
                      category={r.tags?.[0]?.name || "Unknown"}
                      distance={Math.floor(Math.random() * 10) + 1}
                      time={Math.floor(Math.random() * 60) + 10}
                      image={r.restaurant_img}
                      id={r.restaurant_id}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* MENU ITEMS SECTION */}
            <div className="results-section">
              <h3>Menu Items ({searchResults.menuItems.length})</h3>
              {searchResults.menuItems.length === 0 ? (
                <p>No menu items found</p>
              ) : (
                <div className="menu-items-list">
                  {searchResults.menuItems.map((item) => (
                    <div key={item.item_id} className="menu-item-card">
                      <div className="menu-item-image">
                        <img src={item.image_url || "/placeholder-food.jpg"} alt={item.name} />
                      </div>
                      <div className="menu-item-info">
                        <h4>{item.name}</h4>
                        <p className="menu-item-description">{item.description}</p>
                        <p className="menu-item-price">{item.price}₺</p>
                        <p className="menu-item-restaurant">
                          From: <Link to={`/restaurant/${item.restaurant_id}`}>{item.restaurant_name}</Link>
                        </p>
                        <p className="menu-item-category">Category: {item.category_name || 'Uncategorized'}</p>
                      </div>
                      <Link to={`/restaurant/${item.restaurant_id}`}>
                        <button className="view-restaurant-btn">
                          View Restaurant
                        </button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
      
    
    </div>
  );
}