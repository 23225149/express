var express = require('express');
var router = express.Router();

const {connectToDB, ObjectId} = require('../utils/db');
const { generateToken} = require('../utils/auth');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/api/login', async function (req, res, next) {
  const db = await connectToDB();
  try {
    // check if the user exists
    // var studentNum = parseInt(req.body.studentNum,10)
    var user = await db.collection("users").findOne({ email: req.body.email });
    console.log(typeof req.body.email);
    if (!user) {
      res.status(401).json({ message: 'Account not found' });
      return;
    }

    //res.json(user);
    // delete user.password;
    // delete user.ip_address;

    // generate a JWT token
    const token = generateToken(user);

    // return the token
    res.json({ token: token });
  } catch (err) {
    res.status(400).json({ message: err.message });
  } finally {
    await db.client.close();
  }
});

router.get('/api/allStudent', async function (req, res) {
  const db = await connectToDB();
  try {
    let results = await db.collection("users").find({ role: 'student' }).toArray();
    res.json(results);
  } catch (err) {
    res.status(400).json({
      message: err.message
    });
  } finally {
    await db.client.close();
  }
});

// get untrained
router.get('/api/untrained', async function (req, res) {
  const db = await connectToDB();
  try {
    let results = await db.collection("users").find({ role: 'student', trained: false }).toArray();
    res.json(results);
  } catch (err) {
    res.status(400).json({
      message: err.message
    });
  } finally {
    await db.client.close();
  }
});






// PATCH endpoint to toggle the 'trained' status
router.patch('/api/student/train/:id', async function (req, res) {
    const { id } = req.params; 
    const db = await connectToDB();

    try {
        
        const student = await db.collection("users").findOne({ _id: new ObjectId(id) });
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }  
        const newTrainedStatus = !student.trained;

        const result = await db.collection("users").updateOne(
            { _id: new ObjectId(id) },
            { $set: { trained: newTrainedStatus } }
        );
        if (result.modifiedCount === 0) {
            return res.status(500).json({ message: "Failed to update the student's training status" });
        }
        res.json({ message: "Student's training status updated successfully" });
    } catch (err) {
        console.error("Error toggling student's trained status:", err);
        res.status(500).json({ message: err.message });
    } finally {
        await db.client.close();
    }
});

//search
router.get('/api/students/search', async function (req, res) {
  const { stuID } = req.query; 
  const db = await connectToDB();

  try {
      
      const students = await db.collection("users").find({ stuID: new RegExp(stuID, 'i'), role: 'student' }).toArray();

      if (!students.length) {
          return res.status(404).json({ message: "No matching students found" });
      }

      res.json(students);
  } catch (err) {
      console.error("Error searching for students:", err);
      res.status(500).json({ message: err.message });
  } finally {
      await db.client.close();
  }
});

router.get('/api/area', async function (req, res) {
  const db = await connectToDB();
  try {
      let results = await db.collection("places").find().toArray();
      if(results){
        res.json(results);
      }else{
        res.status(404).json({message: "Not found"})
      }
  } catch (err) {
      res.status(400).json({ message: err.message });
  } finally {
      await db.client.close();
  }
});

router.post('/api/addArea', async function (req, res) {
  const db = await connectToDB();
  try {
    req.body.capacity = parseInt(req.body.capacity);

    let result = await db.collection("places").insertOne(req.body);
    console.log("hello")
    res.status(201).json({ id: result.insertedId });
  } catch (err) {
    res.status(400).json({ message: err.message });
  } finally {
    await db.client.close();
  }
});

//search facility by name
router.get('/api/area/search', async function(req,res){
  const db = await connectToDB();
  const { name } = req.query;

  try{
    const facility = await db.collection("places").find({ name: new RegExp(name, 'i')}).toArray();
    if(!facility.length){
      return res.status(404).json({message:"no data"});
    }
    res.json(facility);
  }catch(error){
    console.log("Error on searching");
    res.status(500).json({message:"no facility"})
  }finally{
    await db.client.close();
  }
})

router.get('/api/editArea/:id', async function (req, res) {
  console.log("success")
  const db = await connectToDB();
  try {
      let result = await db.collection("places").findOne( {_id: new ObjectId(req.params.id)});
      if(result){
        res.json(result);
      }else{
        res.status(404).json({message: "Not found"})
      }
  } catch (err) {
      res.status(400).json({ message: err.message });
  } finally {
      await db.client.close();
  }
});

router.put('/api/editArea/:id', async function (req, res) {

  const db = await connectToDB();
  try {
      req.body.capacity= parseInt(req.body.capacity);

      delete req.body._id

      let result = await db.collection("places").updateOne({ _id: new ObjectId(req.params.id) }, { $set: req.body });

      console.log("edit is ok")

      if (result.modifiedCount > 0) {
          res.status(200).json({ message: "Booking updated" });
      } else {
          res.status(404).json({ message: "Booking not found" });
      }
  } catch (err) {
      res.status(400).json({ message: err.message });
  } finally {
      await db.client.close();
  }
});

router.delete('/api/area/:id', async function (req, res) {
    const db = await connectToDB();
    try {
        let result = await db.collection("places").deleteOne({ _id: new ObjectId(req.params.id) });

        if (result.deletedCount > 0) {
            res.status(200).json({ message: "facility deleted" });
        } else {
            res.status(404).json({ message: "facility not found" });
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    } finally {
        await db.client.close();
    }
});













// display account detail
router.get('/api/students/:id', async function (req, res) {
  console.log('API called');

const db = await connectToDB();
try {
  const result = await db.collection("student").findOne({ studentNum: parseInt(req.params.id,10) });
  console.log(typeof(req.params.studentNum));
   
    res.json(result);   
  
  // else {
  //   res.status(404).json({ message: "student not found" });
  // }
} catch (err) {
  res.status(400).json({ message: err.message });
} finally {
  await db.client.close();
}
});
module.exports = router;