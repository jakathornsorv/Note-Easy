const express = require("express")
const router = express.Router()
const noteController = require("../controllers/noteController")

router.get("/notes", noteController.getAllNotes)
router.get("/notes/:id", noteController.getNoteById)
router.post("/notes", noteController.createNote)
router.put("/notes/:id", noteController.updateNote)
router.delete("/notes/:id", noteController.deleteNote)
router.get("/notes/user/:user_id", noteController.getNotesByUserId)

module.exports = router
