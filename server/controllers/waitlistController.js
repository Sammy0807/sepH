const Waitlist = require('../models/Waitlist');

exports.addToWaitlist = async (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, message: 'Invalid email.' });
  }
  try {
    const existing = await Waitlist.findOne({ email });
    if (existing) {
      return res.json({ success: false, message: "You're already on the waitlist." });
    }
    await Waitlist.create({ email });
    return res.json({ success: true, message: "Thanks! You’ve been added to the waitlist." });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}; 