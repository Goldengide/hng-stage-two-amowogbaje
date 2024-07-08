import bcrypt from "bcryptjs";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import { Request, Response, NextFunction } from 'express';

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

export const comparePasswords = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || "secret", {
    expiresIn: "1h",
  });
};

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  // Retrieve the JWT token from the request headers
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
      return res.status(401).json({
          status: 'error',
          message: 'Authentication failed: Token not provided',
          statusCode: 401,
      });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET|| 'default_secret');
    req.user = { userId: (decoded as any).userId };
    next();
} catch (error) {
    if (error instanceof JsonWebTokenError) {
        // Log JWT verification error
        console.error('JWT Verification Error:', error.message);
        return res.status(401).json({
            status: 'error',
            message: 'Unauthorized: Invalid token',
        });
    }
    // Handle other types of errors (if needed)
    console.error('Authentication Error:', error);
    return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
    });
}

}