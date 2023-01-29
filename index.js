const express = require('express')
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
const dotenv = require('dotenv').config();



const app = express();
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.t2kmaoa.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });




async function run() {
	try {
		const billCollection = client.db("power_house").collection("bill");
		console.log('Database Connected');

		// Created bill
		app.post('/add-billing', async (req, res) => {
			const bill = req.body;
			const result = await billCollection.insertOne(bill);
			res.send(result);
		})

	} finally {
		// await client.close();
	}
}
run().catch(console.dir);


app.get('/', (req, res) => {
	res.send('Power Hack House Server Running')
})

app.listen(port, () => {
	console.log(`Doctors Portal Server app listening on port ${port}`)
});