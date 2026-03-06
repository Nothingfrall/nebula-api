const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://mipowfu_db_user:nebula001@cluster0.izxow6j.mongodb.net/?appName=Cluster0";
const client = new MongoClient(uri);

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const { key } = req.query;

    if (!key) return res.status(400).json({ success: false, message: "Key mana cok?" });

    try {
        await client.connect();
        const db = client.db('NebulaDB');
        const collection = db.collection('keys');
        
        const result = await collection.findOne({ key: key });

        if (result) {
            return res.status(200).json({ success: true });
        } else {
            return res.status(200).json({ success: false, message: "Key Salah!" });
        }
    } catch (e) {
        return res.status(500).json({ success: false, error: e.message });
    } finally {
        await client.close();
    }
};