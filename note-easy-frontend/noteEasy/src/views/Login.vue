<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { getItems, addItem } from "../../libs/fetchUtils";

const router = useRouter();

const email = ref("");
const password = ref("");
const error = ref("");

const isRegisterModalOpen = ref(false);
const newUser = ref({ username: "", email: "", password: "" });
const registrationError = ref("");

const showLoginPassword = ref(false);
const showRegisterPassword = ref(false);

const handleLogin = async () => {
    try {
        const users = await getItems("http://localhost:3000/api/users");

        const user = users.find(
            (u) => u.email === email.value && u.password === password.value
        );

        if (!user) {
            throw new Error("Invalid email or password");
        }

        localStorage.setItem("userId", user.id);
        localStorage.setItem("userName", user.username);
        router.push({ name: "NoteList" });
    } catch (err) {
        error.value = err.message || "Login failed. Please try again.";
    }
};

const openRegisterModal = () => {
    isRegisterModalOpen.value = true;
};

const closeRegisterModal = () => {
    isRegisterModalOpen.value = false;
    newUser.value = { username: "", email: "", password: "" };
    registrationError.value = "";
};

const handleRegister = async () => {
    try {
        if (!newUser.value.username || !newUser.value.email || !newUser.value.password) {
            throw new Error("All fields are required.");
        }

        await addItem("http://localhost:3000/api/users", newUser.value);
        alert("Registration successful! You can now log in.");
        closeRegisterModal();
    } catch (err) {
        registrationError.value = err.message || "Registration failed. Please try again.";
    }
};
</script>

<template>
    <div class="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div class="w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-lg">
            <div class="flex justify-center mb-6">
                <div class="w-10 h-10 bg-gradient-to-tr from-blue-500 via-green-400 to-red-500 rounded-full"></div>
            </div>
            <h1 class="text-2xl font-semibold text-center">Sign in</h1>
            <p class="text-sm text-center text-gray-400 mb-6">Use your account to continue</p>
            <form @submit.prevent="handleLogin" class="space-y-4">
                <div>
                    <label for="email" class="block text-sm font-medium">Email</label>
                    <input type="email" id="email" v-model="email"
                        class="w-full mt-1 px-4 py-2 text-black rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your email" required />
                </div>
                <div class="relative">
                    <label for="password" class="block text-sm font-medium">Password</label>
                    <input :type="showLoginPassword ? 'text' : 'password'" id="password" v-model="password"
                        class="w-full mt-1 px-4 py-2 text-black rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your password" required />
                    <button type="button" @click="showLoginPassword = !showLoginPassword"
                        class="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700">
                        <svg v-if="showLoginPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M13.875 18.825a10.05 10.05 0 01-3.876 0m-1.553-.608c-3.068-1.487-5.125-3.914-6.222-5.217a.89.89 0 010-1.216C4.247 9.746 8.115 7 12 7c3.885 0 7.753 2.746 9.776 5.784a.89.89 0 010 1.216c-1.097 1.303-3.154 3.73-6.222 5.217M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M3 12c1.5-4.5 6-7.5 9-7.5s7.5 3 9 7.5-3.5 7.5-9 7.5S3 16.5 3 12zm3 0a6 6 0 1012 0 6 6 0 00-12 0z" />
                        </svg>
                    </button>
                </div>
                <button type="submit"
                    class="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500">
                    Sign in
                </button>
            </form>
            <div class="flex justify-between mt-6">
                <button @click="openRegisterModal" class="text-sm text-blue-400 hover:underline">
                    Create account
                </button>
            </div>
            <p v-if="error" class="text-red-500 text-sm mt-4">{{ error }}</p>
        </div>

        <div v-if="isRegisterModalOpen"
            class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div class="bg-white p-6 rounded-lg shadow-lg w-96">
                <h3 class="text-lg font-semibold mb-4 text-black">Register New Account</h3>
                <form @submit.prevent="handleRegister" class="space-y-4">
                    <div>
                        <label for="username" class="block text-sm font-medium text-black">Username</label>
                        <input type="text" id="username" v-model="newUser.username"
                            class="w-full mt-1 px-4 py-2 text-black rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter your username" required />
                    </div>
                    <div>
                        <label for="email" class="block text-sm font-medium text-black">Email</label>
                        <input type="email" id="email" v-model="newUser.email"
                            class="w-full mt-1 px-4 py-2 text-black rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter your email" required />
                    </div>
                    <div class="relative">
                        <label for="password" class="block text-sm font-medium text-black">Password</label>
                        <input :type="showRegisterPassword ? 'text' : 'password'" id="password"
                            v-model="newUser.password"
                            class="w-full mt-1 px-4 py-2 text-black rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter your password" required />
                        <button type="button" @click="showRegisterPassword = !showRegisterPassword"
                            class="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700">
                            <svg v-if="showRegisterPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5"
                                fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M13.875 18.825a10.05 10.05 0 01-3.876 0m-1.553-.608c-3.068-1.487-5.125-3.914-6.222-5.217a.89.89 0 010-1.216C4.247 9.746 8.115 7 12 7c3.885 0 7.753 2.746 9.776 5.784a.89.89 0 010 1.216c-1.097 1.303-3.154 3.73-6.222 5.217M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                                viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M3 12c1.5-4.5 6-7.5 9-7.5s7.5 3 9 7.5-3.5 7.5-9 7.5S3 16.5 3 12zm3 0a6 6 0 1012 0 6 6 0 00-12 0z" />
                            </svg>
                        </button>
                    </div>
                    <p v-if="registrationError" class="text-red-500 text-sm">{{ registrationError }}</p>
                    <div class="flex justify-end space-x-4">
                        <button type="button" @click="closeRegisterModal"
                            class="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400">
                            Cancel
                        </button>
                        <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            Register
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
