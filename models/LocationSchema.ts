import { Schema } from 'mongoose';

export const LocationSubSchema = new Schema(
  {
    locationId: { type: String, required: true },
    placeId: { type: String, default: '' },
    formattedAddress: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    city: { type: String, required: true },
    district: { type: String, default: '' },
    state: { type: String, default: '' },
    country: { type: String, default: 'DemoCountry' },
    postalCode: { type: String, default: '000000' },
    landmark: { type: String, default: '' },
    geoJSON: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
  },
  { _id: false }
);
