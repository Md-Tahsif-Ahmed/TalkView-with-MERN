import { Router } from 'express'
import { compare } from 'bcrypt'
import joi from 'joi'
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import User from '../../models/User/User.js'
import { generateToken } from '../../middleware/token.js'

const router = Router()

router.post('/', async (req, res) => {
    const schema = joi.object({
        password: joi.string().required(),
        email: joi
            .string()
            .pattern(new RegExp('^[a-zA-Z0-9._%+-]+@oregonstate.edu$'))
            .required(),
    })

    try {
        const { error } = schema.validate(req.body)

        if (error) {
            return res.status(401).json({ message: error.details[0].message })
        }

        const user = await User.findOne({ email: req.body.email })

        const validPassword = await compare(req.body.password, user.password)

        const token = generateToken(user);

        if (user && validPassword) {
            user.online = true
            await user.save()
            const { password, ...userWithoutPassword } = user.toObject()
            return res
                .status(200)
                .json({ message: 'Welcome Back!', user: userWithoutPassword, token: token })
        } else if (user && !validPassword) {
            return res.status(401).json({ message: 'Incorrect password' })
        } else if (!user) {
            return res.status(401).json({ message: 'User not found' })
        } else {
            return res.status(401).json({ message: 'Login Failed' })
        }
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
})

// Google OAuth Configuration
const CALLBACK_URL = process.env.NODE_ENV === 'production'
    ? `${process.env.BACKEND_URL}/api/auth/google/callback`
    : `${process.env.BACKEND_URL}/api/auth/google/callback`;

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,
            proxy: true
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                console.log('Google profile:', profile); // Debug log

                // Extract username from email
                const email = profile.emails[0].value;
                const onid = email.split('@')[0];

                let user = await User.findOne({ email: email });
                
                if (!user) {
                    user = await User.create({
                        email: email,
                        name: profile.displayName || onid,
                        onid: onid, // Add ONID
                        password: `google_${profile.id}`,
                        googleId: profile.id,
                        profile: {
                            bio: '',
                            avatar: profile.photos?.[0]?.value || '',
                            followers: [],
                            following: []
                        }
                    });
                }

                if (!user.onid) {
                    user.onid = onid;
                    await user.save();
                }

                done(null, user);
            } catch (error) {
                console.error('Google Strategy Error:', error);
                done(error, null);
            }
        }
    )
);

// Keep these simple
passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

// Update the Google OAuth Routes
router.get('/google',
    passport.authenticate('google', { 
        scope: ['profile', 'email'],
        prompt: 'select_account' // Add this to force Google account selection
    })
)

router.get('/google/callback',
    passport.authenticate('google', { 
        failureRedirect: '/login',
        failureMessage: true
    }),
    async (req, res) => {
        try {
            const user = req.user
            user.online = true
            await user.save()

            const token = generateToken(user)
            const { password, ...userWithoutPassword } = user.toObject()

            // Redirect to frontend with token and user data
            res.redirect(`${process.env.FRONTEND_URL}/login?token=${token}&user=${JSON.stringify(userWithoutPassword)}`)
        } catch (error) {
            res.redirect(`${process.env.FRONTEND_URL}/login?error=Authentication failed`)
        }
    }
)

export default router
