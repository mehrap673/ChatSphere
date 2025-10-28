import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import User, { IUser } from '../models/User';
import { sendError } from '../utils/response';

export interface AuthRequest extends Request {
  user?: IUser;
}

export const authMiddleware = async (
  req: Request,  // Change back to Request
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return sendError(res, 401, 'No token provided. Authorization denied.');
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return sendError(res, 401, 'User not found. Authorization denied.');
    }

    (req as AuthRequest).user = user;  // Type assertion
    next();
  } catch (error) {
    return sendError(res, 401, 'Invalid token. Authorization denied.');
  }
};
