import mongoose from 'mongoose';

import dotenv from 'dotenv';

import Category from './models/Category.js';



dotenv.config();



const INITIAL_CATEGORIES = ['Necklace', 'Earrings', 'Bracelet', 'Ring', 'Anklet', 'Pendant', 'Set'];



const seedCategories = async () => {

  try {

    await mongoose.connect(process.env.MONGO_URI);

    console.log('MongoDB Connected for Seeding...');



    for (const cat of INITIAL_CATEGORIES) {

      const exists = await Category.findOne({ name: cat });

      if (!exists) {

        await Category.create({ name: cat });

        console.log(`Added category: ${cat}`);

      }

    }

    

    console.log('Category seeding complete!');

    process.exit(0);

  } catch (error) {

    console.error('Error seeding categories:', error);

    process.exit(1);

  }

};



seedCategories();

