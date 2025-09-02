const Notifies = require('../models/notifyModel')


const notifyCtrl = {
    createNotify: async (req, res) => {
        try {
            const { id, recipients, url, text, content, image } = req.body

            if (!Array.isArray(recipients)) {
                return res.status(400).json({ msg: 'Recipients must be an array' });
            }

            // Don't notify self
            if (recipients.includes(req.user._id.toString())) {
                return res.status(204).end();
            }

            const notify = new Notifies({
                id, recipients, url, text, content, image, user: req.user._id
            })

            await notify.save();
            return res.status(201).json({ notify });
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    removeNotify: async (req, res) => {
        try {
            const notify = await Notifies.findOneAndDelete({
                id: req.params.id, url: req.query.url
            })
            
            return res.json({notify})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    getNotifies: async (req, res) => {
        try {
            const limit = parseInt(req.query.limit) || 10;
            const page = parseInt(req.query.page) || 1;

            const notifies = await Notifies.find({ recipients: req.user._id })
            .sort('-createdAt')
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('user', 'avatar username');

            const total = await Notifies.countDocuments({ recipients: req.user._id });

            return res.json({
                notifies,
                total
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    isReadNotify: async (req, res) => {
        try {
            const notifies = await Notifies.findOneAndUpdate({_id: req.params.id}, {
                isRead: true
            })

            return res.json({notifies})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    markAllAsRead: async (req, res) => {
        try {
            const result = await Notifies.updateMany(
                { recipients: req.user._id, isRead: false },
                { $set: { isRead: true } }
            );

            return res.json({ msg: 'All notifications marked as read', updatedCount: result.modifiedCount });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    deleteAllNotifies: async (req, res) => {
        try {
            const notifies = await Notifies.deleteMany({recipients: req.user._id})
            
            return res.json({notifies})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
}


module.exports = notifyCtrl