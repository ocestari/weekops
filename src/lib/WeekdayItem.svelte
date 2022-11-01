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
    class="flex items-center gap-2 p-2 rounded-md mt-1 bg-white cursor-pointer hover:outline outline-1 outline-blue-300"
    class:task={item.type === 'task'}
    class:note={item.type === 'note'}
    class:event={item.type === 'event'}
    on:click={onClick}
    on:dragstart={() => dispatch('dragstart', item)}
    on:dragend={() => dispatch('dragend', item)}
>   
    <div class="icon rounded-full p-1">    
        <Icon icon={icons[item.type]} height="21" />
    </div>
    <div>
    {item.name || "-"}
    </div>
    {#if item.type === 'event'}
        <div class="ml-auto self-start text-xs font-medium px-2 py-0.5 bg-yellow-100 text-yellow-600 rounded-md">
            {item.time || "-"}
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
  