const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://mipowfu_db_user:nebula001@cluster0.izxow6j.mongodb.net/?appName=Cluster0";
const client = new MongoClient(uri);

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const { key } = req.query;
    try {
        await client.connect();
        const db = client.db('NebulaDB');
        const collection = db.collection('keys');
        await collection.insertOne({ key: key, created: Date.now() });
        res.status(200).json({ success: true, message: "Key ditambahkan!" });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    } finally {
        await client.close();
    }
};