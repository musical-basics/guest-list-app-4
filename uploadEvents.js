import { createClient } from '@sanity/client';
import { extractRawText } from 'mammoth';
import fs from 'fs';
import mammoth from 'mammoth';

// Initialize Sanity client
const client = createClient({
  projectId: '6whyi5be',
  dataset: 'production',
  apiVersion: '2022-03-25',
  token: 'sk81cxFVog9K5Sd3i8iDLG8WhQjMsRxzbAIB6r3j5qgVjuuOaYkVrQBALHRW3Izh61q4yhAzEcDFSc24iAzQX9ihsCxsPA7ALVlNsTCHOTjr2aVFgdZI41jUsJou4J83J44qYCyqellJPNHP732AyDmZ3yVQ0UH4Sp4VBTJjDXxj61jix9uJ',
  useCdn: false,
});

const hardcodedVenues = [
  'Hakkasan', 'Omnia', 'Cathedrale: Disco Kiss', 'Jewel', 'Liquid', 'Marquee DC',
  'Marquee NC', 'Tao Beach', 'Tao Nightclub', 'Wet Republic'
];

const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

async function createEventsFromDocument(filePath, startDate) {
  const fileBuffer = fs.readFileSync(filePath);
  const result = await mammoth.extractRawText({ buffer: fileBuffer });
  const document = result.value;
  const lines = document.split('\n').map(line => line.trim()).filter(line => line !== '');

  let currentVenue = null;
  let currentEvent = null;

  for (const line of lines) {
    if (hardcodedVenues.includes(line.replace(/\*\*/g, ''))) {
      // Extract venue name
      const venueName = line.replace(/\*\*/g, '').trim();
      currentVenue = await getOrCreateVenue(venueName);
      console.log(`Processing events for venue: ${venueName}`);
    } else if (dayNames.some(day => line.startsWith(day))) {
      if (currentEvent) {
        // Split the rules string into an array of strings
        currentEvent.rules = currentEvent.rules.trim().split('\n');

        // Check if an event with the same name already exists
        const existingEvent = await client.fetch(`*[_type == "event" && name == $name][0]`, { name: currentEvent.name });
        if (!existingEvent) {
          // Create the previous event in Sanity
          await client.create(currentEvent);
          console.log(`Event created: ${currentEvent.name}`);
        } else {
          console.log(`Event already exists: ${currentEvent.name}`);
        }
      }

      // Extract event details
      const [day, artistName] = line.split('(');
      const date = getDateFromDay(day.trim(), startDate);
      const formattedDate = formatDate(date);
      let cleanedArtistName = '';

      if (artistName) {
        cleanedArtistName = artistName.replace(/\).*/, '').trim();
      }

      if (currentVenue) {
        const artist = await getOrCreateArtist(cleanedArtistName || 'TBA');
        currentEvent = {
          _type: 'event',
          name: `${currentVenue.name} - ${day.trim()} (${artist.name}) ${formattedDate}`,
          date: date,
          artist: { _type: 'reference', _ref: artist._id },
          venue: { _type: 'reference', _ref: currentVenue._id },
          rules: '',
        };
        console.log(`Creating event: ${currentEvent.name}`);
      } else {
        console.log(`Skipping event creation due to missing venue: ${line}`);
      }
    } else if (currentEvent) {
      // Append line to event rules
      currentEvent.rules += `${line}\n`;
    }
  }

  // Create the last event in Sanity
  if (currentEvent) {
    // Split the rules string into an array of strings
    currentEvent.rules = currentEvent.rules.trim().split('\n');

    // Check if an event with the same name already exists
    const existingEvent = await client.fetch(`*[_type == "event" && name == $name][0]`, { name: currentEvent.name });
    if (!existingEvent) {
      await client.create(currentEvent);
      console.log(`Event created: ${currentEvent.name}`);
    } else {
      console.log(`Event already exists: ${currentEvent.name}`);
    }
  }
}

async function getOrCreateVenue(name) {
  const existingVenue = await client.fetch(`*[_type == "venue" && name == $name][0]`, { name });
  if (existingVenue) {
    return existingVenue;
  }
  return await client.create({ _type: 'venue', name });
}

async function getOrCreateArtist(name) {
  const existingArtist = await client.fetch(`*[_type == "artist" && name == $name][0]`, { name });
  if (existingArtist) {
    return existingArtist;
  }
  return await client.create({ _type: 'artist', name });
}

function getDateFromDay(day, startDate) {
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const targetDayIndex = daysOfWeek.indexOf(day);
  const startDayIndex = startDate.getDay();
  const daysUntilTarget = (targetDayIndex - startDayIndex + 7) % 7;
  const eventDate = new Date(startDate);
  eventDate.setDate(eventDate.getDate() + daysUntilTarget);
  return eventDate;
}

function formatDate(date) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

// Usage example
const filePath = 'Guestlist Rules w-e 5-8-24.docx';
const startDate = new Date('2024-05-02'); // Thursday, May 2, 2024
createEventsFromDocument(filePath, startDate);