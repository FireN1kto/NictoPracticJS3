Vue.component('Task',{
    template: `
    <div class="newTasks">
        <h2>Новые задачи</h2>
        <div class="create">
            <button v-if="!showForm" @click="openForm">Создать задачу</button>
        </div>
        <modal :show="showForm" @close="closeForm">
            <div class="modal-content">
                <createTask @task-submitted="addTask" />
            </div>
        </modal>
        <Tasks
            :tasks="tasks"
        ></Tasks>
    </div>
    `,
    data() {
        return {
            tasks: [],
            showForm: false
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
        openForm() {
            this.showForm = true;
        },
        closeForm() {
            this.showForm = false;
        },
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
            <textarea v-model="puncts[index]" placeholder="Задача" class="punct" />
            <button @click="removePunct(index)" class="delete-punct">Удалить пункт</button>
        </div>
       
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
    data () {
        return {
            name: null,
            puncts: [],
            errors: []
        }
    },
    methods: {
        addPunct() {
            this.puncts.push('');
        },
        removePunct(index) {
            this.puncts.splice(index, 1); // Удаляем задачу по индексу
        },
        onSubmit() {
            this.errors = [];
            if (!this.name) {
                this.errors.push("Требуется название!");
            }
            if (this.puncts.length === 0 || this.puncts.every(punct => punct.trim() === '')) {
                this.errors.push("Требуются пункты!");
            }

            if (this.puncts.length === 0 || this.puncts.some(punct => punct.trim() === '')) {
                this.errors.push("Заполните все пункты или удалите пустые поля!");
            }

            if (this.errors.length === 0) {
                const punctsArray = this.puncts.filter(punct => punct.trim() !== '');
                if(this.errors) {
                    const task = {
                        name: this.name,
                        puncts: punctsArray
                    };
                    this.$emit('task-submitted', task);
                    this.name = null;
                    this.puncts = [];
                }
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
                <ul>
                    <p v-for="(punct, index) in task.puncts" :key="index">
                        <li v-for="(punct, index) in task.puncts" :key="index">{{ punct }}</li>
                    </p>
                </ul>
            </div>
        </ul>
    </div>
    `
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