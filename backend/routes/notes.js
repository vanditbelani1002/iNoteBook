const express = require('express')
const fetchuser = require('../Middleware/fetchuser')
const router = express.Router()
const Note = require('../Models/Note')
const { body, validationResult } = require('express-validator');

//ROUTE 1:Get All the notes using GET '/api/auth/getuser' Login Required.
router.get('/fetchallnotes',fetchuser,async (req,res)=>{
    try {    
    const notes = await Note.find({user:req.user.id})
    res.json(notes)
    } catch (error) {
        console.error(error.message) 
        res.status(500).send('Internal Server Error')

    }
})


//ROUTE 2:Add a note note using POST '/api/auth/getuser' Login Required.
router.post('/addnote',fetchuser,[
    body('title','Enter a Valid title').isLength({ min: 3 }),
    body('description','Enter a Valid Email'),
    body('description','description must be atleast 5 character').isLength({ min: 5 })
],async (req,res)=>{

    try {
        const{title,description,tag} = req.body;

    // If threre are errors return bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const note = new Note({
        title,description,tag,user:req.user.id
    })
    const savedNote = await note.save()
    res.json(savedNote)
    } catch (error) {
        console.error(error.message) 
        res.status(500).send('Internal Server Error')

    }

    
})


//ROUTE 3:Update an existing note using PUT '/api/auth/updatenote' Login Required.


router.put('/updatenote/:id', fetchuser, async (req, res) => {
    const {title, description, tag} = req.body;
    
    try {    
    // Create a newNote object
    const newNote  = {};
    if(title){newNote.title = title};
    if(description){newNote.description = description};
    if(tag){newNote.tag = tag};
    
    // Find the note to be updated and update it
    let note = await Note.findById(req.params.id);
    if(!note){return res.status(404).send("Not Found")}
    
    if(note.user.toString() !== req.user.id){
        return res.status(401).send("Not Allowed");
    }
    
    note = await Note.findByIdAndUpdate(req.params.id, {$set: newNote}, {new:true})
    res.json({note});
    } catch (error) {
        console.error(error.message) 
        res.status(500).send('Internal Server Error')

    }
    
    })
    
 //ROUTE 4:Delete an existing note using DELETE '/api/auth/deletenote' Login Required.

router.delete('/deletenote/:id', fetchuser, async (req, res) => {
    try {    
    // Find the note to be delete and delete it
    let note = await Note.findById(req.params.id);
    if(!note){return res.status(404).send("Not Found")}


    // Alllow deletion only if user owns this note 
    if(note.user.toString() !== req.user.id){
    return res.status(401).send("Not Allowed");
    }
    
    note = await Note.findByIdAndDelete(req.params.id)
    res.json({"Success":"Note has been deleted",note:note});
    
    } catch (error) {
        console.error(error.message) 
        res.status(500).send('Internal Server Error')
    }
})

module.exports = router
