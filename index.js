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
		const UserCollection = client.db("power_house").collection("user");
		console.log('Database Connected');

		// User Register
		app.post("/register", async (req, res) => {
			const data = req.body;
			const result = await UserCollection.insertOne(data);
			res.send(result);
		});
		// User Login
		app.post('/login', async (req, res) => {
			const { email, password } = req.body;
			const user = await UserCollection.findOne({ email: email });
			if (user && user.password === password) {
				res.status(200).json({ status: "valid users" });
			}
			else {
				res.status(404).json({ status: "Not a valid users" });
			}
		});

		// Created bill
		app.post('/add-billing', async (req, res) => {
			const data = req.body;
			const result = await billCollection.insertOne(data);
			res.send(result);
		});
		// ALL bill
		app.get('/bill-list', async (req, res) => {
			const cursor = billCollection.find({});
			const result = await cursor.toArray();
			res.send(result);
		});
		// Bill Update
		app.put('/update-billing/:id', async (req, res) => {
			const id = req.params.id;
			const filter = { _id: ObjectId(id) };
			const updateDoc = {
				$set: {
					name: req.body.name,
					phone: req.body.phone,
					email: req.body.email,
					amount: req.body.amount
				}
			};
			const result = await billCollection.updateMany(filter, updateDoc);
			res.send(result);
		})

		// Bill delete
		app.delete('/delete-billing/:id', async (req, res) => {
			const id = req.params.id;
			const query = { _id: ObjectId(id) };
			const result = await billCollection.deleteOne(query);
			res.send(result);
		});

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