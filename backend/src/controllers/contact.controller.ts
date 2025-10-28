import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import ContactRequest from '../models/ContactRequest';
import Contact from '../models/Contact';
import User from '../models/User';
import { sendSuccess, sendError } from '../utils/response';

// Send friend request
export const sendContactRequest = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const currentUserId = (req as AuthRequest).user._id;

    if (userId === currentUserId.toString()) {
      return sendError(res, 400, 'Cannot send request to yourself');
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return sendError(res, 404, 'User not found');
    }

    const existingContact = await Contact.findOne({
      $or: [
        { user: currentUserId, contact: userId },
        { user: userId, contact: currentUserId },
      ],
    });

    if (existingContact) {
      return sendError(res, 400, 'Already in your contacts');
    }

    const existingRequest = await ContactRequest.findOne({
      $or: [
        { from: currentUserId, to: userId, status: 'pending' },
        { from: userId, to: currentUserId, status: 'pending' },
      ],
    });

    if (existingRequest) {
      return sendError(res, 400, 'Contact request already pending');
    }

    const contactRequest = await ContactRequest.create({
      from: currentUserId,
      to: userId,
      status: 'pending',
    });

    const populatedRequest = await ContactRequest.findById(contactRequest._id)
      .populate('from', 'name email avatar isOnline')
      .populate('to', 'name email avatar isOnline');

    sendSuccess(res, 201, 'Contact request sent successfully', { request: populatedRequest });
  } catch (error: any) {
    sendError(res, 500, error.message || 'Server error');
  }
};

// Get pending contact requests (received)
export const getPendingRequests = async (req: Request, res: Response) => {
  try {
    const requests = await ContactRequest.find({
      to: (req as AuthRequest).user._id,
      status: 'pending',
    })
      .populate('from', 'name email avatar isOnline lastSeen')
      .sort({ createdAt: -1 });

    sendSuccess(res, 200, 'Pending requests fetched successfully', { requests });
  } catch (error: any) {
    sendError(res, 500, error.message || 'Server error');
  }
};

// Get sent contact requests
export const getSentRequests = async (req: Request, res: Response) => {
  try {
    const requests = await ContactRequest.find({
      from: (req as AuthRequest).user._id,
      status: 'pending',
    })
      .populate('to', 'name email avatar isOnline lastSeen')
      .sort({ createdAt: -1 });

    sendSuccess(res, 200, 'Sent requests fetched successfully', { requests });
  } catch (error: any) {
    sendError(res, 500, error.message || 'Server error');
  }
};

// Accept contact request
export const acceptContactRequest = async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;

    const contactRequest = await ContactRequest.findById(requestId);

    if (!contactRequest) {
      return sendError(res, 404, 'Contact request not found');
    }

    if (contactRequest.to.toString() !== (req as AuthRequest).user._id.toString()) {
      return sendError(res, 403, 'Not authorized to accept this request');
    }

    if (contactRequest.status !== 'pending') {
      return sendError(res, 400, 'Request already processed');
    }

    contactRequest.status = 'accepted';
    await contactRequest.save();

    await Contact.create([
      { user: contactRequest.from, contact: contactRequest.to },
      { user: contactRequest.to, contact: contactRequest.from },
    ]);

    const populatedRequest = await ContactRequest.findById(requestId)
      .populate('from', 'name email avatar isOnline')
      .populate('to', 'name email avatar isOnline');

    sendSuccess(res, 200, 'Contact request accepted', { request: populatedRequest });
  } catch (error: any) {
    sendError(res, 500, error.message || 'Server error');
  }
};

// Reject contact request
export const rejectContactRequest = async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;

    const contactRequest = await ContactRequest.findById(requestId);

    if (!contactRequest) {
      return sendError(res, 404, 'Contact request not found');
    }

    if (contactRequest.to.toString() !== (req as AuthRequest).user._id.toString()) {
      return sendError(res, 403, 'Not authorized to reject this request');
    }

    if (contactRequest.status !== 'pending') {
      return sendError(res, 400, 'Request already processed');
    }

    contactRequest.status = 'rejected';
    await contactRequest.save();

    sendSuccess(res, 200, 'Contact request rejected', null);
  } catch (error: any) {
    sendError(res, 500, error.message || 'Server error');
  }
};

// Get all contacts
export const getContacts = async (req: Request, res: Response) => {
  try {
    const contacts = await Contact.find({ user: (req as AuthRequest).user._id })
      .populate('contact', 'name email avatar isOnline lastSeen')
      .sort({ createdAt: -1 });

    const contactList = contacts.map((c: any) => c.contact);

    sendSuccess(res, 200, 'Contacts fetched successfully', { contacts: contactList });
  } catch (error: any) {
    sendError(res, 500, error.message || 'Server error');
  }
};

// Search users (to add as contacts)
export const searchUsers = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;

    if (!query || typeof query !== 'string') {
      return sendError(res, 400, 'Search query is required');
    }

    const users = await User.find({
      _id: { $ne: (req as AuthRequest).user._id },
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
      ],
    })
      .select('name email avatar isOnline lastSeen')
      .limit(20);

    sendSuccess(res, 200, 'Users found', { users });
  } catch (error: any) {
    sendError(res, 500, error.message || 'Server error');
  }
};

// Remove contact
export const removeContact = async (req: Request, res: Response) => {
  try {
    const { contactId } = req.params;

    await Contact.deleteMany({
      $or: [
        { user: (req as AuthRequest).user._id, contact: contactId },
        { user: contactId, contact: (req as AuthRequest).user._id },
      ],
    });

    sendSuccess(res, 200, 'Contact removed successfully', null);
  } catch (error: any) {
    sendError(res, 500, error.message || 'Server error');
  }
};
