import { createClient } from '@sanity/client';
// import sanityClient from '@sanity/client';
// import { extractRawText } from 'mammoth';
// import fs from 'fs';
// import mammoth from 'mammoth';

// Initialize Sanity client

const client = createClient({
    projectId: '6whyi5be',
    dataset: 'production',
    apiVersion: '2022-03-25',
    token: 'sk81cxFVog9K5Sd3i8iDLG8WhQjMsRxzbAIB6r3j5qgVjuuOaYkVrQBALHRW3Izh61q4yhAzEcDFSc24iAzQX9ihsCxsPA7ALVlNsTCHOTjr2aVFgdZI41jUsJou4J83J44qYCyqellJPNHP732AyDmZ3yVQ0UH4Sp4VBTJjDXxj61jix9uJ',
    useCdn: false,
});

document.addEventListener('DOMContentLoaded', function () {
    console.log("form.js: Form submitted");
    // Get the form element
    var form = document.getElementById('guestListForm');

    console.log("form.js: Form element retrieved");

    // Add form submission event listener
    form.addEventListener('submit', async function (e) {
        e.preventDefault(); // Prevent form submission

        // Get the current timestamp in PST
        var now = new Date();
        var timestamp = now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });

        var firstName = document.getElementById('firstName').value;
        var secondName = document.getElementById('secondName').value;
        var maleCount = parseInt(document.getElementById('maleCount').value);
        var femaleCount = parseInt(document.getElementById('femaleCount').value);
        var phone1 = document.getElementById('phone1').value;
        var phone2 = document.getElementById('phone2').value;
        var tonightClubs = Array.from(document.querySelectorAll('input[name="tonightClubs"]:checked')).map(function (checkbox) {
            return checkbox.value;
        });
        var tomorrowPools = Array.from(document.querySelectorAll('input[name="tomorrowPools"]:checked')).map(function (checkbox) {
            return checkbox.value;
        });
        var tomorrowNightClubs = Array.from(document.querySelectorAll('input[name="tomorrowNightClubs"]:checked')).map(function (checkbox) {
            return checkbox.value;
        });
        var hotel = document.getElementById('hotel').value;
        var otherHotel = document.getElementById('otherHotel').value.trim();
        var dateLeaving = document.getElementById('dateLeaving').value;

        try {
            // Create the first guest document
            const guest1 = await client.create({
                _type: 'guest',
                fullName: firstName,
                phoneNumber: phone1,
            });

            // Create the second guest document
            const guest2 = await client.create({
                _type: 'guest',
                fullName: secondName,
                phoneNumber: phone2,
            });

            // Create the group document
            const group = await client.create({
                _type: 'group',
                numMales: maleCount,
                numFemales: femaleCount,
                hotel: hotel === 'Other' ? otherHotel : hotel,
                groupMembers: [
                    { _type: 'reference', _ref: guest1._id },
                    { _type: 'reference', _ref: guest2._id },
                ],
            });

            // Create ticket documents for each selected event
            const ticketPromises = [];

            tonightClubs.forEach((clubName) => {
                ticketPromises.push(createTicket(guest1._id, clubName));
                ticketPromises.push(createTicket(guest2._id, clubName));
            });

            tomorrowPools.forEach((poolName) => {
                ticketPromises.push(createTicket(guest1._id, poolName));
                ticketPromises.push(createTicket(guest2._id, poolName));
            });

            tomorrowNightClubs.forEach((clubName) => {
                ticketPromises.push(createTicket(guest1._id, clubName));
                ticketPromises.push(createTicket(guest2._id, clubName));
            });

            await Promise.all(ticketPromises);

            console.log('Data saved successfully');
            form.reset(); // Reset the form
        } catch (error) {
            console.error('Error saving data:', error);
        }
    });

    // Function to create a ticket document
    async function createTicket(guestId, eventName) {
        console.log("form.js: Creating ticket for guest ID:", guestId, "and event:", eventName);
        const eventQuery = `*[_type == "event" && name match "${eventName}*"][0]`;
        const event = await client.fetch(eventQuery);
        console.log("form.js: Event document:", event);
    
        if (event) {
            console.log("form.js: Guest ID:", guestId);
            console.log("form.js: Event ID:", event._id);
    
            // Fetch the guest document based on the guestId
            const guestQuery = `*[_type == "guest" && _id == "${guestId}"][0]`;
            const guest = await client.fetch(guestQuery);
    
            if (guest) {
                const ticketTitle = `Ticket for ${guest.fullName} - ${event.name}`;
    
                await client.create({
                    _type: 'ticket',
                    title: ticketTitle,
                    guest: { _type: 'reference', _ref: guestId },
                    event: { _type: 'reference', _ref: event._id },
                });
            } else {
                console.error("form.js: Guest document not found for ID:", guestId);
            }
        }
    }
});