<script>

	import 'robot3/debug';
	import { encode, decode } from 'uint8-to-base64';
	import { onMount } from "svelte";
	import { PlinkyMachine } from './lib/PlinkyMachine';
	import { state } from 'robot3';
	import { PatchCategories } from './lib/plinky/params';

	let port;
	let inref;
	let inarrbufref;
	let outref;

	const { store, send, service } = PlinkyMachine;

	// takes a 1152 element array b and turns into a short base64 string
	function compress(b) {
		// swizzle b->bo
		var bo=new Uint8Array(1552);
		for (var i=0;i<1552;i++) bo[i]=b[(i%97)*16+((i/97)|0)];
		var bc=[];
		for (var i=0;i<1552;) {
			var from=i;
			for (;i<1552 && i<from+255 && (bo[i]|| bo[i+1]);++i);
			bc.push(i-from);
			for (var j=from;j<i;++j) bc.push(bo[j]);
			from=i;
			for (;i<1552 && i<from+255 && !bo[i];++i);
			bc.push(i-from);  
		}
		return btoa(String.fromCharCode.apply(null, bc));
	}
	// takes a short base64 string and returns a 1152 element Uint8Array
	function decompress(s) {
		var xx=atob(s).split('').map(function (c) { return c.charCodeAt(0); });
		var o=[];
		for (var i=0;i<xx.length;) {
			var len=xx[i++];
			for (var j=0;j<len;++j) o.push(xx[i++]);
			len=xx[i++];
			for (var j=0;j<len;++j) o.push(0);
		}
		// unswizzle o->b
		var b=new Uint8Array(1552);
		for (var i=0;i<1552;i++) b[(i%97)*16+((i/97)|0)]=o[i]|0;    
		return b;  
	}

	onMount(() => {
		let params = (new URL(document.location)).searchParams;
		let patch = params.get("p");
		if(patch) {
			const decodedPatch = decode(decompress(decodeURIComponent(patch)));
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
		send({
			type: 'loadPatch',
			patchNumber: $store.context.patchNumber
		});
	}

	function savePatch() {
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

	const paramMin = -100;
	const paramMax = 100;
	const xMin = -1024;
	const xMax = 1024;

	function normalise(x) {
		return (paramMax - paramMin) * ((x-xMin)/(xMax - xMin)) + paramMin;
	}

	$: connected = ['connected', 'loadPatch', 'savePatch'].indexOf($store.state) > -1;
	$: disabled = ['loadPatch', 'savePatch'].indexOf($store.state) > -1;
	$: error = ['error'].indexOf($store.state) > -1;

	$: linkUrl = $store.context.patch 
		? location.protocol+'//'+location.host+location.pathname+'?p='+encodeURIComponent(compress(encode(new Uint8Array($store.context.patch.buffer))))
		: ""

	function round(num) {
		return Math.round( num * 100 + Number.EPSILON ) / 100;
	}

	function selectBankItem(num) {
		console.log(num);
	}

</script>

<main>
	<h1>Plinky WebUSB playground</h1>
	<h2>Current state: {$store.state}</h2>

	{#if error}
		<p class="error">{$store.context.error}</p>
	{/if}

	{#if !connected}
		<p>You need the 0.9l firmware (or newer) to use this!<br><a href="https://plinkysynth.com/firmware">Download here!</a></p>
	{/if}

	<button style="display: {!connected ? 'block' : 'none'}" on:click={connect}>Connect</button>

	<div style="display: {connected ? 'block' : 'none'}">
		<h2>Patch</h2>
		<p>Per-patch operations - you can load and save patches on the device.</p>
		<label for="i-patch-number">Patch number (zero index, 0-31)</label>
		<input min="0" max="32" type="number" disabled={disabled} id="i-patch-number" bind:value={$store.context.patchNumber} />
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

		<p>Loaded: {$store.context.patch.buffer.byteLength} bytes</p>
		
		<h3>Link to patch</h3>
		<label for="i-link-url">Link:</label>
		<input class="link" value={linkUrl} id="i-link-url">

		<h3>Patch name and category</h3>
		<input type="text" maxlength="8" value={$store.context.patch.name} id="i-name">
		<select value={$store.context.patch.category} id="i-category">
			{#each PatchCategories as category}
				<option value={category}>{category}</option>
			{/each}
		</select>


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
					<li>
						<h3>{param.name}</h3>
						<code>
							id: {param.id}<br>
							val {param.value}<br>
						</code>
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
		grid-template-columns: 1fr 1fr 1fr 1fr;
		gap: 8px;
		
		margin: 0;
		list-style: none;
		padding: 0;
	}
	.params li {
		border: 1px solid #ccc;
		padding: 0;
	}
	.params li h3 {
		background: rgb(235, 237, 195);
		padding: 8px 16px;
		margin: 0;
		border-bottom: 1px solid #ccc;
	}
	.params li .mods {
		display: grid;
		padding: 16px;
		grid-template-columns: 1fr 1fr;
	}
	.params li .mods table {
		width: 100%;
	}
	.params li code {
		padding: 16px;
		background: #f3e8f8;
		display: block;
	}
	.params li table td {
		padding-right: 16px;
		font-size: 14px;
		line-height: 18px;
		border-bottom: 1px solid #efefef;
	}
	.params .description {
		padding: 0 16px 16px;
	}
	.link {
		width: 480px;
	}
	.params .description p {
		margin: 0;
		font-size: 12px;
		line-height: 16px;
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