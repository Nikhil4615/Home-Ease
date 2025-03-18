import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    displayName: {
        type: String,
    },
    phoneNumber: {
        type: String,
    },
    photoURL: {
        type: String,
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    addresses: [{
        street: String,
        city: String,
        state: String,
        zipCode: String,
        isDefault: Boolean
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    lastLogin: {
        type: Date,
        default: Date.now,
    },
});

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
