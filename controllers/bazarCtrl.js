const Bazar = require('../models/bazarModel');
const User = require('../models/userModel');

const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-west-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

class APIfeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  paginating() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 9;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

const bazarCtrl = {
  createItem: async (req, res) => {
    try {
      const { title, description, price, location, images, category } = req.body;
      if (!title || !price || !location)
        return res.status(400).json({ msg: 'Required fields are missing.' });

      const currentCount = await Bazar.countDocuments({ seller: req.user._id });

      const FREE_LIMIT = 10;
      const isTrusted = req.user?.seller?.isTrusted;

      if (currentCount >= FREE_LIMIT && !isTrusted) {
        return res.status(403).json({
          msg: 'You’ve reached your free 10-item limit. Please verify your seller account to continue.'
        });
      }

      // 1. Save the new item
      const newItem = await new Bazar({
        title,
        description,
        price,
        location,
        images,
        category,
        seller: req.user._id,
      }).save();

      // 2. Update user (only if first item)
      if (currentCount === 0) {
        await User.findByIdAndUpdate(req.user._id, {
          $set: { 'seller.sellerSince': new Date() }
        });
      }

      // 3. Populate seller before returning
      const populatedItem = await Bazar.findById(newItem._id)
        .populate('seller', 'avatar username fullname seller');

      return res.json({
        msg: 'Created Item!',
        newItem: populatedItem,
      });

    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  getItems: async (req, res) => {
    try {
      const { search = '', category = '' } = req.query;

      // Global search across fields
      const keywordFilter = search
        ? {
            $or: [
              { title: { $regex: search, $options: 'i' } },
              { description: { $regex: search, $options: 'i' } },
              { location: { $regex: search, $options: 'i' } },
              { category: { $regex: search, $options: 'i' } }
            ]
          }
        : {};

      // Category filter (exact match unless All or empty)
      const categoryFilter =
        category && category !== 'All'
          ? { category: { $regex: category, $options: 'i' } }
          : {};

      // Merge filters
      const filters = {
        ...keywordFilter,
        ...categoryFilter
      };

      const features = new APIfeatures(Bazar.find(filters), req.query).paginating();

      const items = await features.query
        .sort('-createdAt')
        .populate('seller', 'avatar username fullname seller');

      res.json({ msg: 'Success!', result: items.length, items });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  getItemById: async (req, res) => {
    try {
      const item = await Bazar.findById(req.params.id)
        .populate('seller', 'avatar username fullname seller');

      if (!item) {
        return res.status(404).json({ msg: 'Item not found' });
      }

      res.json({ item });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  getItemsBySeller: async (req, res) => {
    try {
      const sellerId = req.params.id;

      const items = await Bazar.find({ seller: sellerId })
        .populate('seller', 'avatar username fullname seller')
        .sort('-createdAt');

      const seller = items[0]?.seller || null;

      res.json({ items, seller });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  updateItem: async (req, res) => {
    try {
      const { title, description, price, location, images, category } = req.body;
      const item = await Bazar.findById(req.params.id);

      if (!item || item.seller.toString() !== req.user._id.toString())
        return res.status(403).json({ msg: 'Unauthorized or item not found.' });

      const oldUrls = item.images.map(img => img.url);
      const newUrls = images.map(img => img.url);
      const removedUrls = oldUrls.filter(url => !newUrls.includes(url));

      const bucket = process.env.AWS_BUCKET_NAME || 'akaunt-media';
      for (const url of removedUrls) {
        if (url && url.includes('.amazonaws.com/')) {
          const key = url.split('.amazonaws.com/')[1];
          if (key) {
            try {
              await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
            } catch (err) {
              console.warn(`Failed to delete ${key} from S3:`, err.message);
            }
          }
        }
      }

      const updatedItem = await Bazar.findOneAndUpdate(
        { _id: req.params.id, seller: req.user._id },
        { title, description, price, location, images, category },
        { new: true }
      ).populate('seller', 'avatar username fullname');

      res.json({ msg: 'Updated Item!', updatedItem });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  deleteItem: async (req, res) => {
    try {
      const item = await Bazar.findOneAndDelete({
        _id: req.params.id,
        seller: req.user._id,
      });

      if (!item)
        return res.status(400).json({ msg: 'Item not found or unauthorized.' });

      const bucket = process.env.AWS_BUCKET_NAME || 'akaunt-media';

      if (item.images && item.images.length > 0) {
        for (const image of item.images) {
          if (image.url && image.url.includes('.amazonaws.com/')) {
            // const key = image.url.split('.amazonaws.com/')[1];
            const key = decodeURIComponent(new URL(image.url).pathname.slice(1));

            if (key) {
              try {
                await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
              } catch (err) {
                console.warn(`Failed to delete ${key} from S3:`, err.message);
              }
            }
          }
        }
      }

      return res.json({ msg: 'Deleted Item!', deletedItem: item });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  
  saveItem: async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      const itemId = req.params.id;

      if (!user.savedBazarItems.includes(itemId)) {
        user.savedBazarItems.push(itemId);
        await user.save();
      }

      res.json({ msg: 'Item saved successfully.' });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  unsaveItem: async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      const itemId = req.params.id;

      user.savedBazarItems = user.savedBazarItems.filter(
        id => id.toString() !== itemId
      );
      await user.save();

      res.json({ msg: 'Item unsaved successfully.' });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  getSavedItems: async (req, res) => {
    try {
      const user = await User.findById(req.user._id).populate({
        path: 'savedBazarItems',
        populate: { path: 'seller', select: 'avatar username fullname seller' }
      });

      res.json({ items: user.savedBazarItems });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};

module.exports = bazarCtrl;