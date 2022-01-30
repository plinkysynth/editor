<script>
  import { formatValue, denormalise } from "./lib/utils.js"

  export let param = null
  
  const paramMin = -100;
  const paramMax = 100;
  const xMin = -1024;
  const xMax = 1024;
  
  let val = param;
  
  let rangeMin = param.min < 0 ? -1024 : 0;
  let rangeMax = 1024;
  
  let selectOptions = param.getSelectOptions();
  let activeOption = param.getActiveSelectOption();
  let hasDropdown = selectOptions !== null;
  
  let displayValue = activeOption 
    ? activeOption.label
    : formatValue(param.value)
  
  function updateVal(e) {
    // take into account LERP from minmax
    val = e.target.value;
    param.value = val
  }
  
  function updateFromNormalised(e) {
    e.target.value = denormalise(e.target.value);
    updateVal(e)
  }
  
  function updateMod(e) {
    const modsrc = e.target.dataset.mod
    const newValue = denormalise(e.target.value)
    param.mods[modsrc] = newValue
  }
</script>

<!-- 
  
  TODO
  + number inputs to update UI state && internal patch params
  + dropdowns for enumerated params
  - mod matrix inputs
  - icons
  
  -->

<li>
  <header>
    <img src="icons/{param.icon}" alt=""/> 
    <span>{param.name}</span>
    <input type="number" value={displayValue}/>
  </header>
  <main>
<!--   <code>
    id: {param.id}<br>
    val {param.value}<br>
  </code> -->
  {#if hasDropdown}
  <select
    value={activeOption?activeOption.value:null}
    on:change={updateVal}
  >
    {#each selectOptions as option, i}
      <option value={option.value}>
        {option.label}
      </option>
    {/each}
  </select>
  {:else}
  <input 
    type="range"
    min={rangeMin}
    max={rangeMax}
    step={1}
    value={val}
    on:input={updateVal}
    passive={false}
  />
  {/if}
  <div class="mods">
    <table>
      <tr>
        <td>Base</td>
        <td>
          <input
            type="number"
            value={formatValue(val)}
            on:change={updateFromNormalised}
          />
        </td>
      </tr>
      <tr>
        <td>Env</td>
        <td>
          <input
            type="number"
            data-mod="env"
            value={formatValue(param.mods.env)}
            on:change={updateMod}
          />
        </td>
      </tr>
      <tr>
        <td>Pressure</td>
        <td>
          <input
            type="number"
            data-mod="pressure"
            value={formatValue(param.mods.pressure)}
            on:change={updateMod}
          />
        </td>
      </tr>
      <tr>
        <td>A</td>
        <td>
          <input
            type="number"
            data-mod="a"
            value={formatValue(param.mods.a)}
            on:change={updateMod}
          />
        </td>
      </tr>
    </table>
    <table>
      <tr>
        <td>B</td>
        <td>
          <input
            type="number"
            data-mod="b"
            value={formatValue(param.mods.b)}
            on:change={updateMod}
          />
        </td>
      </tr>
      <tr>
        <td>X</td>
        <td>
          <input
            type="number"
            data-mod="x"
            value={formatValue(param.mods.x)}
            on:change={updateMod}
          />
        </td>
      </tr>
      <tr>
        <td>Y</td>
        <td>
          <input
            type="number"
            data-mod="y"
            value={formatValue(param.mods.y)}
            on:change={updateMod}
          />
        </td>
      </tr>
      <tr>
        <td>Random</td>
        <td>
          <input
            type="number"
            data-mod="random"
            value={formatValue(param.mods.random)}
            on:change={updateMod}
          />
        </td>
      </tr>
    </table>
  </div>
  <details class="description">
    <summary>Details</summary>
    <p>{param.description}</p>
  </details>
</main>
</li>


<style>
  li {
    padding: 0;
  }

  header, main{
    padding: 0.5rem;
  }

  header {
    border-radius: 0.5rem 0.5rem 0 0;
    display: flex;
    gap:0.5rem;
    flex-direction: row;
    background-color:#28222e;
    align-items: center;
    color:white;
  }

  main{
    border-radius: 0 0 0.5rem 0.5rem;
    background-color:#f3f3f3;
    border-style: solid;
    border-color:#ccc;
    border-width:0 2px 2px 2px;
  }

  header img {
    height: 50px;
  }

  header span {
    flex: 1 1;
    display: block;
  }

  header input{
    width:4em;
    background-color:black;
    color:white;
    border-color:white;
    border-width:1px;
    border-radius: 4px;
  }

  main input,
  main select{
    width:100%;
  }

  .mods {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  table {
    width: 100%;
  }

  td {
    padding-right: 16px;
    font-size: 14px;
    line-height: 18px;
    border-bottom: 1px solid #efefef;
  }

  details {
    padding: 0 16px 16px;
  }

  summary {
    cursor: pointer;
  }

  details p {
    margin: 0;
    font-size: 12px;
    line-height: 16px;
  }
</style>