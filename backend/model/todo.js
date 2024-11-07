const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const todoSchema = new Schema(
  {
    text: {
      type: String,
      required: true,
    },
    todoStatus: {
      type: String,
      required: true,
    },
    priorityLevel: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model('Todo', todoSchema);
