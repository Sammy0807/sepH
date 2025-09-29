import mongoose, { Schema, Document } from 'mongoose';

export interface IEmailSignup extends Document {
  email: string;
  createdAt: Date;
}

const EmailSignupSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.EmailSignup || mongoose.model<IEmailSignup>('EmailSignup', EmailSignupSchema);