// types/express.d.ts

import { Request } from "express";

// Extend the Express Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: { userId: string }; // Define the shape of req.user here
    }
  }
}
