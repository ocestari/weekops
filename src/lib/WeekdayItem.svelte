<script lang="ts">
    import type { Item } from './index'
    import Icon from '@iconify/svelte';
    import { removeItem } from './index'
    import { createEventDispatcher } from 'svelte';

    export let item: Item
    
    const dispatch = createEventDispatcher();
    function onClick() {
        dispatch('click', item);
    }

    const icons = {
        'task': 'heroicons:check-circle' ,
        'note': 'heroicons:document-text' ,
        'event': 'heroicons:calendar' ,
    }

    function onDeleteClick() {
        removeItem(item.id)
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
        <div class="icon rounded-full p-1">    
            <Icon icon={icons[item.type]} height="21" />
        </div>
            <p>
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


</style>
  