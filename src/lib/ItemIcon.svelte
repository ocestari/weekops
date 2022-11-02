<script lang="ts">
    import Icon from '@iconify/svelte';
    import type { Item } from '.';

    export let item: Item;
    export let colors = false;

    const icons = {
        'task': 'heroicons:check-circle' ,
        'note': 'heroicons:document-text' ,
        'event': 'heroicons:calendar' ,
    }

</script>

<div class={`${item.type} inline-block p-2 rounded-full`} class:with-colors={colors}>
    <Icon height={21} icon={icons[item.type]} />
</div>
  

<style lang="scss">

.with-colors {
    &.task {
        background: theme('colors.blue.50');
        color: theme('colors.blue.500');
    }
    &.note {
        background: theme('colors.green.50');
        color: theme('colors.green.500');
    }
    &.event {
        background: theme('colors.yellow.50');
        color: theme('colors.yellow.500');
    }
}


</style>
  