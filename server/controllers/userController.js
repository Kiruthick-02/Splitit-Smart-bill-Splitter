import User from '../models/User.js';
import { v2 as cloudinary } from 'cloudinary';

// @desc    Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user profile (username, email)
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.username = req.body.username || user.username;
      user.email = req.body.email || user.email;

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all users (e.g., for adding to a group)
export const getUsers = async (req, res) => {
  try {
    const keyword = req.query.search
      ? { username: { $regex: req.query.search, $options: 'i' } }
      : {};

    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } }).select('username email');
    res.json(users);
  } catch (error) {
      res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Upload user profile avatar from a data URL
export const uploadProfileAvatar = async (req, res) => {
    try {
        const { image } = req.body; // Expects a base64 image string

        if (!image) {
            return res.status(400).json({ message: 'No image data provided.' });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const uploadedResponse = await cloudinary.uploader.upload(image, {
            folder: 'SplitIt_Avatars',
            resource_type: 'image',
        });

        user.avatar = uploadedResponse.secure_url;
        await user.save();

        res.json({
            message: 'Avatar uploaded successfully.',
            avatarUrl: user.avatar
        });
        
    } catch (error) {
        console.error("Avatar Upload Error:", error);
        res.status(500).json({ message: 'Server error while uploading avatar.' });
    }
};