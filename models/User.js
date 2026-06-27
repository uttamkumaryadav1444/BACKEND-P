import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true
  }
}, { 
  timestamps: true 
});

// SIMPLEST pre-save hook - NO next() function
UserSchema.pre("save", function() {
  const user = this;
  
  if (!user.isModified("password")) {
    return;
  }

  // Hash password using sync methods
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(user.password, salt);
  user.password = hash;
});

// Compare password - sync method
UserSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compareSync(candidatePassword, this.password);
};

export default mongoose.model("User", UserSchema);