const connection = require("../configs/database")

exports.getAllNotes = async (req, res) => {
  try {
    const query = "SELECT * FROM notes"
    console.log("Running Query:", query)

    const [rows] = await connection.query(query)
    console.log("Query Result:", rows)

    res.json(rows)
  } catch (error) {
    console.error("Error fetching notes:", error.message)
    res.status(500).json({ error: "Failed to retrieve notes" })
  }
}

exports.getNoteById = async (req, res) => {
  try {
    const [rows] = await connection.query("SELECT * FROM notes WHERE id = ?", [
      req.params.id,
    ])
    if (rows.length === 0)
      return res.status(404).json({ message: "Note not found" })
    res.json(rows[0])
  } catch (error) {
    console.error("Error fetching note:", error.message)
    res.status(500).json({ error: "Failed to retrieve note" })
  }
}

exports.createNote = async (req, res) => {
  try {
    const { title, content, category, user_id } = req.body;
    const noteCategory = category || "Uncategorized";

    const [result] = await connection.query(
      "INSERT INTO notes (title, content, category, user_id, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())",
      [title, content, noteCategory, user_id]
    );

    const [newNote] = await connection.query("SELECT * FROM notes WHERE id = ?", [result.insertId]);

    res.status(201).json(newNote[0]);
  } catch (error) {
    console.error("Error creating note:", error.message);
    res.status(500).json({ error: "Failed to create note" });
  }
};

exports.updateNote = async (req, res) => {
  try {
    const { title, content, category } = req.body;

    const noteCategory = category || "Uncategorized";

    const [result] = await connection.query(
      "UPDATE notes SET title = ?, content = ?, category = ?, updated_at = NOW() WHERE id = ?",
      [title, content, noteCategory, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Note not found" });
    }

    const [updatedNote] = await connection.query("SELECT * FROM notes WHERE id = ?", [req.params.id]);

    res.json(updatedNote[0]);
  } catch (error) {
    console.error("Error updating note:", error.message);
    res.status(500).json({ error: "Failed to update note" });
  }
};



exports.deleteNote = async (req, res) => {
  try {
    const [result] = await connection.query("DELETE FROM notes WHERE id = ?", [
      req.params.id,
    ])
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Note not found" })
    res.status(204).send()
  } catch (error) {
    console.error("Error deleting note:", error.message)
    res.status(500).json({ error: "Failed to delete note" })
  }
}

exports.getNotesByUserId = async (req, res) => {
  try {
    const userId = req.params.user_id
    const [rows] = await connection.query(
      "SELECT * FROM notes WHERE user_id = ?",
      [userId]
    )

    if (rows.length === 0) {
      return res.status(404).json({ message: "No notes found for this user" })
    }

    res.json(rows)
  } catch (error) {
    console.error("Error fetching notes by user_id:", error.message)
    res.status(500).json({ error: "Failed to retrieve notes for the user" })
  }
}
