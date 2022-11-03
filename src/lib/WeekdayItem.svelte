<script lang="ts">
    import type { Item } from './index'
    import Icon from '@iconify/svelte';
    import { createEventDispatcher } from 'svelte';

    export let item: Item
    
    const dispatch = createEventDispatcher();
    function onClick() {
        dispatch('click', item);
    }

    const icons = {
        'task': 'heroicons:check-circle',
        'task:not-done': 'heroicons:stop-circle',
        'task:done': 'heroicons:check-circle',
        'note': 'heroicons:document-text' ,
        'event': 'heroicons:calendar' ,
    }

    function toggleDone() {
        if (item.type === 'task') {
            dispatch('click:done', !item.done);
        }
    }

    function getTextClasses() {
        let classes = '';
        if (item.type === 'task' && item.done) {
            classes += ' line-through opacity-50';
        }
        return classes;
    }
</script>
  
<!-- svelte-ignore a11y-click-events-have-key-events -->
<li 
    draggable="true"
    class=" shadow-sm hover:shadow-slate-200 hover:scale-105 shadow-slate-200 items-center p-2 rounded-md bg-white cursor-pointer  transition-all"
    class:task={item.type === 'task'}
    class:note={item.type === 'note'}
    class:event={item.type === 'event'}
    on:click={onClick}
    on:dragstart={() => dispatch('dragstart', item)}
    on:dragend={() => dispatch('dragend', item)}
>
    <div class="flex items-center gap-2">
        {#if item.type !== 'task'}
        <div class="icon rounded-full p-1">    
            <Icon icon={icons[item.type]} height="21" />
        </div>
        {/if}
        {#if item.type === 'task'}
            <button class="text-slate-400 hover:text-blue-500 p-1 bg-slate-100 rounded-full"
            class:done={item.done}
            on:click|stopPropagation={toggleDone}>
                <Icon icon={icons[item.type + (item.done ? ':done' : ':not-done')]} height="21" />
            </button>
        {/if}
        <p class={getTextClasses()}>
            {item.name || "-"}
        </p>
        {#if item.type === 'event'}
            <div class="ml-auto self-start text-xs font-medium px-2 py-0.5 bg-yellow-100 text-yellow-600 rounded-md">
                {item.time || "-"}
            </div>
        {/if}
    </div>
    {#if item.type === 'note' && item.description}
    <div>
        <p class="text-xs mt-2 p-2 rounded-md text-slate-500 font-mono">
            {item.description}
        </p>
    </div>
    {/if}

   <!-- <button on:click={onDeleteClick}>🗑</button> -->

</li>

<style lang="scss">
   
    li.task {
        .icon {
            color: theme('colors.blue.500');
            background: theme('colors.blue.50');
        }
    }
    li.note {
        .icon {
            color: theme('colors.green.600');
            background: theme('colors.green.50');
        }
    }
    li.event {
        .icon {
            color: theme('colors.yellow.700');
            background: theme('colors.yellow.50');
        }
    }
    .done {
        color: theme('colors.blue.500');
        background: theme('colors.blue.50');
    }


</style>
  