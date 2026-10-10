import { db } from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config(); //loads .env info as default

const JWT_SECRET = process.env.JWT_SECRET; //for login and authentication tokens
const SALT_ROUNDS = 15; //password hashing salt rounds

//registering function
export const register = async (req, res) => {
    const { full_name, email, password, address } = req.body;
    if (!full_name || !email || !password) return res.status(400).json({ error: "Missing fields" });

    try {
        const hash = await bcrypt.hash(password, SALT_ROUNDS); //hash password
        const result = await db.query(`
            INSERT INTO users (full_name, email, password_hash, role, address) 
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING user_id, full_name, email, role, address
        `, [full_name, email, hash, "customer", address || null]);

        const user = result.rows[0];
        //token for registering
        const token = jwt.sign(
            { user_id: user.user_id, role: user.role, email: user.email },
            JWT_SECRET,
            { expiresIn: "7d" }
        );
        res.json({ user, token });
    } catch (err) {
        //postgreSQL error code for unique violation
        if (err.code === "23505") return res.status(409).json({ error: "Email already exists" });
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
}

//login function
export const login = async (req, res) => {
    const { email, password } = req.body;
    const result = await db.query(
        "SELECT user_id, full_name, email, password_hash, role, address, is_active FROM users WHERE email = $1", 
        [email]
    );
    const user = result.rows[0];

    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    //check if user is active to stop nonactive users from loging in
    if (!user.is_active) {
        return res.status(403).json({ 
            error: "Account is deactivated. Please contact support for assistance." 
        });
    }

    const ok = await bcrypt.compare(password, user.password_hash);//check password
    if (!ok) return res.status(401).json({ error: "Invalid password" });

    //token for login
    const token = jwt.sign(
        { user_id: user.user_id, role: user.role, email: user.email },
        JWT_SECRET,
        { expiresIn: "7d" }
    );
    res.json({ 
        user: { 
            user_id: user.user_id, 
            full_name: user.full_name, 
            email: user.email, 
            role: user.role,
            address: user.address 
        }, 
        token 
    });
};

//login functions for admins
export const adminLogin = async (req, res) => {
    const { email, password } = req.body;

    const result = await db.query(
        "SELECT user_id, full_name, email, password_hash, role, address, is_active FROM users WHERE email = $1",
        [email]
    );
    const user = result.rows[0];

    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    //if admin is not active
    if (!user.is_active) {
        return res.status(403).json({ 
            error: "Account is deactivated. Please contact support for assistance." 
        });
    }

    const ok = await bcrypt.compare(password, user.password_hash); //check password
    if (!ok) return res.status(401).json({ error: "Invalid password" });

    //if not admin
    if (user.role !== "admin") {
        return res.status(403).json({ error: "Access denied. Admins only." });
    }

    //token for admin login
    const token = jwt.sign(
        { user_id: user.user_id, role: user.role, email: user.email },
        JWT_SECRET,
        { expiresIn: "7d" }
    );

    res.json({
        user: {
            user_id: user.user_id,
            full_name: user.full_name,
            email: user.email,
            role: user.role,
            address: user.address
        },
        token,
    });
};

//get user information
export const userInfo = async (req, res) => {
    const result = await db.query(
        "SELECT user_id, full_name, email, role, address, created_at, is_active FROM users WHERE user_id = $1", 
        [req.user.user_id]
    );
    
    const user = result.rows[0];
    
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    
    if (!user.is_active) {
        return res.status(403).json({ 
            error: "Account has been deactivated" 
        });
    }
    
    res.json(user);
};

//update existing user
export const updateUser = async (req, res) => {
    const { full_name, email, address } = req.body;
    const userId = req.user.user_id;

    try {
        const result = await db.query(
            `UPDATE users 
             SET full_name = $1, email = $2, address = $3 
             WHERE user_id = $4 
             RETURNING user_id, full_name, email, role, address, created_at`,
            [full_name, email, address || null, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        if (err.code === "23505") { //unique violation for postgreSQL
            return res.status(409).json({ error: "Email already exists" });
        }
        console.error(err);
        res.status(500).json({ error: "Failed to update user" });
    }
};

//update password
export const updatePassword = async (req, res) => {
    const { current_password, new_password, confirm_password } = req.body;
    const userId = req.user.user_id;

    //validate
    if (!current_password || !new_password || !confirm_password) {
        return res.status(400).json({ error: "All password fields are required" });
    }

    if (new_password !== confirm_password) {
        return res.status(400).json({ error: "New passwords do not match" });
    }

    if (new_password.length < 6) {
        return res.status(400).json({ error: "New password must be at least 6 characters long" });
    }

    try {
        //verify current password
        const userRes = await db.query(
            "SELECT password_hash FROM users WHERE user_id = $1",
            [userId]
        );

        if (userRes.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const user = userRes.rows[0];
        
        //check if current password is correct
        const isCurrentPasswordValid = await bcrypt.compare(current_password, user.password_hash);
        if (!isCurrentPasswordValid) {
            return res.status(401).json({ error: "Current password is incorrect" });
        }

        //hash the new password
        const newPasswordHash = await bcrypt.hash(new_password, SALT_ROUNDS);

        //update password in database
        await db.query(
            "UPDATE users SET password_hash = $1 WHERE user_id = $2",
            [newPasswordHash, userId]
        );

        res.json({ 
            success: true, 
            message: "Password updated successfully" 
        });
    } catch (err) {
        console.error("Password update error:", err);
        res.status(500).json({ error: "Failed to update password" });
    }
};