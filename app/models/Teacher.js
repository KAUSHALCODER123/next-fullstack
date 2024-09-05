import mongoose from 'mongoose';

// Check if the mongoose connection is already established
if (!mongoose.connection.readyState) {
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

// Access the existing collection directly
const Teacher_data = mongoose.connection.collection('Teacher_data');

export default Teacher_data;
