<script>
  import { formatValue } from "./lib/utils.js"

  export let param = null
  
  let val = param.value;
  
  let rangeMin = param.min < 0 ? -1024 : 0;
  let rangeMax = 1024;
  
  let selectOptions = param.getSelectOptions();
  let activeOption = param.getActiveSelectOption();
  let hasDropdown = selectOptions !== null;
  
  function updateVal(e) {
    // take into account LERP from minmax
    val = e.target.value;
    param.value = val
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
    <h3>
      {param.name}
    </h3>
    <p>
      {param.displayValue}
    </p>
  </header>
<!--   <code>
    id: {param.id}<br>
    val {param.value}<br>
  </code> -->
  {#if hasDropdown}
  <select
    value={activeOption.value}
    on:blur={updateVal}
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
        <td>{formatValue(param.value)}%<br></td>
      </tr>
      <tr>
        <td>Env</td>
        <td>{formatValue(param.mods.env)}%<br></td>
      </tr>
      <tr>
        <td>Pressure</td>
        <td>{formatValue(param.mods.pressure)}%<br></td>
      </tr>
      <tr>
        <td>A</td>
        <td>{formatValue(param.mods.a)}%<br></td>
      </tr>
    </table>
    <table>
      <tr>
        <td>B</td>
        <td>{formatValue(param.mods.b)}%<br></td>
      </tr>
      <tr>
        <td>X</td>
        <td>{formatValue(param.mods.x)}%<br></td>
      </tr>
      <tr>
        <td>Y</td>
        <td>{formatValue(param.mods.y)}%<br></td>
      </tr>
      <tr>
        <td>Random</td>
        <td>{formatValue(param.mods.random)}%<br></td>
      </tr>
    </table>
  </div>
  <div class="description">
    <p>{param.description}</p>
  </div>
</li>


<style>
  li {
    border: 1px solid #ccc;
    padding: 0;
  }
  li h3 {
    background: rgb(235, 237, 195);
    padding: 8px 16px;
    margin: 0;
    border-bottom: 1px solid #ccc;
  }
  li .mods {
    display: grid;
    padding: 16px;
    grid-template-columns: 1fr 1fr;
  }
  li .mods table {
    width: 100%;
  }
  li code {
    padding: 16px;
    background: #f3e8f8;
    display: block;
  }
  li table td {
    padding-right: 16px;
    font-size: 14px;
    line-height: 18px;
    border-bottom: 1px solid #efefef;
  }
  .description {
    padding: 0 16px 16px;
  }

  .description p {
    margin: 0;
    font-size: 12px;
    line-height: 16px;
  }
  
  header {
    display: flex;
    flex-direction: row;
    background: white;
    align-items: center;
    border-bottom: 1px solid #efefef;
  }
  header img {
    width: 50px;
    height: 50px;
  }
  header h3 {
    flex: 1 1;
    display: flex;
  }
</style>