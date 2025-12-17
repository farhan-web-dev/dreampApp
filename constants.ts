import { Vibe } from './types';

export const VIBES: Vibe[] = [
  {
    id: 'korean_indoor',
    title: 'Korean Indoor Soft Studio',
    description: 'Clean pastel tones, bright, elegant, airy curtains, soft lighting.'
  },
  {
    id: 'nature_forest',
    title: 'Nature Forest Mood',
    description: 'Tall trees, natural sunlight beams, warm romantic tones.'
  },
  {
    id: 'evening_lights',
    title: 'Romantic Evening Fairy Lights',
    description: 'Warm glowing lights, dreamy ambience, bokeh effects.'
  },
  {
    id: 'luxury_ballroom',
    title: 'Luxury Indoor Ballroom',
    description: 'Grand chandeliers, polished floor, elegant classical look.'
  },
  {
    id: 'sunset_beach',
    title: 'Sunset Beach Pastel Glow',
    description: 'Soft waves, orange sky, cinematic feeling, gentle breeze.'
  },
  {
    id: 'japanese_sakura',
    title: 'Japanese Sakura Theme',
    description: 'Cherry blossoms, soft pink, airy atmosphere, spring vibes.'
  },
  {
    id: 'minimalist_modern',
    title: 'Minimalist Modern Studio',
    description: 'Clean interior, simple & classy, high fashion aesthetic.'
  },
  {
    id: 'vintage_film',
    title: 'Vintage Film Outdoor',
    description: 'Muted tones, classic film grain, nostalgic feel.'
  },
  {
    id: 'botanical_greenhouse',
    title: 'Botanical Greenhouse',
    description: 'Glasshouse with lush plants, soft natural light, organic feel.'
  },
  {
    id: 'fantasy_ethereal',
    title: 'Fantasy Ethereal Theme',
    description: 'Magical landscapes, floating islands, mystic castles, dreamy supernatural lighting.'
  },
  {
    id: 'ocean_underwater',
    title: 'Deep Ocean Theme',
    description: 'Underwater aesthetic, coral reefs, blue marine tones, rays of light through water.'
  },
  {
    id: 'iconic_landmarks',
    title: 'Iconic World Landmarks',
    description: 'Famous structures (Eiffel Tower, Taj Mahal), historic architecture, grand travel vibes.'
  },
  {
    id: 'amusement_park',
    title: 'Amusement Park',
    description: 'Vibrant carousel lights, ferris wheel in background, playful and joyful atmosphere.'
  },
  {
    id: 'romantic_street',
    title: 'Romantic Street Lights',
    description: 'Urban night scene, bokeh street lamps, cozy city atmosphere, cinematic street photography.'
  },
];

export const PRE_WEDDING_SYSTEM_PROMPT = `
You are an advanced pre-wedding photo generation assistant.
Your goal is to create high-quality, cinematic, professionally-edited pre-wedding photos featuring the real couple from the uploaded images. 
Maintain face shape, eyes, nose, lips, hairstyle, and skin tone.
Cinematic composition, soft lighting, polished skin.
High-resolution, clean, sharp, professional-grade.
Realistic blending with background.
No double limbs, warped bodies, or artifacts.
`;