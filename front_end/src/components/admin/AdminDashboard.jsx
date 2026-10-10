import { API_URL } from "../../config";
import React, {useState, useEffect} from "react";


function AdminDashboard() {
  const [loading, setLoading] = useState(true); //for page loading
  const [userLength, setUserLength] = useState(0); //user amount
  const [restaurantLength, setRestaurantLength] = useState(0); //restaurant amount
  const [orderLength, setOrderLength] = useState(0);//order amount

  //get user amount from backend
  useEffect(() => {
    async function fetchUserAmount() {
      try {
        const res = await fetch(`${API_URL}/auth/admin/userAmount`);
        const data = await res.json();
        setUserLength(data);
      } catch (error) {
        console.error("Failed to load users amount:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserAmount();
  }, []);

  //get restaurant amount from backend
  useEffect(() =>{
    async function fetchRestaurantAmount() {
      try{
        const res = await fetch(`${API_URL}/auth/admin/restaurantAmount`);
        const data = await res.json();
        setRestaurantLength(data);
      }catch(error){
        console.error("Failed to load restaurants amount:", error);
      }finally{
        setLoading(false);
      }
    }

    fetchRestaurantAmount();
  }, []);

  //get order amount from backend
  useEffect(()=>{
    async function fetchOrderAmount() {
      try{
        const res = await fetch(`${API_URL}/auth/admin/orderAmount`);
        const data = await res.json();
        setOrderLength(data);
      }catch(error){
        console.error("Failed to load orders amount:", error);
      }finally{
        setLoading(false);
      }
    }

    fetchOrderAmount();
  }, []);
  
  if (loading) return <p>Loading dashboard...</p>;
 
 return (
  <section>

  
    <div className="dashboard-hero">
      <div className="hero-content">
        <h2>Welcome 👋</h2>
        <p>Here’s what’s happening on your platform today.</p>

      </div>
    </div>

    <div className="apple-dashboard">

     <div className="apple-dashboard-header">
       <h2>Dashboard</h2>
       <p>Overview of your platform</p>
     </div>

     <div className="apple-stats">
      <div className="apple-stat">
        <i className="fa-solid fa-user"></i>
        <div>
          <span className="value">{userLength}</span>
          <span className="label">Users</span>
        </div>
      </div>

      <div className="apple-stat">
        <i className="fa-solid fa-store"></i>
        <div>
          <span className="value">{restaurantLength}</span>
          <span className="label">Restaurants</span>
        </div>
      </div>

      <div className="apple-stat">
        <i className="fa-solid fa-bag-shopping"></i>
        <div>
          <span className="value">{orderLength}</span>
          <span className="label">Orders</span>
        </div>
      </div>
    </div>

    </div>


  </section>  

);


    







}

export default AdminDashboard;
