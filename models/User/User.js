import mongoose from 'mongoose'
import Post from '../Feed/Post.js'

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    onid: {
        type: String,
        unique: true,
        sparse: true,
    },
    googleId: {
        type: String,
        sparse: true,
    },
    online: {
        type: Boolean,
        default: false,
    },
    profile: {
        bio: {
            type: String,
            default: '',
        },
        avatar: {
            type: String,
            default: '',
        },
        followers: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }],
        following: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }],
    },
    standing: {
        type: String,
        enum: ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Grad Student'],
        required: false,
    },
    major: {
        type: String,
        required: false,
    },
    posts: {
        type: [Post.Schema],
        default: [],
    },
})

const User = mongoose.model('User', userSchema)

export default User
