const User = require('../models/user.model');
const { Webhook } = require('svix');

const handleWebhook = async (req, res) => {
    console.log('Webhook received!');
    const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
    if (!WEBHOOK_SECRET) {
        console.error('Webhook secret not configured.');
        return res.status(400).send('Webhook secret not configured.');
    }

    const headers = req.headers;
    const payload = req.body;

    const svix_id = headers['svix-id'];
    const svix_timestamp = headers['svix-timestamp'];
    const svix_signature = headers['svix-signature'];

    if (!svix_id || !svix_timestamp || !svix_signature) {
        console.error('Missing Svix headers');
        return res.status(400).send('Error occured -- no svix headers');
    }

    console.log('Verifying webhook signature...');
    const wh = new Webhook(WEBHOOK_SECRET);
    let evt;

    try {
        evt = wh.verify(payload, {
            'svix-id': svix_id,
            'svix-timestamp': svix_timestamp,
            'svix-signature': svix_signature,
        });
        console.log('Webhook signature verified successfully!');
    } catch (err) {
        console.error('Error verifying webhook:', err.message);
        return res.status(400).send('Error occured');
    }

    const eventType = evt.type;
    console.log(`Processing event type: ${eventType}`);

    if (eventType === 'user.created') {
        const { id, email_addresses, first_name, last_name } = evt.data;
        console.log(`Attempting to create user in DB for event type: ${eventType} with Clerk ID: ${id}`);
        try {
            const newUser = new User({
                clerkId: id,
                email: email_addresses[0].email_address,
                name: `${first_name} ${last_name}`,
            });
            await newUser.save();
            console.log('User successfully created in DB:', newUser);
        } catch (error) {
            console.error('Error creating user in DB:', error.message);
            return res.status(500).send('Error creating user');
        }
    } else {
        console.log(`Webhook received event type: ${eventType}, not processing for user creation.`);
    }

    if (eventType === 'user.updated') {
        try {
            const updatedUser = await User.findOneAndUpdate(
                { clerkId: id },
                {
                    email: email_addresses[0].email_address,
                    name: `${first_name} ${last_name}`,
                },
                { new: true }
            );
            console.log('User updated in DB:', updatedUser);
        } catch (error) {
            console.error('Error updating user in DB:', error);
            return res.status(500).send('Error updating user');
        }
    }
    
    if (eventType === 'user.deleted') {
        try {
            await User.findOneAndDelete({ clerkId: id });
            console.log('User deleted from DB');
        } catch (error) {
            console.error('Error deleting user in DB:', error);
            return res.status(500).send('Error deleting user');
        }
    }

    res.status(200).send('Webhook processed');
};

module.exports = { handleWebhook };