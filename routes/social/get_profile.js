import { Router } from 'express';
import User from '../../models/User/User.js';

const router = Router();

router.get('/', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const { onid } = req.query;
        
        if (!onid) {
            return res.status(400).json({ message: 'ONID is required' });
        }

        // First try to find by ONID
        let userProfile = await User.findOne({ onid: onid });

        // If not found by ONID, try to find by facebookId
        if (!userProfile) {
            userProfile = await User.findOne({ facebookId: onid });
        }

        // If still not found, try to find by email
        if (!userProfile) {
            const email = `${onid}@oregonstate.edu`;
            userProfile = await User.findOne({ email: email });
        }

        if (!userProfile) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Create a sanitized version of the user profile
        const sanitizedProfile = {
            id: userProfile._id,
            name: userProfile.name,
            onid: userProfile.onid || onid,
            email: userProfile.email,
            profile: userProfile.profile || {
                bio: '',
                avatar: '',
                followers: [],
                following: []
            },
            online: userProfile.online || false,
            facebookId: userProfile.facebookId // Add this if needed for frontend checks
        };

        return res.status(200).json({ user: sanitizedProfile });
    } catch (err) {
        console.error('Get Profile Error:', err);
        return res.status(500).json({ error: err.message });
    }
});

export default router;
