Vue.component('Task',{
    template: `
    <div class="allBlocks">
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
                @delete-task="deleteTask"
                @take-to-work="moveToInProgress"
            ></Tasks>
        </div>
        <div class="inProgressTasks">
            <h2>Задачи в работе</h2>
            <modal :show="showEditForm" @close="closeEditForm">
                <div class="modal-content">
                    <editTask 
                        :task="editingTask" 
                        @task-updated="updateTask"
                    />
                </div>
            </modal>
            <InProgressTasks 
                :tasks="inProgressTasks" 
                @edit-task="startEditTask"
                @move-to-testing="moveToTesting"
            ></InProgressTasks>
        </div>
        <div class="testingTasks">
            <h2>Задачи на тестировании</h2>
            <modal :show="showEditForm" @close="closeEditForm">
                <div class="modal-content">
                    <editTask 
                        :task="editingTask" 
                        @task-updated="updateTask"
                    />
                </div>
            </modal>
            <TestingTasks 
                :tasks="testingTasks" 
                @edit-task="startEditTask"
                @return-from-testing="handleReturnFromTesting"
                @move-to-completed="handleMoveToCompleted"
            ></TestingTasks>
        </div>
        <div class="completedTasks">
            <h2>Выполненные задачи</h2>
            <CompletedTasks :tasks="completedTasks" />
        </div>
    </div>
    `,
    data() {
        return {
            tasks: [],
            inProgressTasks: [],
            testingTasks: [],
            completedTasks: [],
            showCreateForm: false,
            showEditForm: false,
            showReturnForm: false,
            editingTask: null
        }
    },
    methods: {
        addTask(task) {
            if (!task.puncts || task.puncts.length === 0) {
                alert("Задача должна содержать хотя бы один пункт!");
                return;
            } else if (this.tasks.some(app => app.name === task.name)) {
                alert("Задача с таким именем уже существует!");
                return;
            } else {
                this.tasks.push({
                    name: task.name,
                    puncts: task.puncts,
                    createdAt: task.createdAt,
                    lastModifiedAt: new Date().toISOString().slice(0, 16),
                    deadline: task.deadline,
                    returnReason: null
                });
                this.closeCreateForm();
            }
        },
        updateTask(updatedTask) {
            let index = this.tasks.findIndex(task => task.name === updatedTask.name);
            if (index !== -1) {
                this.tasks.splice(index, 1, {
                    updatedTask,
                    returnReason: null
                });
            } else {
                // Если задача не найдена в tasks, ищем её в inProgressTasks
                index = this.inProgressTasks.findIndex(task => task.name === updatedTask.name);
                if (index !== -1) {
                    this.inProgressTasks.splice(index, 1, {
                        updatedTask,
                        returnReason: null
                    });
                }
            }
            this.closeEditForm()
        },
        deleteTask(task) {
            const index = this.tasks.findIndex(t => t.name === task.name);
            if (index !== -1) {
                this.tasks.splice(index, 1);
            }
        },
        moveToInProgress(task) {
            const index = this.tasks.findIndex(t => t.name === task.name);
            if (index !== -1) {
                const taskToMove = { ...this.tasks[index] };
                taskToMove.lastModifiedAt = new Date().toISOString().slice(0, 16);
                this.inProgressTasks.push(taskToMove);
                this.tasks.splice(index, 1);
            }
        },
        moveToTesting(task) {
            const index = this.inProgressTasks.findIndex(t => t.name === task.name);
            if (index !== -1) {
                const taskToMove = { ...this.inProgressTasks[index] };
                taskToMove.lastModifiedAt = new Date().toISOString().slice(0, 16);
                this.testingTasks.push(taskToMove);
                this.inProgressTasks.splice(index, 1);
            }
        },
        returnToInProgress(task, reason) {
            const index = this.testingTasks.findIndex(t => t.name === task.name);
            if (index !== -1) {
                const taskToReturn = { ...this.testingTasks[index] };
                taskToReturn.lastModifiedAt = new Date().toISOString().slice(0, 16);
                taskToReturn.returnReason = reason;
                this.inProgressTasks.push(taskToReturn);
                this.testingTasks.splice(index, 1);
            }
        },
        handleReturnFromTesting(taskName, reason) {
            const task = this.testingTasks.find(t => t.name === taskName);
            if (task) {
                this.returnToInProgress(task, reason);
            }
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
        },
        moveToCompleted(task) {
            const index = this.testingTasks.findIndex(t => t.name === task.name);
            if (index !== -1) {
                const taskToComplete = { ...this.testingTasks[index] };
                taskToComplete.lastModifiedAt = new Date().toISOString().slice(0, 16);
                const deadline = new Date(taskToComplete.deadline);
                const now = new Date();
                taskToComplete.status = deadline > now ? "выполнена в срок" : "просрочена";
                this.completedTasks.push(taskToComplete);
                this.testingTasks.splice(index, 1);
            }
        },
        handleMoveToCompleted(taskName) {
            const task = this.testingTasks.find(t => t.name === taskName);
            if (task) {
                this.moveToCompleted(task);
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
            <label for="lastModifiedAt">Дата последнего изменения:</label>
            <input type="datetime-local" id="lastModifiedAt" v-model="lastModifiedAt" disabled>
        </p>
        <p>
            <label for="deadline">Дедлайн:</label>
            <input type="datetime-local" id="deadline" v-model="deadline">
        </p>
        <p class="add-save">
            <button @click="addPunct" class="addPunct">Добавить пункт</button>
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
            lastModifiedAt: this.task.lastModifiedAt || new Date().toISOString().slice(0, 16),
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
                    lastModifiedAt: new Date().toISOString().slice(0, 16),
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
        },
        puncts: {
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
                <p><strong>Дата последнего изменения:</strong> {{ formatDate(task.lastModifiedAt) }}</p>
                <ul>
                    <p><strong>Описание задачи:</strong></p>
                    <div class="puncts">
                        <p v-for="(punct, index) in task.puncts" :key="index">
                            <li v-for="(punct, index) in task.puncts" :key="index">{{ punct }}</li>
                        </p>
                    </div>
                </ul>
                <p><strong>Дедлайн:</strong> {{ formatDate(task.deadline) }}</p>
                <div class="red-del-tak">
                    <button @click="$emit('edit-task', task)" class="redact">Редактировать</button>
                    <button @click="$emit('delete-task', task)" class="delete">Удалить задачу</button>
                    <button @click="$emit('take-to-work', task)" class="take-to-work">Взять в работу</button>
                </div>
            </div>
        </ul>
    </div>
    `,
    methods: {
        formatDate(date) {
            return new Date(date).toLocaleString();
        }
    }
});

Vue.component('InProgressTasks', {
    props: {
        tasks: {
            type: Array,
            default: () => []
        },
        puncts: {
            type: Array,
            default: () => []
        }
    },
    template: `
    <div class="progressTask-div">
        <ul>
            <p v-if="!tasks.length" class="noneTasks">Здесь ещё нет задач в работе.</p>
            <div v-for="task in tasks" :key="task.name" class="tasks-info">
                <p class="taskName">{{ task.name }}</p>
                <p><strong>Дата создания:</strong> {{ formatDate(task.createdAt) }}</p>
                <p><strong>Дата последнего изменения:</strong> {{ formatDate(task.lastModifiedAt) }}</p>
                <ul>
                    <p>Описание задачи:</p>
                    <div class="puncts">
                        <p v-for="(punct, index) in task.puncts" :key="index">
                            <li v-for="(punct, index) in task.puncts" :key="index">{{ punct }}</li>
                        </p>
                    </div>
                </ul>
                <p v-if="task.returnReason">Причина возврата: {{ task.returnReason }}</p>
                <p><strong>Дедлайн:</strong> {{ formatDate(task.deadline) }}</p>
                <div class="red-move">
                    <button @click="$emit('edit-task', task)" class="redact">Редактировать</button>
                    <button @click="$emit('move-to-testing', task)" class="move-to-testing">Взять на тестировку</button>
                </div>
            </div>
        </ul>
    </div>
    `,
    methods: {
        formatDate(date) {
            return new Date(date).toLocaleString();
        }
    }
});

Vue.component('TestingTasks', {
    props: {
        tasks: {
            type: Array,
            default: () => []
        }
    },
    template: `
    <div>
        <p v-if="!tasks.length" class="noneTasks">Здесь ещё нет задач в тестировании.</p>
        <div v-for="task in tasks" :key="task.name" class="tasks-info">
            <p class="taskName">{{ task.name }}</p>
            <p><strong>Дата создания:</strong> {{ formatDate(task.createdAt) }}</p>
            <p><strong>Дата последнего изменения:</strong> {{ formatDate(task.lastModifiedAt) }}</p>
            <ul>
                <p>Описание задачи:</p>
                <div class="puncts">
                    <p v-for="(punct, index) in task.puncts" :key="index">
                        <li v-for="(punct, index) in task.puncts" :key="index">{{ punct }}</li>
                    </p>
                </div>
            </ul>
            <p><strong>Дедлайн:</strong> {{ formatDate(task.deadline) }}</p>
            <div class="red-ret">
                <button @click="$emit('edit-task', task)" class="redact">Редактировать</button>
                <button @click="openReturnForm(task)" class="returnInWork">Отправить обратно</button>
                <button @click="moveToCompleted(task.name)" class="completed">Завершить задачу</button>
            </div>

            <modal :show="showReturnForm" @close="closeReturnForm">
                <div class="modal-content">
                    <ReturnTaskForm
                        v-if="showReturnForm"
                        :task="returnTask" 
                        @task-returned="handleTaskReturned" 
                        @close="closeReturnForm" />
                </div>
            </modal>
        </div>
    </div>
    `,
    data() {
        return {
            showReturnForm: false,
            returnTask: null
        };
    },
    methods: {
        formatDate(date) {
            return new Date(date).toLocaleString();
        },
        openReturnForm(task) {
            this.returnTask = task;
            this.showReturnForm = true;
        },
        closeReturnForm() {
            this.showReturnForm = false;
            this.returnTask = null;
        },
        handleTaskReturned(taskName, reason) {
            this.$emit('return-from-testing', taskName, reason);
            this.closeReturnForm();
        },
        moveToCompleted(taskName) {
            this.$emit('move-to-completed', taskName);
        }
    }
});

Vue.component('ReturnTaskForm', {
    props: {
        task: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            returnReason: "" // Поле для хранения причины возврата
        };
    },
    template: `
    <div class="modal-return">
        <h4>Введите причину возврата:</h4>
        <input v-model="returnReason" type="text" placeholder="Причина возврата" />
        <div>
            <button @click="submit" >Вернуть в работу</button>
            <button @click="$emit('close')">Отмена</button>
        </div>
    </div>
    `,
    methods: {
        submit() {
            if (!this.returnReason || this.returnReason.trim() === "") {
                alert("Причина возврата обязательна!");
                return;
            }
            this.$emit('task-returned', this.task.name, this.returnReason); // Отправляем событие с правильной ссылкой на задачу
            this.$emit('close'); // Закрываем форму
        }
    }
});

Vue.component('CompletedTasks', {
    props: {
        tasks: {
            type: Array,
            default: () => []
        }
    },
    template: `
        <div>
            <p v-if="tasks.length === 0" class="noneTasks">Здесь ещё нет завершенных задач.</p>
            <div v-for="(task, index) in tasks" :key="index">
                <h3>{{ task.name }}</h3>
                <p>Дата создания: {{ formatDate(task.createdAt) }}</p>
                <p>Дата завершения: {{ formatDate(task.lastModifiedAt) }}</p>
                <ul>
                    <p>Описание задачи:</p>
                    <div class="puncts">
                        <p v-for="(punct, index) in task.puncts" :key="index">
                            <li v-for="(punct, index) in task.puncts" :key="index">{{ punct }}</li>
                        </p>
                    </div>
                </ul>
                <p>Дедлайн: {{ formatDate(task.deadline) }}</p>
                <p class="status">Статус: <strong :class="getStatusClass(task.status)">{{ task.status }}</strong></p>
            </div>
        </div>
    `,
    methods: {
        formatDate(date) {
            return new Date(date).toLocaleString();
        },
        getStatusClass(status) {
            return status === "просрочена" ? "overdue" : "on-time";
        }
    }
});


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
    el: '#app',
})