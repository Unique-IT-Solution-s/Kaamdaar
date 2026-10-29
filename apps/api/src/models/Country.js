import mongoose from "mongoose";

const countrySchema = new mongoose.Schema({
    country_name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    country_code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      minlength: 2,
      maxlength: 2,
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
    collection: "countries",
})

const Country = mongoose.model("Country", countrySchema);

export default Country;