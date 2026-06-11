import mongoose from 'mongoose';



const productSchema = new mongoose.Schema(

  {

    name: { type: String, required: true, trim: true },

    description: { type: String, required: true },

    price: { type: Number, required: true, min: 0 },

    category: {

      type: String,

      required: true,

      trim: true,

    },

    gender: {

      type: String,

      required: true,

      enum: ['Women', 'Men', 'Unisex'],

    },

    images: [

      {

        url: { type: String, required: true },

        public_id: { type: String },

      },

    ],

    stock: { type: Number, default: 10, min: 0 },

    isAvailable: { type: Boolean, default: true },

    material: { type: String },

    tags: [String],

    rating:     { type: Number, default: 0 },

    numReviews: { type: Number, default: 0 },

  },

  { timestamps: true }

);



// Text index for search

productSchema.index({ name: 'text', description: 'text', tags: 'text' });



const Product = mongoose.model('Product', productSchema);

export default Product;

