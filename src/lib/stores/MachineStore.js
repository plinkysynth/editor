import { interpret } from 'robot3';
import { writable } from 'svelte/store';

/**
 * Wrap an FSM in a Svelte store
 * @param {Machine} machine - Robot3 state machine
 * @param {any} initialContext - Initial context for machine
 * @returns {[Writable<any>, function, Service<any>]}
 */
export const MachineStore = (
  machine,
  initialContext
) => {
  const service = interpret(
    machine,
    _service => {
      if(service === _service) {
        console.log('[MachineStore] state', _service.machine.current, 'context', _service.context);
        store.set({ state: _service.machine.current, context: _service.context });
      }
    },
    initialContext,
  );

  const store = writable({
    state: machine.current,
    context: service.context,
  });

  const send = service.send;

  return { store, send, service };
};
