//express import
const express = require('express');
const router = express.Router();
//use modle import
const User = require('./../models/user');
 
//imported jwt auth file
const {jwtAuthMiddleware,generateToken} = require('./../jwt');

//post route to add a user
router.post('/signup',async (req,res)=>{
    
    try{
        const data =req.body;
        //create new person document using model
        const newUser =new User(data);

        //save new person
        const response = await newUser.save();
        console.log("data saved successfully");

        const payload = {
            id: response.id
            
        }
        console.log(JSON.stringify(payload));
        const token = generateToken(payload);
        console.log("Token is:",token);
        res.status(201).json({response:response,token : token});
    }
    catch(err){
        console.log("Error saving person",err);
        res.status(500).json(error);
    }
})

router.post('/login', async(req, res) => {
    try{
        // Extract aadharCardNumber and password from request body
        const {aadharCardNumber, password} = req.body;

        // Check if aadharCardNumber or password is missing
        if (!aadharCardNumber || !password) {
            return res.status(400).json({ error: 'Aadhar Card Number and password are required' });
        }

        // Find the user by aadharCardNumber
        const user = await User.findOne({aadharCardNumber: aadharCardNumber});

        // If user does not exist or password does not match, return error
        if( !user || !(await user.comparePassword(password))){
            return res.status(401).json({error: 'Invalid Aadhar Card Number or Password'});
        }

        // generate Token 
        const payload = {
            id: user.id,
        }
        const token = generateToken(payload);

        // resturn token as response
        res.json({token})
    }catch(err){
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/profle',jwtAuthMiddleware,async (req,res)=>{
    try{

        const userData = req.user;
        const userId = userData.id;
        const user = await User.findByid(userId);
        console.log("data fetched");
        res.status(200).json({user});
    }
    catch(err){
        console.log("Error saving person",err);
        res.status(500).json(error);
    }
})

router.put('/:profile/password',async (req,res)=>
    {
      try{
        const userId = req.user;
        const {currentpassword,newpassword} = req.body;
        const user = await User.findById({userId});

        if(!(await user.comparePassword(currentpassword))){
            return res.status(401).json({error: 'Invalid Aadhar Card Number or Password'});
        }
            user.password =newpassword;
            await user.save();
            return res.status(200).json({message : 'password changed Successfully'});
        
    }
    catch(err){
        console.log("Error updating person",err);
        res.status(500).json(error);
    }
})


module.exports = router;