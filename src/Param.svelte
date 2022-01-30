<script>
  export let param = null
  
  function normalise(x) {
    return (paramMax - paramMin) * ((x-xMin)/(xMax - xMin)) + paramMin;
  }
  
  function round(num) {
    return Math.round( num * 10 + Number.EPSILON ) / 10;
  }
  
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
    : round(normalise(param.value))
  
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
      {displayValue}
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
        <td>{round(normalise(param.value))}%<br></td>
      </tr>
      <tr>
        <td>Env</td>
        <td>{round(normalise(param.mods.env))}%<br></td>
      </tr>
      <tr>
        <td>Pressure</td>
        <td>{round(normalise(param.mods.pressure))}%<br></td>
      </tr>
      <tr>
        <td>A</td>
        <td>{round(normalise(param.mods.a))}%<br></td>
      </tr>
    </table>
    <table>
      <tr>
        <td>B</td>
        <td>{round(normalise(param.mods.b))}%<br></td>
      </tr>
      <tr>
        <td>X</td>
        <td>{round(normalise(param.mods.x))}%<br></td>
      </tr>
      <tr>
        <td>Y</td>
        <td>{round(normalise(param.mods.y))}%<br></td>
      </tr>
      <tr>
        <td>Random</td>
        <td>{round(normalise(param.mods.random))}%<br></td>
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