import { Types } from 'mongoose';

// Extend Express Request to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: Types.ObjectId;
        name: string;
        email: string;
        avatar?: string;
        isOnline: boolean;
        lastSeen?: Date;
      };
    }
  }
}
