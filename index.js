const express = require('express')
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
const dotenv = require('dotenv').config();
const jwt = require('jsonwebtoken');



const app = express();
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.t2kmaoa.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// function verifyJWT(req, res, next) {
// 	const authHeader = req.headers.authorization;
// 	if (!authHeader) {
// 		return res.status(401).send({ message: 'Unauthorized access' });
// 	};
// 	const token = authHeader.split(' ')[1];
// 	jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
// 		if (err) {
// 			return res.status(403).send({ message: 'Forbidden access' })
// 		}
// 		req.decoded = decoded;
// 		next();
// 	});
// }



async function run() {
	try {
		const billCollection = client.db("power_house").collection("bill");
		const UserCollection = client.db("power_house").collection("user");
		console.log('Database Connected');

		// User Register
		app.post("/register", async (req, res) => {
			const data = req.body;
			const result = await UserCollection.insertOne(data);
			res.send({ success: true });
		});
		// User Login
		app.post('/login', async (req, res) => {
			const { email, password } = req.body;
			const user = await UserCollection.findOne({ email: email });
			if (!user) {
				res.send({ success: false });
			}
			else if (user && user.password === password) {
				const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
				res.send({ email, token });
			}
			else {
				res.send({ success: false });
			}
		});
		// Search Keyword
		app.get('/search/:key', async (req, res) => {
			const key = req.params.key;
			const query = {
				$or: [
					{ name: { $regex: key, $options: "i" } },
					{ email: { $regex: key, $options: "i" } },
					{ phone: { $regex: key, $options: "i" } }
				]
			};
			const result = await billCollection.find(query).toArray();
			res.send(result);

		})

		// Created bill
		app.post('/add-billing', async (req, res) => {
			const data = req.body;
			const result = await billCollection.insertOne(data);
			res.send({ success: true });
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