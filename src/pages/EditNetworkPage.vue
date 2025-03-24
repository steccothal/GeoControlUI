<template>
  <div class="container mt-4">
    <div class="card app-bg mb-4">
      <div class="card-body">
        <h5 class="card-title">Network</h5>
        <div class="row">
          <div class="col-12 col-md-6">
            <NetworkForm
              v-if="network"
              v-model:network="network"
              @update="updateNetwork"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="card app-bg mb-4">
      <div class="card-body">
        <h5 class="card-title">Gateways</h5>
        <div class="row">
          <div class="col-12 col-md-6 mb-2">
            <button
              class="btn btn-success btn-sm"
              @click="openModal('gateway')"
            >
              Create Gateway
            </button>
            <ItemList
              v-model:selected="selectedGateway"
              :items="gateways"
              :keyFn="(g) => g.macAddress"
              :displayFn="(g) => `${g.macAddress} - ${g.name}`"
              class="mt-3"
            />
          </div>
          <div class="col-12 col-md-6">
            <GatewayForm
              v-if="selectedGateway"
              v-model:gateway="selectedGateway"
              @submit="updateGateway"
              @delete="deleteGateway"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="card app-bg mb-4">
      <div class="card-body">
        <h5 class="card-title">Sensors</h5>
        <div class="row">
          <div class="col-12 col-md-6 mb-2">
            <button
              class="btn btn-success btn-sm"
              :disabled="!selectedGateway"
              @click="openModal('sensor')"
            >
              Create Sensor
            </button>
            <ItemList
              v-model:selected="selectedSensor"
              :items="sensors"
              :keyFn="(s) => s.macAddress"
              :displayFn="(s) => `${s.macAddress} - ${s.name}`"
              class="mt-3"
            />
          </div>
          <div class="col-12 col-md-6">
            <SensorForm
              v-if="selectedSensor"
              v-model:sensor="selectedSensor"
              @submit="updateSensor"
              @delete="deleteSensor"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div
      class="modal fade"
      id="createModal"
      tabindex="-1"
      aria-labelledby="createModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ modalType === "gateway" ? "Create Gateway" : "Create Sensor" }}
            </h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
            ></button>
          </div>
          <div class="modal-body">
            <GatewayForm
              v-if="modalType === 'gateway'"
              :gateway="newGateway"
              @submit="createGateway"
              :editable="true"
            />
            <SensorForm
              v-if="modalType === 'sensor'"
              :sensor="newSensor"
              @submit="createSensor"
              :editable="true"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import * as bootstrap from "bootstrap";

import type { Network } from "@models/Network";
import type { Gateway } from "@models/Gateway";
import type { Sensor } from "@models/Sensor";

import api from "@services/api";
import { CONFIG } from "@config";
import { executeWithLoading } from "@services/loading";

import NetworkForm from "@components/NetworkForm.vue";
import GatewayForm from "@components/GatewayForm.vue";
import SensorForm from "@components/SensorForm.vue";
import ItemList from "@components/ItemList.vue";
import { setError } from "@services/error";

const route = useRoute();
let code = route.params.code as string;

const network = ref<Network | null>(null);
const gateways = ref<Gateway[]>([]);
const sensors = ref<Sensor[]>([]);

const selectedGateway = ref<Gateway | null>(null);
const originalGatewayMac = ref<string | null>(null);
const selectedSensor = ref<Sensor | null>(null);
const originalSensorMac = ref<string | null>(null);

const modalType = ref<"gateway" | "sensor">("gateway");

const newGateway = ref<Gateway>({
  macAddress: "",
  name: "",
  description: "",
  sensors: []
});

const newSensor = ref<Sensor>({
  macAddress: "",
  name: "",
  description: "",
  variable: "",
  unit: ""
});

function openModal(type: "gateway" | "sensor") {
  modalType.value = type;
  if (type === "gateway") {
    newGateway.value = {
      macAddress: "",
      name: "",
      description: "",
      sensors: []
    };
  } else {
    newSensor.value = {
      macAddress: "",
      name: "",
      description: "",
      variable: "",
      unit: ""
    };
  }
  const modal = document.getElementById("createModal");
  if (modal) bootstrap.Modal.getOrCreateInstance(modal).show();
}

function closeModal() {
  const modal = document.getElementById("createModal");
  if (modal) {
    const instance =
      bootstrap.Modal.getInstance(modal) || new bootstrap.Modal(modal);
    instance.hide();
  }
}

const loadAll = async () => {
  await executeWithLoading(
    async () => {
      const res = await api.get<Network>(
        `${CONFIG.ROUTES.V1_NETWORKS}/${code}`
      );
      network.value = res.data;
      gateways.value = res.data.gateways || [];
      selectedGateway.value = null;
      sensors.value = [];
    },
    (error) => setError(`Failed to load network: ${error}`)
  );
};

watch(selectedGateway, async (gw) => {
  originalGatewayMac.value = gw?.macAddress ?? null;
  sensors.value = gw?.sensors || [];
  selectedSensor.value = null;
});

watch(selectedSensor, (s) => {
  originalSensorMac.value = s?.macAddress ?? null;
});

const updateNetwork = async () => {
  await executeWithLoading(
    async () => {
      await api.patch(`${CONFIG.ROUTES.V1_NETWORKS}/${code}`, network.value);
      code = network.value!.code!;
    },
    async (error) => {
      setError(`Failed to update network: ${error}`);
      await loadAll();
    }
  );
};

const updateGateway = async () => {
  if (!selectedGateway.value) return;
  await executeWithLoading(
    async () => {
      await api.patch(
        `${CONFIG.ROUTES.V1_GATEWAYS.replace(":networkCode", code)}/${
          originalGatewayMac.value
        }`,
        selectedGateway.value
      );
    },
    async (error) => {
      setError(`Failed to update gateway: ${error}`);
      await loadAll();
    }
  );
};

const deleteGateway = async () => {
  if (!selectedGateway.value) return;
  await executeWithLoading(
    async () => {
      await api.delete(
        `${CONFIG.ROUTES.V1_GATEWAYS.replace(":networkCode", code)}/${
          selectedGateway.value!.macAddress
        }`
      );
    },
    async (error) => {
      setError(`Failed to delete gateway: ${error}`);
      await loadAll();
    }
  );
};

const createGateway = async () => {
  await executeWithLoading(
    async () => {
      await api.post(
        CONFIG.ROUTES.V1_GATEWAYS.replace(":networkCode", code),
        newGateway.value
      );
      gateways.value.push(newGateway.value);
      selectedGateway.value = newGateway.value;
      closeModal();
    },
    async (error) => {
      setError(`Failed to create gateway: ${error}`);
      closeModal();
      await loadAll();
    }
  );
};

const updateSensor = async () => {
  if (!selectedGateway.value || !selectedSensor.value) return;
  await executeWithLoading(
    async () => {
      const url = CONFIG.ROUTES.V1_SENSORS.replace(
        ":networkCode",
        code
      ).replace(":gatewayMac", selectedGateway.value!.macAddress!);
      await api.patch(
        `${url}/${originalSensorMac.value}`,
        selectedSensor.value
      );
    },
    async (error) => {
      setError(`Failed to update sensor: ${error}`);
      await loadAll();
    }
  );
};

const deleteSensor = async () => {
  if (!selectedGateway.value || !selectedSensor.value) return;
  await executeWithLoading(
    async () => {
      const url = CONFIG.ROUTES.V1_SENSORS.replace(
        ":networkCode",
        code
      ).replace(":gatewayMac", selectedGateway.value!.macAddress!);
      await api.delete(`${url}/${selectedSensor.value!.macAddress}`);
    },
    async (error) => {
      setError(`Failed to delete sensor: ${error}`);
      await loadAll();
    }
  );
};

const createSensor = async () => {
  if (!selectedGateway.value) return;
  await executeWithLoading(
    async () => {
      const url = CONFIG.ROUTES.V1_SENSORS.replace(
        ":networkCode",
        code
      ).replace(":gatewayMac", selectedGateway.value!.macAddress!);
      await api.post(url, newSensor.value);
      sensors.value.push(newSensor.value);
      selectedSensor.value = newSensor.value;
      closeModal();
    },
    async (error) => {
      setError(`Failed to create sensor: ${error}`);
      closeModal();
      await loadAll();
    }
  );
};

onMounted(loadAll);
</script>
