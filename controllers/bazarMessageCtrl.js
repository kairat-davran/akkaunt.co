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

const bazarMessageCtrl = {
  getBazarConversations: async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 9;

      const conversations = await BazarConversation.find({
        participants: req.user._id
      })
        .sort('-updatedAt')
        .limit(limit)
        .populate('participants', 'username fullname avatar')
        .populate('item', 'title images');

      return res.json({ conversations, result: conversations.length });
    } catch (err) {
      console.error('[getBazarConversations]', err);
      return res.status(500).json({ msg: err.message });
    }
  },

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
        participants: { $all: [userId, item.seller._id] },
      });

      if (!conversation) {
        conversation = new BazarConversation({
          item: itemId,
          participants: [userId, item.seller._id],
        });
        await conversation.save();
      }

      return res.json({ conversation });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  sendMessage: async (req, res) => {
    try {
      const { conversationId } = req.params;
      const { text, media } = req.body;

      const conversation = await BazarConversation.findById(conversationId);
      if (!conversation) return res.status(404).json({ msg: 'Conversation not found' });

      const recipient = conversation.participants.find(
        id => id.toString() !== req.user._id.toString()
      );

      const message = new BazarMessage({
        conversation: conversationId,
        sender: req.user._id,
        recipient,
        text,
        media,
      });

      await message.save();

      await BazarConversation.findByIdAndUpdate(conversationId, {
        lastMessage: { text, media },
        updatedAt: new Date(),
      });

      res.json({ message });
    } catch (err) {
      console.error('[sendMessage error]', err);
      return res.status(500).json({ msg: err.message });
    }
  },

  getMessages: async (req, res) => {
    try {
      const { conversationId } = req.params;

      const messages = await BazarMessage.find({ conversation: conversationId })
        .sort('createdAt')
        .populate('sender recipient', 'avatar username fullname');

      res.json({ messages });
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
        if (media.url && media.url.includes('.amazonaws.com/')) {
          const key = media.url.split('.amazonaws.com/')[1];
          if (key) {
            try {
              await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
            } catch (err) {
              console.warn(`Failed to delete ${key} from S3:`, err.message);
            }
          }
        }
      }

      res.json({ msg: 'Delete Success!' });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  deleteConversation: async (req, res) => {
    try {
      const convo = await BazarConversation.findOneAndDelete({
        _id: req.params.id,
        participants: req.user._id
      });

      if (!convo) return res.status(404).json({ msg: 'Conversation not found' });

      const messages = await BazarMessage.find({ conversation: convo._id });

      for (const message of messages) {
        for (const media of message.media) {
          if (media.url && media.url.includes('.amazonaws.com/')) {
            const key = media.url.split('.amazonaws.com/')[1];
            if (key) {
              try {
                await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
              } catch (err) {
                console.warn(`Failed to delete ${key} from S3:`, err.message);
              }
            }
          }
        }
      }

      await BazarMessage.deleteMany({ conversation: convo._id });

      res.json({ msg: 'Delete Success!' });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  }
};

module.exports = bazarMessageCtrl;