<script lang="ts">
  import Icon from '@iconify/svelte';
  import { getWeekOfMonth, getWeeksInMonth, getDayOfYear, eachWeekOfInterval, eachDayOfInterval } from 'date-fns'
  import { addItem as LibAddItem, getItemsFromDay, moveItem, removeItem, updateItem } from './lib/'
  import WeekdayItem from './lib/WeekdayItem.svelte';

  let showModal = false
  let modalType: 'editItem' | 'addItem' = 'addItem'


  let today = new Date()
  let formattedToday = today.toLocaleDateString('en-US', {
    month: 'long',
  })
  let currentWeek = getWeekOfMonth(today)
  const weeksInMonth = getWeeksInMonth(today)
  const currentYear = today.getFullYear()
  const dayOfYear = getDayOfYear(today)
  const firstDayOfYear = new Date(currentYear, 0, 1)
  const lastDayOfYear = new Date(currentYear, 11, 31)
  const weeksInYear = eachWeekOfInterval({
    start: firstDayOfYear,
    end: lastDayOfYear,
  }, {
    weekStartsOn: 1,
  })
  let daysInCurrentWeek = getDaysInCurrentWeek()

  function getDaysInCurrentWeek() {
    const days = eachDayOfInterval({
      start: new Date(currentYear, today.getMonth(), today.getDate() - today.getDay() + 1),
      end: new Date(currentYear, today.getMonth(), today.getDate() - today.getDay() + 7),
    })
    // Remove Saturday and Sunday
    days.splice(5, 2)
    return days
  }

  function reloadDaysInCurrentWeek () {
    daysInCurrentWeek = getDaysInCurrentWeek()
  }

  function recalculate() {
    currentWeek = getWeekOfMonth(today)
    formattedToday = today.toLocaleDateString('en-US', {
      month: 'long',
    })
  }

  function setPrevWeek () {
    today.setDate(today.getDate() - 7)
    recalculate()
    reloadDaysInCurrentWeek()
  }
  function setNextWeek () {
    today.setDate(today.getDate() + 7)
    recalculate()
    reloadDaysInCurrentWeek()
  }
  function goToToday() {
    today = new Date()
    recalculate()
    reloadDaysInCurrentWeek()
  }

  // New Item
  export const newItemTypes = [
    { id: 'task', name: 'Task', icon: 'heroicons:check-circle' },
    { id: 'note', name: 'Note', icon: 'heroicons:document-text' },
    { id: 'event', name: 'Event', icon: 'heroicons:calendar' },
  ]
  let newItemType: "event" | "task" | "note" = "task"
  let newItemName = ''
  let newItemTime = ''
  let newItemDesc = ''
  let selectedDay = today
    
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  function onAddClick(day: Date) {
    selectedDay = day
    showModal = true
    modalType = "addItem"
  }

  function getDayOfWeek(day: number) {
    return weekdays[day]
  }

  function addItem() {
    const newItem = {
      type: newItemType,
      name: newItemName,
      date: new Date(selectedDay),
      time: newItemTime,
      description: newItemDesc,
    }

    LibAddItem(newItem)
    showModal = false
    console.table(JSON.parse(localStorage.getItem('items')))
    newItemDesc = ''
    newItemName = ''
    newItemTime = ''

    reloadDaysInCurrentWeek()
  }

  // EDIT ITEMS
  let selectedItem = null

  function onEditClick(item) {
    console.log('click', item)
    selectedItem = item
    modalType = 'editItem'
    showModal = true
  }
  function deleteItem() {
    removeItem(selectedItem.id)
    showModal = false
    reloadDaysInCurrentWeek()
  }
  function onUpdateItemClick() {
    updateItem(selectedItem)
    showModal = false
    reloadDaysInCurrentWeek()
  }


  // DRAG AND DROP
  let draggingOverList: Date = null
  let draggingOverItem = null

  function onDropItem(event: DragEvent, day: Date) {
    event.preventDefault()
    moveItem(draggingOverItem.id, day)
    reloadDaysInCurrentWeek()
  }
</script>

<main class="min-h-screen flex flex-col overflow-hidden">
  <header class="flex items-center border-b p-2">
    <button class="mx-3 rounded-full hover:bg-slate-100 p-2" on:click={setPrevWeek}>
      <Icon icon="heroicons:chevron-left" />
    </button>
    <h1 class="text-xl font-medium mr-3">{formattedToday}</h1>
    <p>Week { `${currentWeek}` }</p>
    <button class="p-2 ml-3 rounded-full hover:bg-slate-100" on:click={setNextWeek}>
      <Icon icon="heroicons:chevron-right" />
    </button>
    <button class="ml-auto mr-4" on:click={goToToday}>Today</button>
  </header>

<!-- ... -->
<div class="flex m-1 rounded-md gap-3 p-3 flex-grow snap-proximity  snap-x overflow-x-auto">

  {#each daysInCurrentWeek as day (day)}
    <div class="group snap-center w-full p-3 rounded-lg bg-slate-50 border border-slate-200 h-full"
      class:dragging-over={draggingOverList === day}
      on:dragenter={() => draggingOverList = day}
      on:drop={(event) => onDropItem(event, day)}
      on:dragend={() => draggingOverList = null}
      on:dragover={(event) => event.preventDefault()}
    >
      <h2 class="font-medium">
        {getDayOfWeek(day.getDay()) + ' ' + day.getDate()}
      </h2>
      <ul class="min-w-[288px]">
        {#each getItemsFromDay(day) as item (item.id)}
          <WeekdayItem item={item} on:click={() => onEditClick(item)} 
            on:dragstart={() => draggingOverItem = item}
            on:dragend={() => draggingOverItem = null}
            />
          {/each}
      </ul>

      <button class="p-2 opacity-0 group-hover:opacity-100 text-sm text-center text-slate-400 hover:text-slate-800 transition-colors w-full" on:click={() => onAddClick(day)}>Add something</button>
    
    </div>

  {/each}
</div>
{#if showModal}
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="fixed bg-slate-900 bottom-0 left-0 right-0 top-0 bg-opacity-80 backdrop-blur-sm flex justify-center items-center p-4 overflow-hidden" on:click|self={() => showModal = false}
  >
  {#if modalType === 'addItem'}
  <div class="modal-box">
    <h1 class="text-center font-medium mb-4 text-lg">{selectedDay.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
    })}</h1>
    <div>
    { #each newItemTypes as type }
    <input type="radio" hidden id={type.id} bind:group={newItemType} name="newItemType" value={type.id}>
    <label class:selected={newItemType === type.id} for={type.id} class={type.id + ' task-type'}>
      <Icon height="24px" icon={type.icon} />
      <p class="font-medium">{type.name}</p>
    </label>
    { /each }
    </div>

    {#if newItemType}
    <label class="capitalize mt-4" for="task-name">{newItemType}
      <input type="text" name="item-name" id="item-name" bind:value={newItemName}>
    </label>
    <label for="item-desc">
      Description
      <textarea bind:value={newItemDesc} name="item-desc" id="item-desc" cols="30" rows="5"></textarea>
    </label>
    {#if newItemType === 'event'}
    <label for="item-date">
      Time
      <input bind:value={newItemTime} type="time" name="item-time" id="item-date">
    </label>
    {/if}
    {/if}
    <div class="mt-5 flex justify-end">
      <button class="primary" on:click={addItem}>Add {newItemType}</button>
    </div>
  </div>
  {/if}
  {#if modalType === 'editItem'}
  <div class="modal-box">
    <label for="item-name">
      Name
      <input type="text" name="item-name" id="item-name" bind:value={selectedItem.name}>
    </label>
    <label for="item-desc">
      Description
      <textarea bind:value={selectedItem.description} name="item-desc" id="item-desc" cols="30" rows="5"></textarea>
    </label>
    {#if selectedItem.type === 'event'}
    <label for="item-date">
      Time
      <input bind:value={selectedItem.time} type="time" name="item-time" id="item-date">
    </label>
    {/if}
    <div class="actions">
      <button class="destroy" on:click={deleteItem}>Delete</button>
      <button class="primary" on:click={onUpdateItemClick}>Save</button>
    </div>
  </div>
  {/if}
</div>
{/if}

</main>

<style lang="scss">


  .dragging-over {
    background: theme('colors.blue.50');
    border: 1px solid theme('colors.blue.400')
  }

  label.task-type {
    display: inline-flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100px;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    background-color: #fff;
    color: theme('colors.slate.400');
    border: 1px solid transparent;
    cursor: pointer;
    font-weight: 500;
    &:hover {
      background-color: theme('colors.slate.100');
      color: theme('colors.slate.800');
      transition: all .2s;
    }
    &:active {
      background-color: #ddd;
    }
    &.task.selected {
      border: 1px solid theme('colors.blue.300');
      background: theme('colors.blue.100');
      color: theme('colors.blue.500');
    }
    &.note.selected {
      border: 1px solid theme('colors.green.300');
      background: theme('colors.green.100');
      color: theme('colors.green.600');
    }
    &.event.selected {
      border: 1px solid theme('colors.yellow.300');
      background: theme('colors.yellow.100');
      color: theme('colors.yellow.700');
    }
  }

  label {
    display: flex;
    flex-direction: column;
    margin-top: 1rem;
    input[type="text"], textarea, input[type="time"] {
      border: 1px solid #ddd;
      padding: 0.5rem 1rem;
      border-radius: theme('borderRadius.lg');
    }
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 1rem;
    button {
      margin-left: 1rem;
    }
  }
  button.primary {
    background-color: theme('colors.blue.500');
    color: #fff;
    font-weight: 500;
    padding: 0.5rem 2rem;
    border-radius: theme('borderRadius.lg');
    border: none;
    cursor: pointer;
    &:hover {
      background-color: theme('colors.blue.600');
    }
    &:active {
      background-color: theme('colors.blue.700');
    }
  }
  button.destroy {
    background-color: theme('colors.red.500');
    color: #fff;
    font-weight: 500;
    padding: 0.5rem 2rem;
    border-radius: theme('borderRadius.lg');
    border: none;
    cursor: pointer;
    &:hover {
      background-color: theme('colors.red.600');
    }
    &:active {
      background-color: theme('colors.red.700');
    }
  }

  .modal-box {
    background-color: #fff;
    padding: 1rem;
    border-radius: theme('borderRadius.lg');
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 400px;
    max-width: 100%;
  }

::-webkit-scrollbar {
  width: 12px;
  height: 12px;
}

/* Track */
::-webkit-scrollbar-track {
  background: transparent;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: theme('colors.slate.700');
  border-radius: theme('borderRadius.md');
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: theme('colors.slate.800');
}

</style>