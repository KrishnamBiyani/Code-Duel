import jwt from "jsonwebtoken";

export const generateToken = (userID, res) => {
  const token = jwt.sign({ userID }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // MS
    httpOnly: true, // prevent XSS attacks cross-site scripting attacks
    sameSite: "strict", // CSRF attacks cross-site request forgery attacks
    secure: process.env.NODE_ENV !== "development",
  });

  return token;
};

export const generateRoomId = () => {
  return Math.random().toString(36).substr(2, 6).toUpperCase();
};
