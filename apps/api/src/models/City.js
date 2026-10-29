import mongoose from "mongoose";

const citySchema = new mongoose.Schema({
    city_name: {
      type: String,
      required: true,
      trim: true,
    },

    state_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "State",
      required: true,
    },

    country_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Country",
      required: true,
    },

    latitude: {
      type: Number,
      min: -90,
      max: 90,
      default: null,
    },

    longitude: {
      type: Number,
      min: -180,
      max: 180,
      default: null,
    },

    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    collection: "cities",
})

citySchema.index({state_id: 1, city_name: 1}, {unique : true})

const City = mongoose.model("City", citySchema)

export default City