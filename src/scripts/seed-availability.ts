import mongoose from 'mongoose';
import { config } from 'dotenv';
config();

import { Attraction } from '../models/Attraction';
import { Availability } from '../models/Availability';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/attractions-network';

async function seedAvailability() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const attractions = await Attraction.find({ status: 'active' }).lean();
    console.log(`Found ${attractions.length} active attractions`);

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const daysToSeed = 90;

    let created = 0;

    for (const attraction of attractions) {
      for (let d = 0; d < daysToSeed; d++) {
        const date = new Date(now.getTime() + d * 24 * 60 * 60 * 1000);

        const existing = await Availability.findOne({
          attractionId: attraction._id,
          date,
        });

        if (existing) continue;

        const isTimeslotted = (attraction as any).availability?.type === 'time-slots';
        const capacity = 25;

        if (isTimeslotted) {
          await Availability.create({
            attractionId: attraction._id,
            date,
            timeSlots: [
              { time: '09:00', capacity, booked: 0 },
              { time: '10:00', capacity, booked: 0 },
              { time: '11:00', capacity, booked: 0 },
              { time: '14:00', capacity, booked: 0 },
              { time: '15:00', capacity, booked: 0 },
              { time: '16:00', capacity, booked: 0 },
            ],
            isBlocked: false,
          });
        } else {
          await Availability.create({
            attractionId: attraction._id,
            date,
            allDayCapacity: capacity * 6,
            allDayBooked: 0,
            isBlocked: false,
          });
        }

        created++;
      }
    }

    console.log(`Created ${created} availability records`);
    await mongoose.disconnect();
    console.log('Done!');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seedAvailability();
