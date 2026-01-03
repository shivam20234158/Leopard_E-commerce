import User from "../models/user.model.js";
import jwt from "jsonwebtoken"
import { redis } from "../lib/redis.js"

const generateTokens = (userId) => {
    const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "15m",
    })
    const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "7d",
    })
    return { accessToken, refreshToken };
};

//save token
const storeRefreshToken = async (userId, refreshToken) => {
    await redis.set(`refresh_token:${userId}`, refreshToken, "EX", 7 * 24 * 60 * 60);
}

const setCookies = (res, accessToken, refreshToken) => {
    res.cookie("accessToken", accessToken, {
        httpOnly: true, //prevent XSS attacks,cross site scripting attack
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",//prevent CSRF attack
        maxAge: 15 * 60 * 1000,//15 min
    });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true, //prevent XSS attacks,cross site scripting attack
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",//prevent CSRF attack
        maxAge: 7 * 24 * 60 * 60,//15 min
    });
};

export const signup = async (req, res) => {
    const { email, password, name } = req.body;

    try {
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        const newUser = await User.create({ name, email, password });

        //authentication process (token giving)

        const { accessToken, refreshToken } = generateTokens(newUser._id);

        //store in redis
        await storeRefreshToken(newUser._id, refreshToken);

        setCookies(res, accessToken, refreshToken);

        res.status(201).json({
            newUser: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
            }, message: "User created successfully"
        });
    }
    catch (error) {
        console.log("Error in signup controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: "Invalid Credential" });
        }

        const isCorrectPassword = await user.comparePassword(password);

        if (!isCorrectPassword) {
            return res.status(401).json({ message: "Invalid Credential" });
        }
        const { accessToken, refreshToken } = generateTokens(user._id);

        //store in redis
        await storeRefreshToken(user._id, refreshToken);
        setCookies(res, accessToken, refreshToken);

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        });
    }
    catch (error) {
        console.log("Error in login controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}
export const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) {
            //find userid
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            await redis.del(`refresh_token:${decoded.userId}`);
        }
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        res.json({ message: "Logged out successfully" })
    }
    catch (error) {
        console.log("Error in logout controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

//for refreshing access token
export const refreshToken = async (req, res) => {
	try {
		const refreshToken = req.cookies.refreshToken;

		if (!refreshToken) {
			return res.status(401).json({ message: "No refresh token provided" });
		}

		const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
		const storedToken = await redis.get(`refresh_token:${decoded.userId}`);

		if (storedToken !== refreshToken) {
			return res.status(401).json({ message: "Invalid refresh token" });
		}

		const accessToken = jwt.sign({ userId: decoded.userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });

		res.cookie("accessToken", accessToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 15 * 60 * 1000,
		});

		res.json({ message: "Token refreshed successfully" });
	} catch (error) {
		console.log("Error in refreshToken controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};
export const getProfile = async (req, res) => {
	try {
		res.json(req.user);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};