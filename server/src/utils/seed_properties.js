const mongoose = require('mongoose');
const connectDb = require('../config/db');
const Property = require('../models/property.model');
const User = require('../models/user.model');

const NEW_PROPERTIES = [
  {
    name: 'The Grand Alpine Chalet',
    description: 'Perched in the breathtaking Swiss Alps, this timber-crafted luxury chalet offers direct ski-in/ski-out access, a cedar-clad private sauna, an outdoor heated hot tub, and panoramic views of the Matterhorn.',
    location: {
      address: '74 Matterhorn Way',
      city: 'Zermatt',
      country: 'Switzerland',
      postalCode: '3920'
    },
    amenities: ['WiFi', 'AC', 'Fireplace', 'Private Sauna', 'Ski Access', 'Hot Tub', 'Breakfast Included', 'Mountain View'],
    imageUrls: [
      '/images/rooms/room6.jpg',
      '/images/rooms/presidential-view.jpg',
      '/images/rooms/presidential-bed.jpg',
      'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=1200&q=80'
    ],
    nightlyRateCents: 65000, // $650
    maxGuests: 6,
    currency: 'USD',
    status: 'published'
  },
  {
    name: 'Azure Horizon Ocean Villa',
    description: 'An iconic cliffside sanctuary overlooking the Aegean caldera. Features a private infinity plunge pool, sun-drenched marble terrace, outdoor dining pergola, and front-row seats to world-famous sunsets.',
    location: {
      address: '18 Caldera Cliff Path',
      city: 'Santorini',
      country: 'Greece',
      postalCode: '84702'
    },
    amenities: ['WiFi', 'AC', 'Infinity Pool', 'Sea View', 'Sunset Terrace', 'King Bed', 'Breakfast Included', 'Mini Bar'],
    imageUrls: [
      '/images/rooms/room1.jpg',
      '/images/rooms/presidential-bath.jpg',
      'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80'
    ],
    nightlyRateCents: 89000, // $890
    maxGuests: 4,
    currency: 'USD',
    status: 'published'
  },
  {
    name: 'Kyoto Bamboo Sanctuary Ryokan',
    description: 'Immerse yourself in authentic Japanese serenity. Enjoy private hinoki wood onsen thermal baths, tranquil tatami pavilions, a manicured rock garden, and traditional tea ceremony hospitality.',
    location: {
      address: '29 Arashiyama Lane',
      city: 'Kyoto',
      country: 'Japan',
      postalCode: '616-0000'
    },
    amenities: ['WiFi', 'AC', 'Private Onsen', 'Zen Garden', 'Tatami Living', 'Tea Ceremony', 'Kimono Robes', 'Mini Bar'],
    imageUrls: [
      '/images/rooms/room2.jpg',
      '/images/rooms/room5.jpg',
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80'
    ],
    nightlyRateCents: 42000, // $420
    maxGuests: 2,
    currency: 'USD',
    status: 'published'
  },
  {
    name: 'The Manhattan Skyline Penthouse',
    description: 'Towering above Central Park on the 64th floor, this modern architectural masterpiece offers double-height floor-to-ceiling glass, Italian marble surfaces, a private chef kitchen, and 24/7 dedicated concierge service.',
    location: {
      address: '432 Park Avenue',
      city: 'New York',
      country: 'United States',
      postalCode: '10022'
    },
    amenities: ['WiFi', 'AC', 'City View', 'Chef Kitchen', 'King Bed', 'Concierge 24/7', 'Gym Access', 'Smart TV'],
    imageUrls: [
      '/images/rooms/room6.jpg',
      '/images/rooms/presidential-kitchen.jpg',
      '/images/rooms/presidential-view.jpg',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'
    ],
    nightlyRateCents: 125000, // $1,250
    maxGuests: 4,
    currency: 'USD',
    status: 'published'
  },
  {
    name: 'Villa Bella Riviera',
    description: 'Perched high above the Mediterranean coastline along the Amalfi Drive. Surrounded by century-old lemon groves, this estate features vaulted stone arches, an infinity edge pool, and an outdoor wood-fired pizza oven.',
    location: {
      address: '14 Via Costiera',
      city: 'Amalfi',
      country: 'Italy',
      postalCode: '84011'
    },
    amenities: ['WiFi', 'AC', 'Ocean View', 'Private Pool', 'Wine Cellar', 'Espresso Bar', 'Breakfast Included', 'Terrace'],
    imageUrls: [
      '/images/rooms/room3.jpg',
      '/images/rooms/room4.jpg',
      'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80'
    ],
    nightlyRateCents: 78000, // $780
    maxGuests: 5,
    currency: 'USD',
    status: 'published'
  },
  {
    name: 'Desert Mirage Oasis Resort',
    description: 'An exclusive desert sanctuary offering private temperature-controlled plunge pools, Arabian architectural details, stargazing daybeds, camel trekking expeditions, and private fine dining in the dunes.',
    location: {
      address: 'Al Maha Desert Reserve',
      city: 'Dubai',
      country: 'United Arab Emirates',
      postalCode: '00000'
    },
    amenities: ['WiFi', 'AC', 'Private Plunge Pool', 'Dune View', 'Butler Service', 'Spa Access', 'King Bed', 'Fine Dining'],
    imageUrls: [
      '/images/rooms/room5.jpg',
      '/images/rooms/presidential-bed.jpg',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'
    ],
    nightlyRateCents: 95000, // $950
    maxGuests: 3,
    currency: 'USD',
    status: 'published'
  },
  {
    name: 'Bali Rainforest Eco Haven',
    description: 'Nestled on the lush Ayung River gorge, this bamboo eco-villa provides private tiered infinity pools, open-air riverfront suites, daily organic farm-to-table breakfast, and sunrise yoga sessions.',
    location: {
      address: '88 Sayan Ridge Road',
      city: 'Ubud',
      country: 'Indonesia',
      postalCode: '80571'
    },
    amenities: ['WiFi', 'AC', 'Infinity Pool', 'Jungle View', 'Open Air Bath', 'Yoga Deck', 'Organic Breakfast', 'Spa Access'],
    imageUrls: [
      '/images/rooms/room4.jpg',
      '/images/rooms/room1.jpg',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80'
    ],
    nightlyRateCents: 34000, // $340
    maxGuests: 2,
    currency: 'USD',
    status: 'published'
  },
  {
    name: 'The Kensington Royal Suite',
    description: 'Situated in the heart of royal London moments from Hyde Park. Boasts antique mahogany furnishings, hand-woven Persian carpets, marble soaking tubs, a private study library, and afternoon high tea service.',
    location: {
      address: '15 Palace Gate Gardens',
      city: 'London',
      country: 'United Kingdom',
      postalCode: 'W8 5LS'
    },
    amenities: ['WiFi', 'AC', 'Marble Bath', 'Private Library', 'Afternoon Tea', 'King Bed', 'City View', 'Smart TV'],
    imageUrls: [
      '/images/rooms/room2.jpg',
      '/images/rooms/presidential-bath.jpg',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80'
    ],
    nightlyRateCents: 58000, // $580
    maxGuests: 2,
    currency: 'USD',
    status: 'published'
  },
  {
    name: 'Le Marais Parisian Atelier',
    description: 'An elegant Haussmannian luxury apartment featuring herringbone hardwood floors, wrought-iron Juliet balconies overlooking cobblestone courtyards, curated French art, and a bespoke wine collection.',
    location: {
      address: '42 Rue des Rosiers',
      city: 'Paris',
      country: 'France',
      postalCode: '75004'
    },
    amenities: ['WiFi', 'AC', 'Haussmann Balcony', 'Wine Cooler', 'Designer Interior', 'King Bed', 'Espresso Machine', 'City View'],
    imageUrls: [
      '/images/rooms/room3.jpg',
      '/images/rooms/room6.jpg',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'
    ],
    nightlyRateCents: 46000, // $460
    maxGuests: 2,
    currency: 'USD',
    status: 'published'
  },
  {
    name: 'The Palm Beach Waterfront Estate',
    description: 'A sprawling gated coastal paradise with 120 feet of private deepwater dockage, palm-lined heated resort pool, outdoor summer kitchen, home theater, and walking distance to pristine Atlantic beaches.',
    location: {
      address: '1020 Ocean Drive',
      city: 'Miami',
      country: 'United States',
      postalCode: '33139'
    },
    amenities: ['WiFi', 'AC', 'Private Dock', 'Heated Pool', 'Outdoor Kitchen', 'Home Theater', 'Beach Access', 'King Bed'],
    imageUrls: [
      '/images/rooms/room6.jpg',
      '/images/rooms/presidential-kitchen.jpg',
      '/images/rooms/presidential-view.jpg',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'
    ],
    nightlyRateCents: 140000, // $1,400
    maxGuests: 8,
    currency: 'USD',
    status: 'published'
  }
];

async function seed() {
  try {
    await connectDb();
    console.log('[Seed] Connected to database');

    // Find default owner to assign properties to
    let owner = await User.findOne({ userName: 'sudipta' });
    if (!owner) {
      owner = await User.findOne({});
    }

    if (!owner) {
      throw new Error('No user found in database to assign as owner. Create a user first.');
    }

    console.log(`[Seed] Assigning properties to owner: ${owner.userName} (${owner._id})`);

    const inserted = [];
    for (const data of NEW_PROPERTIES) {
      // Check if property with same name already exists to prevent duplicate runs
      const existing = await Property.findOne({ name: data.name });
      if (existing) {
        console.log(`[Seed] Property "${data.name}" already exists, skipping.`);
        inserted.push(existing);
      } else {
        const created = await Property.create({
          ...data,
          owner: owner._id
        });
        console.log(`[Seed] Created property: ${created.name} (${created._id}) in ${created.location.city}`);
        inserted.push(created);
      }
    }

    const totalCount = await Property.countDocuments();
    console.log(`\n[Seed] Complete! Total properties now in DB: ${totalCount}`);
  } catch (err) {
    console.error('[Seed Error]:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('[Seed] Database disconnected.');
  }
}

seed();
