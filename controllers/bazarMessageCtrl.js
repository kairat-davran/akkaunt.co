const BazarConversation = require('../models/bazarConversationModel');
const BazarMessage = require('../models/bazarMessageModel');
const Bazar = require('../models/bazarModel');
const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-west-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});
const BUCKET = process.env.AWS_BUCKET_NAME || 'akaunt-media';

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

const bazarMessageCtrl = {
  startOrGetConversation: async (req, res) => {
    try {
      const { itemId } = req.params;
      const userId = req.user._id;

      const item = await Bazar.findById(itemId).populate('seller', '_id');
      if (!item) return res.status(404).json({ msg: 'Item not found' });

      if (item.seller._id.toString() === userId.toString()) {
        return res.status(400).json({ msg: "You can't message yourself." });
      }

      let conversation = await BazarConversation.findOne({
        item: itemId,
        recipients: { $all: [userId, item.seller._id] },
      });

      if (!conversation) {
        conversation = new BazarConversation({
          item: itemId,
          recipients: [userId, item.seller._id],
        });
        await conversation.save();
      }

      return res.json({ conversation });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  createMessage: async (req, res) => {
    try {
      const { recipient, text, media, offerPrice, itemId, conversation: convId } = req.body;
      const sender = req.user._id;

      if (!recipient || (!text?.trim() && media.length === 0 && !offerPrice)) return;

      let conversation;

      if (convId) {
        conversation = await BazarConversation.findById(convId);
        if (!conversation) return res.status(404).json({ msg: 'Conversation not found' });
      } else {
        const existing = await BazarConversation.findOne({
          recipients: { $all: [sender, recipient] },
          ...(itemId && { item: itemId })
        });

        if (existing) {
          conversation = existing;
        } else {
          conversation = new BazarConversation({
            recipients: [sender, recipient],
            ...(itemId && { item: itemId })
          });
          await conversation.save();
        }
      }

      const message = new BazarMessage({
        conversation: conversation._id,
        sender,
        recipient,
        text,
        media,
        offerPrice
      });

      await message.save();

      res.json({ msg: 'Message created successfully!', message });
    } catch (err) {
      console.error('[createMessage]', err);
      return res.status(500).json({ msg: err.message });
    }
  },

  getConversations: async (req, res) => {
    try {
      const features = new APIfeatures(
        BazarConversation.find({ recipients: req.user._id }),
        req.query
      ).paginating();

      const conversations = await features.query
        .sort('-updatedAt')
        .populate('recipients', 'username fullname avatar')
        .populate('item', 'title images');

      res.json({ conversations, result: conversations.length });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  getMessages: async (req, res) => {
    try {
      const { conversationId } = req.params;

      const features = new APIfeatures(
        BazarMessage.find({ conversation: conversationId }),
        req.query
      ).paginating();

      const messages = await features.query
        .sort('-createdAt')
        .populate('sender recipient', 'username fullname avatar');

      res.json({ messages, result: messages.length });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  deleteMessage: async (req, res) => {
    try {
      const message = await BazarMessage.findOneAndDelete({
        _id: req.params.id,
        sender: req.user._id
      });

      if (!message) return res.status(404).json({ msg: 'Message not found or unauthorized' });

      for (const media of message.media) {
        if (media.url?.includes('.amazonaws.com/')) {
          const key = media.url.split('.amazonaws.com/')[1];
          if (key) {
            try {
              await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
            } catch (err) {
              console.warn(`S3 delete failed for ${key}:`, err.message);
            }
          }
        }
      }

      res.json({ msg: 'Message deleted.' });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  deleteConversation: async (req, res) => {
    try {
      const convo = await BazarConversation.findOneAndDelete({
        _id: req.params.id,
        recipients: req.user._id
      });

      if (!convo) return res.status(404).json({ msg: 'Conversation not found' });

      const messages = await BazarMessage.find({ conversation: convo._id });

      for (const message of messages) {
        for (const media of message.media) {
          if (media.url?.includes('.amazonaws.com/')) {
            const key = media.url.split('.amazonaws.com/')[1];
            if (key) {
              try {
                await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
              } catch (err) {
                console.warn(`S3 delete failed for ${key}:`, err.message);
              }
            }
          }
        }
      }

      await BazarMessage.deleteMany({ conversation: convo._id });

      res.json({ msg: 'Conversation deleted.' });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  }
};

module.exports = bazarMessageCtrl;