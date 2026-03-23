import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    role:     { type: String, enum: ['user', 'admin'], default: 'user' },
    phone:    { 
      type: String, 
      validate: {
        validator: function(v) {
          return !v || /^[6-9]\d{9}$/.test(v);
        },
        message: 'Please provide a valid 10-digit phone number'
      }
    },
    address:  { 
      street: String, 
      city: String, 
      state: String, 
      pincode: { 
        type: String, 
        validate: {
          validator: function(v) {
            return !v || /^\d{6}$/.test(v);
          },
          message: 'Please provide a valid 6-digit pincode'
        }
      }
    },

    // Email verification
    isEmailVerified:       { type: Boolean, default: false },
    emailVerifyToken:      String,
    emailVerifyExpire:     Date,

    // Forgot password
    resetPasswordToken:    String,
    resetPasswordExpire:   Date,
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (pwd) {
  return bcrypt.compare(pwd, this.password);
};

// Generate 6-digit OTP for email verify / password reset
userSchema.methods.generateOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.emailVerifyToken  = crypto.createHash('sha256').update(otp).digest('hex');
  this.emailVerifyExpire = Date.now() + 10 * 60 * 1000; // 10 min
  return otp;
};

userSchema.methods.generateResetOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.resetPasswordToken  = crypto.createHash('sha256').update(otp).digest('hex');
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 min
  return otp;
};

const User = mongoose.model('User', userSchema);
export default User;

