Vue.component('Task',{
    template: `
    <div class="newTasks">
        <h2>Новые задачи</h2>
        <div class="create">
            <button v-if="!showCreateForm && !showEditForm" @click="openCreateForm">Создать задачу</button>
        </div>
        <modal :show="showCreateForm" @close="closeCreateForm">
            <div class="modal-content">
                <createTask @task-submitted="addTask" />
            </div>
        </modal>
        <modal :show="showEditForm" @close="closeEditForm">
            <div class="modal-content">
                <editTask 
                    :task="editingTask"
                    @task-updated="updateTask"
                />
            </div>
        </modal>
        <Tasks
            :tasks="tasks"
            @edit-task="startEditTask"
        ></Tasks>
    </div>
    `,
    data() {
        return {
            tasks: [],
            showCreateForm: false, // Отображение формы создания
            showEditForm: false,   // Отображение формы редактирования
            editingTask: null     // Задача для редактирования
        }
    },
    methods: {
        addTask(task){
            if (!task.puncts || task.puncts.length === 0) {
                alert("Задача должна содержать хотя бы один пункт!");
                return;
            } else if (this.tasks.some(app => app.name === task.name)) {
                alert("Задача с таким именем уже существует!");
                return;
            }
            else {
                this.tasks.push(task);
                this.showForm = false
            }
        },
        updateTask(updatedTask) {
            const index = this.tasks.findIndex(task => task.name === updatedTask.name);
            if (index !== -1) {
                this.tasks.splice(index, 1, updatedTask);
            }
            this.closeForm();
        },
        openCreateForm() {
            this.showCreateForm = true;
        },
        closeCreateForm() {
            this.showCreateForm = false;
        },
        openEditForm() {
            this.showEditForm = true;
        },
        closeEditForm() {
            this.showEditForm = false;
            this.editingTask = null;
        },
        startEditTask(task) {
            if (task) {
                this.editingTask = { ...task };
                this.openEditForm();
            } else {
                console.error("Задача для редактирования не найдена!");
            }
        }
    }
});

Vue.component('createTask', {
    template: `
    <form class="task-form" @submit.prevent="onSubmit">
        <p>
            <label for="task">Название задачи</label>
            <input id="task" v-model="name" placeholder="Пройти бося Оленя в Valheim">
        </p>
        <div v-for="(punct, index) in puncts" :key="index" class="info-punct">
            <textarea v-model="puncts[index]" placeholder="Задача" class="punct"></textarea>
            <button @click.stop="removePunct(index)" class="delete-punct">Удалить пункт</button>
        </div>
        <p>
            <label for="createdAt">Дата создания:</label>
            <input type="datetime-local" id="createdAt" v-model="createdAt">
        </p>
        <p>
            <label for="deadline">Дедлайн:</label>
            <input type="datetime-local" id="deadline" v-model="deadline">
        </p>
        <p>
            <button @click="addPunct" class="add-punct">Добавить пункт</button>
            <input type="submit" value="Создать задачу">
        </p>
        <p v-if="errors.length">
            <b>Пожалуйста, исправьте следующие ошибки:</b>
            <ul>
                <li v-for="error in errors">{{ error }}</li>
            </ul>
        </p>
    </form>
    `,
    data() {
        return {
            name: null,
            puncts: [],
            createdAt: new Date().toISOString().slice(0, 16),
            deadline: null,
            errors: []
        };
    },
    methods: {
        addPunct() {
            this.puncts.push('');
        },
        removePunct(index) {
            this.puncts.splice(index, 1);
        },
        onSubmit() {
            this.errors = [];
            if (!this.name) {
                this.errors.push("Требуется название!");
            }
            if (this.puncts.length === 0 || this.puncts.every(punct => punct.trim() === '')) {
                this.errors.push("Требуются пункты!");
            }
            if (this.puncts.some(punct => punct.trim() === '')) {
                this.errors.push("Заполните все пункты или удалите пустые поля!");
            }

            if (this.errors.length === 0) {
                const task = {
                    name: this.name,
                    puncts: this.puncts.filter(punct => punct.trim() !== ''),
                    createdAt: this.createdAt,
                    deadline: this.deadline
                };
                this.$emit('task-submitted', task);
                this.resetForm();
            }
        },
        resetForm() {
            this.name = null;
            this.puncts = [];
            this.createdAt = new Date().toISOString().slice(0, 16);
            this.deadline = null;
        }
    }
});

Vue.component('editTask', {
    props: {
        task: {
            type: Object,
            required: true
        }
    },
    template: `
    <form class="task-form" @submit.prevent="onSubmit">
        <p>
            <label for="task">Название задачи</label>
            <input id="task" v-model="name" placeholder="Пройти бося Оленя в Valheim">
        </p>
        <div v-for="(punct, index) in puncts" :key="index" class="info-punct">
            <textarea v-model="puncts[index]" placeholder="Задача" class="punct"></textarea>
            <button @click.stop="removePunct(index)" class="delete-punct">Удалить пункт</button>
        </div>
        <p>
            <label for="createdAt">Дата создания:</label>
            <input type="datetime-local" id="createdAt" v-model="createdAt" disabled>
        </p>
        <p>
            <label for="deadline">Дедлайн:</label>
            <input type="datetime-local" id="deadline" v-model="deadline">
        </p>
        <p>
            <button @click="addPunct" class="add-punct">Добавить пункт</button>
            <input type="submit" value="Сохранить изменения">
        </p>
        <p v-if="errors.length">
            <b>Пожалуйста, исправьте следующие ошибки:</b>
            <ul>
                <li v-for="error in errors">{{ error }}</li>
            </ul>
        </p>
    </form>
    `,
    data() {
        return {
            name: this.task.name,
            puncts: [...this.task.puncts],
            createdAt: this.task.createdAt,
            deadline: this.task.deadline,
            errors: []
        };
    },
    methods: {
        addPunct() {
            this.puncts.push('');
        },
        removePunct(index) {
            this.puncts.splice(index, 1);
        },
        onSubmit() {
            this.errors = [];
            if (!this.name) {
                this.errors.push("Требуется название!");
            }
            if (this.puncts.length === 0 || this.puncts.every(punct => punct.trim() === '')) {
                this.errors.push("Требуются пункты!");
            }
            if (this.puncts.some(punct => punct.trim() === '')) {
                this.errors.push("Заполните все пункты или удалите пустые поля!");
            }

            if (this.errors.length === 0) {
                const updatedTask = {
                    name: this.name,
                    puncts: this.puncts.filter(punct => punct.trim() !== ''),
                    createdAt: this.createdAt,
                    deadline: this.deadline
                };
                this.$emit('task-updated', updatedTask);
            }
        }
    }
});


Vue.component('Tasks', {
    props: {
        tasks: {
            type: Array,
            default: () => []
        }
    },
    template: `
    <div class="task-div">
        <ul>
            <p v-if="!tasks.length" class="noneTasks">Здесь ещё нет задач.</p>
            <div v-for="task in tasks" :key="task.name" class="tasks-info">
                <p class="taskName">{{ task.name }}</p>
                <p><strong>Дата создания:</strong> {{ formatDate(task.createdAt) }}</p>
                <ul>
                    <p>Описание задачи:</p>
                    <div class="puncts">
                        <p v-for="(punct, index) in task.puncts" :key="index">
                            <li v-for="(punct, index) in task.puncts" :key="index">{{ punct }}</li>
                        </p>
                    </div>
                </ul>
                <p><strong>Дедлайн:</strong> {{ formatDate(task.deadline) }}</p>
                <button @click="$emit('edit-task', task)" class="redact">Редактировать</button>
            </div>
        </ul>
    </div>
    `,
    methods: {
        formatDate(date) {
            return new Date(date).toLocaleString();
        }
    }
})


Vue.component('modal',{
    props: {
        show: {
            type: Boolean,
            default: false
        }
    },
    template: `
    <div v-if="show" class="modal-overlay">
        <span @click="closeModal" class="close">&times;</span>
        <slot></slot>
    </div>
    `,
    methods: {
        closeModal() {
            this.$emit('close');
        }
    },
})

let app = new Vue ({
    el: '#app'
})