<script>
    export let primaryCol = 0;
    export let selected = [];
    export let data = [];
    export let datatypes = [];
    //
    import { createEventDispatcher } from "svelte";
    import { parseColumn } from "./util";
    //
    const itemDispatcher = createEventDispatcher();
    $: isChecked = selected.includes(data);
    $: checked = isChecked;

    //on item is checked
    function onCheck(col) {
        itemDispatcher("checked", {
            data: data,
            checked,
        });
    }
    //items is selected (double clicked)
    function onDoubleClick() {
        itemDispatcher("dbclick", {
            data: data,
        });
    }
</script>

<tr on:dblclick={onDoubleClick} title="dbclick">
    <!-- checkboxes -->
    <td>
        <div class="custom-checkbox">
            <input
                type="checkbox"
                id={data[primaryCol]}
                bind:checked
                on:change|stopPropagation={() => onCheck()}
            />
            <label for={data[primaryCol]} />
        </div>
    </td>
    {#each data as col, idx}
        <!-- TODO: needs to properly format column -->
        <td>{parseColumn(datatypes[idx].type, col)}</td>
    {/each}
</tr>
