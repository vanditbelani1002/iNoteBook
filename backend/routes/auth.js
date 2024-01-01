const express = require('express')
const User = require('../Models/User')
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../Middleware/fetchuser')

//ROUTE 1: Create a User using POST '/api/auth/createuser'. No Login required

let success = false

router.post('/createuser',[
    body('name','Enter a Valid name').isLength({ min: 3 }),
    body('email','Enter a Valid Email').isEmail(),
    body('password','Password must be atleast 5 character').isLength({ min: 5 })
], async (req,res)=>{
  // If threre are errors return bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success,errors: errors.array() });
    }

    try {
      // Chech whether the user with the email exists already
    let user = await User.findOne({success,email: req.body.email});
    if(user){
      return res.status(400).json('Sorry a user with this email is already exist')
    }
    const salt = await bcrypt.genSalt(10);
    secPass = await bcrypt.hash(req.body.password,salt) 
     user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      })
      

      const data = {
        user:{
          id: user.id
        }
      }
      const authToken = jwt.sign(data,process.env.JWT)
      success = true
      res.json({success,authToken})
    } catch (error) {
     console.error(error.message) 
     res.status(500).send('Internal Server Error')
    }
})


//ROUTE 2: Authenticate a User using POST '/api/auth/login'. 

router.post('/login',[
  body('email','Enter a Valid Email').isEmail(),
  body('password','Password can not be balnk').exists(),
  ], async (req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }


const {email,password} = req.body;
try {
  let user = await User.findOne({email});
  if(!user){
    success=false
    return res.status(400).json({success,error:"Please try to login with correct credentials"})
  }
  const passwordCompare = await bcrypt.compare(password,user.password);
  if(!passwordCompare){
    success=false
   return res.status(400).json({success,error:"Please try to login with correct credentials"})
  }

  const data = {
    user:{
      id: user.id
    }
  }
  const authToken = jwt.sign(data,process.env.JWT);
  success = true
  res.json({success,authToken})

} catch (error) {
    console.error(error.message) 
    res.status(500).send('Internal Server Error')
}

})



//ROUTE 3:Get loggedin User Details Authenticate a User using POST '/api/auth/getuser' Login Required. 

router.post('/getuser',fetchuser, async (req,res)=>{
try {
  userId = req.user.id
  const user = await User.findById(userId).select("-password")
  res.send(user)
} catch (error) {
  console.error(error.message) 
  res.status(500).send('Internal Server Error')
}

})

module.exports= router