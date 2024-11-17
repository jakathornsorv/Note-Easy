<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { getItemById, addItem, deleteItemById, editItem } from "../../libs/fetchUtils";

const router = useRouter();

const username = ref("");
const noteList = ref([]);
const errorMessage = ref("");

const filterCategory = ref("");
const isModalOpen = ref(false);
const mode = ref("add");
const selectedNoteId = ref(null);
const newNote = ref({ title: "", content: "", category: "", created_at: "", updated_at: "" });

const currentPage = ref(1);
const notesPerPage = ref(3);

const sortOrder = ref("asc");

onMounted(async () => {
    const storedUsername = localStorage.getItem("userName");
    const userId = localStorage.getItem("userId");

    if (storedUsername && userId) {
        username.value = storedUsername;
        try {
            const notes = await getItemById("http://localhost:3000/api/notes/user", userId);
            noteList.value = Array.isArray(notes) ? notes : [];
        } catch (error) {
            errorMessage.value = "Failed to load notes";
            noteList.value = [];
        }
    } else {
        router.push({ name: "Login" });
    }
});

const sortedNotes = computed(() => {
    const sorted = [...noteList.value];
    sorted.sort((a, b) => (sortOrder.value === "asc" ? a.id - b.id : b.id - a.id));
    return sorted;
});

const filteredNotes = computed(() => {
    const notes = sortedNotes.value;
    if (!filterCategory.value) return notes;
    return notes.filter((note) => note.category === filterCategory.value);
});

const paginatedNotes = computed(() => {
    const startIndex = (currentPage.value - 1) * notesPerPage.value;
    const endIndex = startIndex + notesPerPage.value;
    return filteredNotes.value.slice(startIndex, endIndex);
});

const totalPages = computed(() => Math.ceil(filteredNotes.value.length / notesPerPage.value));

const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
    }
};

const toggleSortOrder = () => {
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
};

const uniqueCategories = computed(() => {
    const categories = noteList.value.map((note) => note.category || "Uncategorized");
    return [...new Set(categories)];
});

const logout = () => {
    localStorage.clear();
    router.push({ name: "Login" });
};

const openAddModal = () => {
    mode.value = "add";
    clearForm();
    isModalOpen.value = true;
};

const openEditModal = (note) => {
    mode.value = "edit";
    selectedNoteId.value = note.id;
    newNote.value = { ...note };
    isModalOpen.value = true;
};

const closeModal = () => {
    isModalOpen.value = false;
    clearForm();
};

const clearForm = () => {
    newNote.value = { title: "", content: "", category: "", created_at: "", updated_at: "" };
    selectedNoteId.value = null;
};

const saveNote = async () => {
    const userId = localStorage.getItem("userId");
    if (!newNote.value.title || !newNote.value.content) {
        alert("Please fill out all required fields.");
        return;
    }
    try {
        if (mode.value === "add") {
            const addedNote = await addItem("http://localhost:3000/api/notes", {
                ...newNote.value,
                user_id: userId,
            });
            noteList.value.push(addedNote);
        } else if (mode.value === "edit") {
            const updatedNote = await editItem(
                "http://localhost:3000/api/notes",
                selectedNoteId.value,
                newNote.value
            );
            const index = noteList.value.findIndex((note) => note.id === selectedNoteId.value);
            if (index !== -1) {
                noteList.value[index] = updatedNote;
            }
        }
        closeModal();
    } catch (error) {
        alert(`Failed to ${mode.value} note. Please try again.`);
    }
};

const deleteNote = async (id) => {
    const confirmed = confirm("Are you sure you want to delete this Note?");
    if (confirmed) {
        try {
            const responseStatus = await deleteItemById("http://localhost:3000/api/notes", id);
            if (responseStatus === 204) {
                noteList.value = noteList.value.filter((note) => note.id !== id);
                alert("Note deleted");
            } else {
                alert("Please try again");
            }
        } catch (error) {
            alert("Error to delete this note:", error);
        }
    }
};

const formatDate = (dateString) => {
    const normalizedDateString = dateString.replace(" ", "T");

    const date = new Date(normalizedDateString);
    if (isNaN(date)) return "Invalid Date";

    return date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
};
</script>

<template>
    <div class="min-h-screen bg-gray-100">
        <header class="bg-blue-600 text-white p-4 shadow-md relative flex items-center justify-center">
            <h1 class="text-xl font-bold">Welcome, {{ username }}</h1>
            <button @click="logout" class="absolute right-4 px-4 py-2 bg-red-500 rounded-lg hover:bg-red-600">
                Logout
            </button>
        </header>

        <main class="container mx-auto p-6">
            <h2 class="flex items-center justify-center text-2xl font-semibold text-gray-800 mb-4">Note List</h2>
            <div class="mb-4 flex items-center justify-between">
                <div>
                    <label for="category-filter" class="block text-gray-600 text-sm font-medium">Filter by
                        Category:</label>
                    <select id="category-filter" v-model="filterCategory" class="px-3 py-2 mt-1 border rounded-lg">
                        <option value="">All Categories</option>
                        <option v-for="category in uniqueCategories" :key="category" :value="category">
                            {{ category }}
                        </option>
                    </select>
                </div>

                <button @click="openAddModal" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    Add Note
                </button>
            </div>

            <div class="bg-white shadow-md rounded-lg overflow-hidden">
                <table class="table-auto w-full border-collapse">
                    <thead class="bg-blue-100 text-gray-800">
                        <tr>
                            <th class="px-4 py-2 border cursor-pointer" @click="toggleSortOrder">
                                ID
                                <span v-if="sortOrder === 'asc'">▲</span>
                                <span v-else>▼</span>
                            </th>
                            <th class="px-4 py-2 border">Title</th>
                            <th class="px-4 py-2 border">Content</th>
                            <th class="px-4 py-2 border">Category</th>
                            <th class="px-4 py-2 border">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(note, index) in paginatedNotes" :key="note.id" class="odd:bg-gray-100">
                            <td class="px-4 py-2 border text-center">{{ index + 1 }}</td>
                            <td class="px-4 py-2 border">{{ note.title }}</td>
                            <td class="px-4 py-2 border">{{ note.content }}</td>
                            <td class="px-4 py-2 border">{{ note.category || "Uncategorized" }}</td>
                            <td class="px-4 py-2 border text-center">
                                <button @click="openEditModal(note)"
                                    class="px-3 py-1 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500">
                                    Edit
                                </button>
                                <button @click="deleteNote(note.id)"
                                    class="ml-2 px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600">
                                    Delete
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="flex justify-center mt-4 space-x-2">
                <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1"
                    class="px-3 py-1 bg-gray-300 rounded-lg hover:bg-gray-400">
                    Previous
                </button>
                <button v-for="page in totalPages" :key="page" @click="goToPage(page)"
                    :class="page === currentPage ? 'bg-blue-500 text-white' : 'bg-gray-300 hover:bg-gray-400'"
                    class="px-3 py-1 rounded-lg">
                    {{ page }}
                </button>
                <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages"
                    class="px-3 py-1 bg-gray-300 rounded-lg hover:bg-gray-400">
                    Next
                </button>
            </div>
        </main>

        <div v-if="isModalOpen" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div class="bg-white p-6 rounded-lg shadow-lg w-96">
                <h3 class="text-lg font-semibold mb-4">{{ mode === "add" ? "Add New Note" : "Edit Note" }}</h3>
                <form @submit.prevent="saveNote">
                    <div class="mb-4">
                        <label class="block text-sm font-medium mb-1">Title</label>
                        <input v-model="newNote.title" type="text" class="w-full px-4 py-2 border rounded-lg"
                            required />
                    </div>
                    <div class="mb-4">
                        <label class="block text-sm font-medium mb-1">Content</label>
                        <textarea v-model="newNote.content" class="w-full px-4 py-2 border rounded-lg"
                            required></textarea>
                    </div>
                    <div class="mb-4">
                        <label class="block text-sm font-medium mb-1">Category</label>
                        <input v-model="newNote.category" type="text" class="w-full px-4 py-2 border rounded-lg" />
                    </div>
                    <div v-if="mode === 'edit'" class="mb-4 text-sm text-gray-600">
                        <p><strong>Created:</strong> {{ formatDate(newNote.created_at) }}</p>
                        <p><strong>Last Update:</strong> {{ formatDate(newNote.updated_at) }}</p>
                    </div>
                    <div class="flex justify-end space-x-4">
                        <button type="button" @click="closeModal"
                            class="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400">
                            Cancel
                        </button>
                        <button type="submit"
                            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>
<style scoped></style>
