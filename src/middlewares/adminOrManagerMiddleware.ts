import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";

interface JwtPayload {
  id: string;
  email: string;
  role: string;
  isBlocked: boolean;
  isDeleted: boolean;
}

export const authenticateAdminOrManager = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized: No token provided" });
    return;
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, config.jwt_secret) as JwtPayload;

    if (decoded.role !== "admin" && decoded.role !== "manager") {
      res.status(403).json({ message: "Forbidden: Not an admin or manager" });
      return;
    }
    console.log(decoded);

    if (decoded?.isBlocked) {
      res.status(401).json({ message: "Unauthorized: User is blocked" });
      return;
    }

    if (decoded?.isDeleted) {
      res.status(401).json({ message: "Unauthorized: User is deleted" });
      return;
    }

    (req as any).user = {
      userId: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    console.error("JWT Verification Error:", error);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
