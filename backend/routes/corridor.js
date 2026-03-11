const express = require('express');
const Corridor = require('../models/Corridor');

const router = express.Router();

// Get corridor metadata (simplified line + length)
router.get('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const corridor = await Corridor.findOne({ key }).lean();
    if(!corridor) return res.status(404).json({ success:false, message:'Corridor not found' });
    res.json({ success:true, data:{
      key: corridor.key,
      name: corridor.name,
      encodedPolyline: corridor.encodedPolyline,
      lengthMeters: corridor.lengthMeters,
      endpoints: corridor.endpoints,
      simplifiedLine: corridor.simplifiedLine
    }});
  } catch(e){
    res.status(500).json({ success:false, message:e.message });
  }
});

module.exports = router;
