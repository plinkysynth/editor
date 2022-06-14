<script>

	import 'robot3/debug';
	import { encode, decode } from 'uint8-to-base64';
	import { onMount } from "svelte";
	import { PlinkyMachine } from './lib/PlinkyMachine';
	import { state } from 'robot3';
	import { PatchCategories } from './lib/plinky/params';
	import { bytecompress, bytedecompress } from './lib/compress';
  import ParamListItem from './Param.svelte'

	let port;
	let inref;
	let inarrbufref;
	let outref;

	const { store, send, service } = PlinkyMachine;

	function compress(input) {
		return input.split('').reduce((o, c) => {
			if (o[o.length - 2] === c && o[o.length - 1] < 35) o[o.length - 1]++;
			else o.push(c, 0);
			return o;
		},[]).map(_ => typeof _ === 'number' ? _.toString(36) : _).join('');
	}

	function decompress(input) {
		return input.split('').map((c,i,a)=>i%2?undefined:new Array(2+parseInt(a[i+1],36)).join(c)).join('');
	}

	onMount(() => {
		let params = (new URL(document.location)).searchParams;
		let patch = params.get("p");
		if(patch) {
			const decodedPatch = bytedecompress(decodeURIComponent(patch));
			console.log('patch: ', patch, decodedPatch);
			send({
				type: 'parsePatch',
				patch: decodedPatch
			});
		}
	});

	async function connect() {
		send('connect');
	}

	function loadPatch() {
		if ($store.context.patchNumber < 0) $store.context.patchNumber = 0
		if ($store.context.patchNumber > 31) $store.context.patchNumber = 31
		send({
			type: 'loadPatch',
			patchNumber: $store.context.patchNumber
		});
	}

	function savePatch() {
		if ($store.context.patchNumber < 0) $store.context.patchNumber = 0
		if ($store.context.patchNumber > 31) $store.context.patchNumber = 31
		send({
			type: 'savePatch',
			patchNumber: $store.context.patchNumber
		});
	}

	function clearPatch() {
		const uri = window.location.toString();
		if (uri.indexOf("?") > 0) {
			window.history.replaceState({}, document.title, uri.substring(0, uri.indexOf("?")));
		}
		send({
			type: 'clearPatch'
		});
	}


	$: connected = ['connected', 'loadPatch', 'savePatch', 'randomise'].indexOf($store.state) > -1;
	$: disabled = ['loadPatch', 'savePatch'].indexOf($store.state) > -1;
	$: error = ['error'].indexOf($store.state) > -1;
		
	let patchVal = $store.context.patchNumber + 1;
	
	let setPatchVal = () => {
		const zeroIndexPatchVal = patchVal - 1;
		$store.context.patchNumber = zeroIndexPatchVal;
	}

	$: linkUrl = $store.context.patch 
		? location.protocol+'//'+location.host+location.pathname+'?p='+encodeURIComponent(bytecompress(new Uint8Array($store.context.patch.buffer)))
		: ""

	function selectBankItem(num) {
		console.log(num);
	}
	
	function updatePatchName (e) {
		$store.context.patch.name = e.target.value;
	}
		
	function updateCategory (e) {
		$store.context.patch.category = e.target.value;
	}

	function randomisePatch () {
		send({
			type: 'randomise'
		});
	}

</script>

<main>
	<h1>Plinky WebUSB editor</h1>
	<h2>Current state: {$store.state}</h2>

	{#if error}
		<p class="error">{$store.context.error}</p>
	{/if}

	{#if !connected}
		<p>You need the 0.9l firmware (or newer) to use this. <a href="https://plinkysynth.com/firmware">Download here!</a><br>
		Please use a Chromium based browser like Google Chrome (Edge might work too). Firefox does not work currently.</p>
	{/if}

	<button style="display: {!connected ? 'block' : 'none'}" on:click={connect}>Connect</button>

	<div style="display: {connected ? 'block' : 'none'}">
		<h2>Patch</h2>
		<p>Per-patch operations - you can load and save patches on the device.</p>
		<label for="i-patch-number">Patch number</label>
		<input 
			min="1" 
			max="32" 
			type="number" 
			disabled={disabled} 
			id="i-patch-number" 
			bind:value={patchVal} 
			on:change={setPatchVal}
		/>
		<button disabled={disabled} on:click={loadPatch}>Load patch</button>
		<button disabled={disabled} on:click={savePatch}>Save patch</button>

		<!--
		<h2>Bank</h2>

		<button on:click|preventDefault={clearPatch}>Load full bank</button>

		<h3>Load patch to browser memory from bank:</h3>
		<div class="bank">

			{#each $store.context.bank as bankItem}
				<button on:click|preventDefault={selectBankItem(bankItem.number)}>{bankItem.number+1}</button>
			{/each}
			
		</div>
		-->
	</div>

	<h2>Current patch</h2>

	{#if $store.context.patch}

		<p>This is the patch that has been loaded into the browser's memory.</p>

		<button on:click|preventDefault={clearPatch}>Clear patch in browser memory</button>

		<!--<p>Loaded: {$store.context.patch.buffer.byteLength} bytes</p>-->
		
		<h3>Link to patch</h3>
		<label for="i-link-url">Link:</label>
		<input class="link" value={linkUrl} id="i-link-url">

		<h3>Patch name and category</h3>
		<input type="text" maxlength="8" value={$store.context.patch.name} on:change={updatePatchName} id="i-name">
		<select on:blur={updateCategory} value={$store.context.patch.category} id="i-category">
			{#each PatchCategories as category, i}
				<option value={i}>{category}</option>
			{/each}
		</select>

		<h3>Randomise patch</h3>

		<p>This will randomise the patch in the browser memory- if you want to transfer it over to Plinky, press "Save patch".</p>

		<button on:click|preventDefault={randomisePatch}>Randomise all base parameters except volume + dry/wet</button>

		<h3>Params</h3>

		<p>
			Arp: {$store.context.patch.arp}<br>
			Latch: {$store.context.patch.latch}<br>
			Loop start: {$store.context.patch.loopStart}<br>
			Loop length: {$store.context.patch.loopLength}<br>
		</p>

		<ul class="params">
			{#each $store.context.patch.params as param}
				{#if param.name && !param.name.endsWith('_UNUSED')}
					<ParamListItem bind:param={param} />
				{/if}
			{/each}
		</ul>
	{:else}
		<p>No patch in browser memory</p>
	{/if}

</main>

<style>
	.params {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
		gap: 8px;
		
		margin: 0;
		list-style: none;
		padding: 0;
	}
	.link {
    	width: 480px;
  	}
	main {
		padding: 1em;
		margin: 0 auto;
	}
	h1 {
		margin-top: 0;
	}
	button {
		padding: 6px 12px;
		margin: 0;
		display: inline-block;
	}
</style>