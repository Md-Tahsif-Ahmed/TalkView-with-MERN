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
        sparse: true,
    },
    password: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        required: true,
    },
    preferredPartner: {
        type: String,
        enum: ['any', 'male', 'female'],
        required: true,
    },
    educationLevel: {
        type: String,
        enum: ['school', 'college', 'university', 'job'],
        required: true,
    },
    englishLevel: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        required: true,
    },
    learningPurpose: {
        type: String,
        enum: ['ielts', 'study_abroad', 'job', 'personal'],
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
    facebookId: {
        type: String,
        unique: true,
        sparse: true,
    },
})

const User = mongoose.model('User', userSchema)

export default User
