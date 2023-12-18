import { makeSearchRequest, getColumns } from './GetColumnHelper'; // Update with correct file path
import express from 'express';

const app = express();

// Existing Express app setup...

app.post('/api/getColumnsData', async (req, res) => {
    try {
        const requestData = req.body; // Or use predefined requestData
        const response = await makeSearchRequest(requestData);
        const filterData = getColumns(response);
        res.status(200).json(filterData);
    } catch (error) {
        console.error('Error in /api/search:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default app;