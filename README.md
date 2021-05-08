# Plinky WebUSB playground

## How this works

We have abstractions of the `Port` and `Serial` classes.

### `Serial` class

The `Serial` class handles:

- Getting a list of available ports (WebUSB devices)
- Requesting access to one of those ports

Connecting to a WebUSB device means passing the `WebUSBPlinky` constructor that extends `Port` to `Serial.requestPort()`:

```js
let port;

try {
  port = await Serial.requestPort(WebUSBPlinky);
  await port.connect();
}
catch(err) {
  console.error(err);
}
```

### `Port` class

The `Port` superclass, in the `connect()` function, handles:

- Defining the read loop
- Opening the device
- Setting the [endpoint](https://wicg.github.io/webusb/#endpoints)
- Selecting the device configuration
- Getting the endpoint alternates so they can be accessed via shared pointers
- Claiming the device
- Starting the read loop

Whenever the read loop receives data, it calls the `onReceive` function, which is implemented in the `WebUSBPlinky.js` file. If there is an error, it calls the `onReceiveError` function.

### `PlinkyMachine`

State machine to interface with Plinky through `WebUSBPlinky`. It is used to wire up the UI to the machine.

`PlinkyMachine` has these states:

- disconnected
- connecting
- connected
- loadPatch
- savePatch
- error

They should be pretty self-explanatory. The `loadPatch` and `savePatch` states invoke their own child machines, so you can keep track of the overall state easier in the UI.

### `PatchMachines`

This file contains the child machines for patch loading and saving.

#### PatchLoadMachine

This machine will send the header to get a whole patch from Plinky, process the header, check how many bytes it needs to read, then loops through the input data until it's satisfied.

#### PatchSaveMachine

This machine will send the header to save a patch to Plinky, then sends the data in 2*8 byte chunks.

### `WebUSBPlinky` class

The `WebUSBPlinky` class implements:

- `onReceive`
- `onReceiveError`

Both will try to advance the `PlinkyMachine` directly through a `data` event. If the state is currently processing a child machine (in the `loadPatch` and `savePatch` state), it will try to advance the child machine.
