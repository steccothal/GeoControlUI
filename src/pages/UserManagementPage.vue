<template>
  <div class="container mt-4">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <h2 class="mb-3">Users</h2>

        <div class="mb-3 d-flex gap-2">
          <button
            class="btn btn-success"
            data-bs-toggle="modal"
            data-bs-target="#createUserModal"
          >
            Create User
          </button>
          <button
            class="btn btn-danger"
            :disabled="!selectedUser"
            @click="deleteUser"
          >
            Delete Selected
          </button>
        </div>

        <ItemList
          v-model:selected="selectedUser"
          :items="users"
          :keyFn="(u) => u.username"
          :displayFn="(u) => `${u.username} - ${u.type}`"
        />
      </div>
    </div>

    <div
      class="modal fade"
      id="createUserModal"
      tabindex="-1"
      aria-labelledby="createUserModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="createUserModalLabel">Create User</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" />
          </div>
          <div class="modal-body">
            <UserForm @submit="createUser" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import type { User } from "@models/User";
import api from "@services/api";
import { CONFIG } from "@config";
import { executeWithLoading } from "@services/loading";
import * as bootstrap from "bootstrap";

import UserForm from "@components/UserForm.vue";
import ItemList from "@components/ItemList.vue";
import { setError } from "@services/error";

const users = ref<User[]>([]);
const selectedUser = ref<User | null>(null);

const loadUsers = async () => {
  await executeWithLoading(
    async () => {
      const res = await api.get<User[]>(CONFIG.ROUTES.V1_USERS);
      users.value = res.data;
    },
    (error) => setError(`Failed to load users: ${error}`)
  );
};

const createUser = async (user: {
  username: string;
  password: string;
  type: string;
}) => {
  await executeWithLoading(
    async () => {
      await api.post(CONFIG.ROUTES.V1_USERS, user);
      await loadUsers();
      const modal = document.getElementById("createUserModal");
      if (modal) {
        const instance =
          bootstrap.Modal.getInstance(modal) || new bootstrap.Modal(modal);
        instance.hide();
        document.body.classList.remove("modal-open");
        document.querySelector(".modal-backdrop")?.remove();
      }
    },
    async (error) => {
      setError(`Failed to create user: ${error}`);
      await loadUsers();
    }
  );
};

const deleteUser = async () => {
  if (!selectedUser.value) return;
  await executeWithLoading(
    async () => {
      await api.delete(
        `${CONFIG.ROUTES.V1_USERS}/${selectedUser.value!.username}`
      );
      selectedUser.value = null;
    },
    async (error) => {
      setError(`Delete failed:${error}`);
    }
  );
  await loadUsers();
};

onMounted(loadUsers);
</script>
