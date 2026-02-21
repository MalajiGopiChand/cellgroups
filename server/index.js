import express from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://gopimackeysgopimackeys_db_user:<db_password>@cluster0.m3qqwll.mongodb.net/?appName=Cluster0';
let db;

MongoClient.connect(MONGODB_URI)
  .then(client => {
    console.log('Connected to MongoDB');
    db = client.db('cellgroups');
  })
  .catch(error => {
    console.error('MongoDB connection error:', error);
  });

// Admin login
app.post('/api/admin/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'bethel@gmail.com' && password === '123456') {
    res.json({ success: true, role: 'admin', email });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// Cell Leader signup
app.post('/api/cellleader/signup', async (req, res) => {
  try {
    const { email, password, name, place, area } = req.body;
    
    const existingUser = await db.collection('cellleaders').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newLeader = {
      email,
      password: hashedPassword,
      name,
      place,
      area,
      approved: false,
      createdAt: new Date()
    };

    await db.collection('cellleaders').insertOne(newLeader);
    res.json({ success: true, message: 'Registration successful. Waiting for admin approval.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Cell Leader login
app.post('/api/cellleader/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const leader = await db.collection('cellleaders').findOne({ email });
    
    if (!leader) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, leader.password);
    if (!validPassword) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!leader.approved) {
      return res.json({ success: false, approved: false, message: 'Pending admin approval' });
    }

    res.json({ 
      success: true, 
      role: 'cellleader', 
      email: leader.email,
      name: leader.name,
      place: leader.place,
      area: leader.area,
      id: leader._id.toString()
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all Cell Leaders (Admin)
app.get('/api/admin/cellleaders', async (req, res) => {
  try {
    const leaders = await db.collection('cellleaders').find({}).toArray();
    // Ensure _id is included as string
    const leadersWithId = leaders.map(leader => ({
      ...leader,
      _id: leader._id.toString()
    }));
    res.json({ success: true, leaders: leadersWithId });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Approve Cell Leader
app.post('/api/admin/approve/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('cellleaders').updateOne(
      { _id: new ObjectId(id) },
      { $set: { approved: true, approvedAt: new Date() } }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get dashboard stats (Admin)
app.get('/api/admin/stats', async (req, res) => {
  try {
    const totalLeaders = await db.collection('cellleaders').countDocuments();
    const approvedLeaders = await db.collection('cellleaders').countDocuments({ approved: true });
    const pendingLeaders = await db.collection('cellleaders').countDocuments({ approved: false });
    const totalStudents = await db.collection('students').countDocuments();
    
    res.json({
      success: true,
      stats: {
        totalLeaders,
        approvedLeaders,
        pendingLeaders,
        totalStudents
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all students grouped by Cell Leader
app.get('/api/admin/students', async (req, res) => {
  try {
    const students = await db.collection('students').find({}).toArray();
    const leaders = await db.collection('cellleaders').find({}).toArray();
    
    const grouped = leaders.map(leader => ({
      leader: {
        id: leader._id.toString(),
        name: leader.name,
        email: leader.email,
        place: leader.place,
        area: leader.area,
        approved: leader.approved
      },
      students: students.filter(s => {
        const leaderId = leader._id.toString();
        return s.cellLeaderId === leaderId || s.cellLeaderId === leader._id;
      })
    }));
    
    res.json({ success: true, grouped });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Add student (Cell Leader)
app.post('/api/student/add', async (req, res) => {
  try {
    const { name, place, area, cellLeaderName, cellLeaderId } = req.body;
    const student = {
      name,
      place,
      area,
      cellLeaderName,
      cellLeaderId,
      createdAt: new Date()
    };
    
    await db.collection('students').insertOne(student);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get students for a Cell Leader
app.get('/api/student/:cellLeaderId', async (req, res) => {
  try {
    const { cellLeaderId } = req.params;
    const students = await db.collection('students')
      .find({ cellLeaderId })
      .toArray();
    // Ensure _id is included in response
    const studentsWithId = students.map(s => ({
      ...s,
      _id: s._id.toString()
    }));
    res.json({ success: true, students: studentsWithId });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Mark attendance
app.post('/api/attendance/mark', async (req, res) => {
  try {
    const { cellLeaderId, place, date, attendance } = req.body;
    await db.collection('attendance').updateOne(
      { cellLeaderId, place, date },
      { 
        $set: { 
          cellLeaderId, 
          place, 
          date, 
          attendance,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get attendance
app.get('/api/attendance/:cellLeaderId/:place/:date', async (req, res) => {
  try {
    const { cellLeaderId, place, date } = req.params;
    const record = await db.collection('attendance').findOne({ 
      cellLeaderId, 
      place, 
      date 
    });
    res.json({ success: true, attendance: record?.attendance || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Send announcement (Admin)
app.post('/api/announcement/send', async (req, res) => {
  try {
    const { title, message, recipientType, cellLeaderId } = req.body;
    const announcement = {
      title,
      message,
      recipientType, // 'all' or 'specific'
      cellLeaderId: recipientType === 'specific' ? cellLeaderId : null,
      createdAt: new Date()
    };
    
    await db.collection('announcements').insertOne(announcement);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get announcements (Cell Leader)
app.get('/api/announcement/:cellLeaderId', async (req, res) => {
  try {
    const { cellLeaderId } = req.params;
    const announcements = await db.collection('announcements')
      .find({
        $or: [
          { recipientType: 'all' },
          { cellLeaderId }
        ]
      })
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json({ success: true, announcements });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
