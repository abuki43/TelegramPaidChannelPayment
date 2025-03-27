import mongoose from "mongoose";

/**
 * User schema for MongoDB
 */
const UserSchema = mongoose.Schema({
  userId: {
    type: Number,
    required: true,
    unique: true,
  },
  username: {
    type: String,
  },
  subscription: {
    startDate: Date,
    expirationDate: Date,
    isActive: { type: Boolean, default: false },
    inviteLink: String,
    inviteSentAt: Date,
    lastPaymentAmount: { type: Number, default: 0 },
    lastPaymentDate: Date,
    paymentHistory: [{
      amount: Number,
      date: Date,
      transactionId: String,
      verifiedAt: Date
    }]
  },
  totalMonths: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true 
});


UserSchema.index({ 'subscription.expirationDate': 1 });
UserSchema.index({ 'subscription.isActive': 1 });
UserSchema.index({ 'subscription.paymentHistory.transactionId': 1 });


UserSchema.methods = {
  // Check if subscription is active
  isSubscriptionActive() {
    return this.subscription && 
           this.subscription.isActive && 
           new Date() < new Date(this.subscription.expirationDate);
  },
  
  // Get days remaining in subscription
  getRemainingDays() {
    if (!this.isSubscriptionActive()) return 0;
    
    const now = new Date();
    const expirationDate = new Date(this.subscription.expirationDate);
    const diff = expirationDate - now;
    
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
};

/**
 * User model statics
 */
UserSchema.statics = {
  // Find users with expiring subscriptions
  async findExpiringSubscriptions(days = 3) {
    const date = new Date();
    const futureDate = new Date(date);
    futureDate.setDate(date.getDate() + days);
    
    return this.find({
      'subscription.isActive': true,
      'subscription.expirationDate': {
        $gte: date,
        $lte: futureDate
      }
    });
  },
  
  // Find expired subscriptions
  async findExpiredSubscriptions() {
    const date = new Date();
    
    return this.find({
      'subscription.isActive': true,
      'subscription.expirationDate': { $lt: date }
    });
  }
};

const User = mongoose.model("User", UserSchema);

export default User; 