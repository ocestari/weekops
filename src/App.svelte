<script lang="ts">
  import Icon from '@iconify/svelte';
  import { getWeekOfMonth, getWeeksInMonth, getDayOfYear, eachWeekOfInterval, eachDayOfInterval } from 'date-fns'
  import { addItem as LibAddItem, getItemsFromDay, moveItem, removeItem, updateItem, type Item } from './lib/'
  import ItemIcon from './lib/ItemIcon.svelte';
  import WeekdayItem from './lib/WeekdayItem.svelte';
  import Settings from './lib/Settings.svelte'
	import { fly, fade } from 'svelte/transition';

  let showModal = false
  let modalType: 'editItem' | 'addItem' | 'settings' = 'addItem'


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

  let transitionX = 0
  function setPrevWeek () {
    transitionX = 100
    today.setDate(today.getDate() - 7)
    recalculate()
    reloadDaysInCurrentWeek()
  }
  function setNextWeek () {
    transitionX = -100
    today.setDate(today.getDate() + 7)
    recalculate()
    reloadDaysInCurrentWeek()
  }
  function goToToday() {
    today = new Date()
    if (currentWeek !== getWeekOfMonth(today)) {
      transitionX = 100
      recalculate()
      reloadDaysInCurrentWeek()
    }
    setTimeout(() => {
      const todayColumn = document.querySelector(`#today-column`)
      todayColumn?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
    }, 100)
  }

  function isToday(date: Date) {
    return date.toDateString() === new Date().toDateString()
  }

  // New Item
  export const newItemTypes = [
    { id: 'task', name: 'Task', icon: 'heroicons:check-circle' },
    { id: 'note', name: 'Note', icon: 'heroicons:document-text' },
    { id: 'event', name: 'Event', icon: 'heroicons:calendar' },
  ]
  let newItemType: "event" | "task" | "note" = "task"
  let newItemName = ''
  let newItemTime: Date = new Date()
  let newItemDesc = ''
  let selectedDay = today
    
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  function onAddClick(day: Date) {
    selectedDay = day
    showModal = true
    modalType = "addItem"
    setTimeout(() => {
      const input: HTMLElement = document.querySelector('#item-name')
      input.focus()
    }, 100)
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
    newItemDesc = ''
    newItemName = ''
    newItemTime = new Date()

    reloadDaysInCurrentWeek()
  }

  // EDIT ITEMS
  let selectedItem = null

  function onEditClick(item) {
    selectedItem = item
    modalType = 'editItem'
    showModal = true
    setTimeout(() => {
      const input: HTMLElement = document.querySelector('#item-name-edit')
      input.focus()
    }, 100)
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


  // INFO MODAL
  function onSettingsClick() {
    modalType = 'settings'
    showModal = true
  }

  // SET TASKS AS DONE
  function onTaskDoneClick(item: Item) {
    if (item.type !== 'task') return;
      item.done = !item.done
      updateItem(item)
      reloadDaysInCurrentWeek()
  }
</script>

<main class="min-h-screen flex flex-col overflow-hidden">
  <header class="flex items-center mt-2">
    <button class="mx-3 rounded-full hover:bg-slate-100 p-2" on:click={setPrevWeek}>
      <Icon icon="heroicons:chevron-left" />
    </button>
    <h1 class="font-medium mr-3">{formattedToday}</h1>
    <p class="text-xs">Week { `${currentWeek}` }</p>
    <button class="p-2 ml-3 rounded-full hover:bg-slate-100" on:click={setNextWeek}>
      <Icon icon="heroicons:chevron-right" />
    </button>
    <button class="ml-auto mr-4 text-sm border px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition.-all font-medium shadow-sm shadow-slate-100" on:click={goToToday}>Today</button>
    <button class="mr-4 p-1 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800" on:click={onSettingsClick}>
      <Icon height={24} icon="heroicons:bars-2" />
    </button>
  </header>

<!-- KANBAN -->
<div class="bg-dotted-grid border flex m-2 rounded-lg shadow-inner p-2 flex-grow snap-proximity  snap-x md:snap-none overflow-x-auto">

  {#each daysInCurrentWeek as day (day)}
    <div class="group snap-center w-full p-3 rounded-lg border-slate-200 "
      class:dragging-over={draggingOverList === day}
      class:is-today={isToday(day)}
      id={day.getDate() === new Date().getDate() ? 'today-column' : ''}
      on:dragenter={() => draggingOverList = day}
      on:drop={(event) => onDropItem(event, day)}
      on:dragend={() => draggingOverList = null}
      on:dragover={(event) => event.preventDefault()}
    >
      <h2 class="font-medium flex items-center gap-2">
        {getDayOfWeek(day.getDay()) + ' ' + day.getDate()}
        {#if isToday(day)}
          <span class="bg-green-100 px-2 py-1 rounded-lg text-xs text-green-500">Today</span>
        {/if}
      </h2>
      <ul class="min-w-[288px] space-y-2 mt-2">
        {#each getItemsFromDay(day) as item (item.id)}
          <WeekdayItem item={item} on:click={() => onEditClick(item)} 
            on:dragstart={() => draggingOverItem = item}
            on:dragend={() => draggingOverItem = null}
            on:click:done={() => onTaskDoneClick(item)}
            />
        {/each}
      </ul>

      <button class="flex gap-2 hover:bg-blue-400 hover:bg-opacity-5 font-medium hover:text-blue-600 justify-center items-center mt-2 rounded-md p-2 md:opacity-0 group-hover:opacity-100 text-sm text-center text-slate-400  transition w-full" on:click={() => onAddClick(day)}>
        <Icon icon="heroicons:plus" />
        Add something
      </button>
    
    </div>

  {/each}
</div>
{#if showModal}
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div transition:fade={{ duration: 100 }} class="fixed bg-slate-900 bottom-0 left-0 right-0 top-0 bg-opacity-80 backdrop-blur-sm p-4 overflow-hidden flex items-center justify-center" on:click|self={() => showModal = false}
  >
  {#if modalType === 'addItem'}
  <div transition:fly={{ y: 100, duration: 200 }} class="modal-box">
    <h1 class="text-center font-medium mb-4 text-lg">{selectedDay.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
    })}</h1>
    <form on:submit|preventDefault={addItem}>
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
      <input type="text" autocomplete="off" name="item-name" id="item-name" bind:value={newItemName}>
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
      <button type="submit" class="primary">Add {newItemType}</button>
    </div>
  </form>
  </div>
  {/if}
  {#if modalType === 'editItem'}
  <div transition:fly={{ y: 100, duration: 200 }} class="modal-box">
    <h2 class="font-medium flex items-center gap-2">
      <ItemIcon colors item={selectedItem} />
      {selectedItem.name}
    </h2>
    <form on:submit|preventDefault={onUpdateItemClick}>
      <label for="item-name">
        Name
        <input type="text" name="item-name" autocomplete="off" id="item-name-edit" bind:value={selectedItem.name}>
      </label>
      <label for="item-desc">
        Description
        <textarea bind:value={selectedItem.description} name="item-desc" id="item-desc-edit" cols="30" rows="5"></textarea>
      </label>
      {#if selectedItem.type === 'event'}
      <label for="item-date">
        Time
        <input bind:value={selectedItem.time} type="time" name="item-time" id="item-date">
      </label>
      {/if}
      <div class="actions">
        <button tabindex="-1" type="button" class="destroy-text" on:click={deleteItem}>Delete</button>
        <button type="submit" class="primary">Save</button>
      </div>
  </form>
  </div>
  {/if}
  {#if modalType === 'settings'}
  <div transition:fly={{ y: 100, duration: 200 }}>
    <Settings  />
  </div>
  {/if}
</div>
{/if}

</main>

<style lang="scss">

  .dragging-over {
    background: theme('colors.blue.50');
    outline: 1px solid theme('colors.blue.400')
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
      &:focus {
        outline: 1px solid theme('colors.blue.400');
        border: 1px solid transparent;
      }
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
  button.destroy-text {
    background-color: transparent;
    color: theme('colors.red.500');
    font-weight: 500;
    padding: 0.5rem 2rem;
    border-radius: theme('borderRadius.lg');
    border: none;
    cursor: pointer;
    transition: .2s;
    &:hover {
      transition: .2s;
      background-color: theme('colors.red.100');
    }
    &:active {
      background-color: theme('colors.red.200');
    }
  }

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

/* Track */
::-webkit-scrollbar-track {
  background: transparent;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: theme('colors.slate.200');
  border-radius: theme('borderRadius.md');
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: theme('colors.slate.800');
}
.bg-dotted-grid {
  $bg-color: theme('colors.slate.50');
  $dot-color: hsl(256,33,70);
  $dot-size: 1px;
  $dot-space: 22px;

  background:
		linear-gradient(90deg, $bg-color ($dot-space - $dot-size), transparent 1%) center,
		linear-gradient($bg-color ($dot-space - $dot-size), transparent 1%) center,
		$dot-color;
	background-size: $dot-space $dot-space;
}

</style>