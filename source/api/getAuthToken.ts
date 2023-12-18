import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv'

const app = express();
dotenv.config();

app.post('/getAuthToken', async (req, res) => {
    try {
        const postData = `secret_key=${process.env.SECRET_KEY}&username=${process.env.EMAIL}.com&access_level=FULL`;
        const response = await axios.post(`${process.env.BASE_URL}`, postData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'text/plain'
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching auth token:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
