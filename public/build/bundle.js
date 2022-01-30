
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function set_store_value(store, ret, value = ret) {
        store.set(value);
        return ret;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.32.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    function valueEnumerable(value) {
      return { enumerable: true, value };
    }

    function valueEnumerableWritable(value) {
      return { enumerable: true, writable: true, value };
    }

    let d = {};
    let truthy = () => true;
    let empty$1 = () => ({});
    let identity = a => a;
    let callBoth = (par, fn, self, args) => par.apply(self, args) && fn.apply(self, args);
    let callForward = (par, fn, self, [a, b]) => fn.call(self, par.call(self, a, b), b);
    let create = (a, b) => Object.freeze(Object.create(a, b));

    function stack(fns, def, caller) {
      return fns.reduce((par, fn) => {
        return function(...args) {
          return caller(par, fn, this, args);
        };
      }, def);
    }

    function fnType(fn) {
      return create(this, { fn: valueEnumerable(fn) });
    }

    let reduceType = {};
    let reduce = fnType.bind(reduceType);
    let action = fn => reduce((ctx, ev) => !!~fn(ctx, ev) && ctx);

    let guardType = {};
    let guard = fnType.bind(guardType);

    function filter(Type, arr) {
      return arr.filter(value => Type.isPrototypeOf(value));
    }

    function makeTransition(from, to, ...args) {
      let guards = stack(filter(guardType, args).map(t => t.fn), truthy, callBoth);
      let reducers = stack(filter(reduceType, args).map(t => t.fn), identity, callForward);
      return create(this, {
        from: valueEnumerable(from),
        to: valueEnumerable(to),
        guards: valueEnumerable(guards),
        reducers: valueEnumerable(reducers)
      });
    }

    let transitionType = {};
    let immediateType = {};
    let transition = makeTransition.bind(transitionType);
    let immediate = makeTransition.bind(immediateType, null);

    function enterImmediate(machine, service, event) {
      return transitionTo(service, machine, event, this.immediates) || machine;
    }

    function transitionsToMap(transitions) {
      let m = new Map();
      for(let t of transitions) {
        if(!m.has(t.from)) m.set(t.from, []);
        m.get(t.from).push(t);
      }
      return m;
    }

    let stateType = { enter: identity };
    function state(...args) {
      let transitions = filter(transitionType, args);
      let immediates = filter(immediateType, args);
      let desc = {
        final: valueEnumerable(args.length === 0),
        transitions: valueEnumerable(transitionsToMap(transitions))
      };
      if(immediates.length) {
        desc.immediates = valueEnumerable(immediates);
        desc.enter = valueEnumerable(enterImmediate);
      }
      return create(stateType, desc);
    }

    let invokePromiseType = {
      enter(machine, service, event) {
        this.fn.call(service, service.context, event)
          .then(data => service.send({ type: 'done', data }))
          .catch(error => service.send({ type: 'error', error }));
        return machine;
      }
    };
    let invokeMachineType = {
      enter(machine, service, event) {
        service.child = interpret(this.machine, s => {
          service.onChange(s);
          if(service.child == s && s.machine.state.value.final) {
            delete service.child;
            service.send({ type: 'done', data: s.context });
          }
        }, service.context, event);
        if(service.child.machine.state.value.final) {
          let data = service.child.context;
          delete service.child;
          return transitionTo(service, machine, { type: 'done', data }, this.transitions.get('done'));
        }
        return machine;
      }
    };
    function invoke(fn, ...transitions) {
      let t = valueEnumerable(transitionsToMap(transitions));
      return machine.isPrototypeOf(fn) ?
        create(invokeMachineType, {
          machine: valueEnumerable(fn),
          transitions: t
        }) :
        create(invokePromiseType, {
          fn: valueEnumerable(fn),
          transitions: t
        });
    }

    let machine = {
      get state() {
        return {
          name: this.current,
          value: this.states[this.current]
        };
      }
    };

    function createMachine(current, states, contextFn = empty$1) {
      if(typeof current !== 'string') {
        contextFn = states || empty$1;
        states = current;
        current = Object.keys(states)[0];
      }
      if(d._create) d._create(current, states);
      return create(machine, {
        context: valueEnumerable(contextFn),
        current: valueEnumerable(current),
        states: valueEnumerable(states)
      });
    }

    function transitionTo(service, machine, fromEvent, candidates) {
      let { context } = service;
      for(let { to, guards, reducers } of candidates) {  
        if(guards(context, fromEvent)) {
          service.context = reducers.call(service, context, fromEvent);

          let original = machine.original || machine;
          let newMachine = create(original, {
            current: valueEnumerable(to),
            original: { value: original }
          });

          let state = newMachine.state.value;
          return state.enter(newMachine, service, fromEvent);
        }
      }
    }

    function send(service, event) {
      let eventName = event.type || event;
      let { machine } = service;
      let { value: state } = machine.state;
      
      if(state.transitions.has(eventName)) {
        return transitionTo(service, machine, event, state.transitions.get(eventName)) || machine;
      }
      return machine;
    }

    let service = {
      send(event) {
        this.machine = send(this, event);
        
        // TODO detect change
        this.onChange(this);
      }
    };

    function interpret(machine, onChange, initialContext, event) {
      let s = Object.create(service, {
        machine: valueEnumerableWritable(machine),
        context: valueEnumerableWritable(machine.context(initialContext, event)),
        onChange: valueEnumerable(onChange)
      });
      s.send = s.send.bind(s);
      s.machine = s.machine.state.value.enter(s.machine, s, event);
      return s;
    }

    function unknownState(from, state) {
      throw new Error(`Cannot transition from ${from} to unknown state: ${state}`);
    }

    d._create = function(current, states) {
      if(!(current in states)) {
        throw new Error(`Initial state [${current}] is not a known state.`);
      }
      for(let p in states) {
        let state = states[p];
        for(let [, candidates] of state.transitions) {
          for(let {to} of candidates) {
            if(!(to in states)) {
              unknownState(p, to);
            }
          }
        }
      }
    };

    const {fromCharCode} = String;

    const encode = uint8array => {
      const output = [];
      for (let i = 0, {length} = uint8array; i < length; i++)
        output.push(fromCharCode(uint8array[i]));
      return btoa(output.join(''));
    };

    const asCharCode = c => c.charCodeAt(0);

    const decode = chars => Uint8Array.from(atob(chars), asCharCode);

    const USB_BUFFER_SIZE = 64;

    // ██╗      ██████╗  █████╗ ██████╗     ██████╗  █████╗ ████████╗ ██████╗██╗  ██╗
    // ██║     ██╔═══██╗██╔══██╗██╔══██╗    ██╔══██╗██╔══██╗╚══██╔══╝██╔════╝██║  ██║
    // ██║     ██║   ██║███████║██║  ██║    ██████╔╝███████║   ██║   ██║     ███████║
    // ██║     ██║   ██║██╔══██║██║  ██║    ██╔═══╝ ██╔══██║   ██║   ██║     ██╔══██║
    // ███████╗╚██████╔╝██║  ██║██████╔╝    ██║     ██║  ██║   ██║   ╚██████╗██║  ██║
    // ╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚═════╝     ╚═╝     ╚═╝  ╚═╝   ╚═╝    ╚═════╝╚═╝  ╚═╝
    //
    //
    // How the load patch machine works:
    //
    // 1. The main state machine transitions into the loadPatch state, which starts
    //    this state machine. 
    // 2. Data is sent to plinky requesting a patch (sendLoadRequest)
    // 3. Plinky starts sending over a bunch of data in sequence
    // 4. WebUSBPlinky intercepts those and invokes this machine with the 'data'
    //    transition.
    // 5. When the first data event happens, it is evaluated (hasHeader) and
    //    processed (processHeader) to set the number of bytes we're expecting
    //    in the patch.
    // 6. With each subsequent 'data' transition, Plinky keeps advancing this
    //    machine's 'read' state, which invokes the readBytes function. It takes
    //    the payload from the data event & saves it in the state machine context.
    // 7. When there's no more data to load, the state machine is finished, and the
    //    parent machine calling it gets the final result payload.
    //

    /**
     * Process the header from data event from WebUSBPlinky
     * @param {*} ctx - State machine context
     * @param {*} ev - Data event from WebUSBPlinky
     * @returns {*} - New state machine context
     */
    function processHeader(ctx, ev) {
      const data = new Uint8Array(ev.data);
      // Set the header
      ctx.header = data;
      // Slot (patch number) to load from is in 5th index
      ctx.slot = data[5];
      // We're going to be counting how many bytes we have read to know when to stop
      ctx.processedBytes = 0;
      // Bytes 8 and 9 in the header contains how many bytes are going to be sent as an uint16
      ctx.bytesToProcess = data[8]+data[9]*256;
      // Keep all results in an array until the end, when we can concat them all into a single ArrayBuffer
      ctx.result = [];
      console.log(`Loading from slot: ${ctx.slot} - Expecting ${ctx.bytesToProcess} bytes (header: ${ctx.header})`);
      return ctx;
    }

    /**
     * Check if an event has a header for loading a patch.
     * @param {*} ctx - State machine context
     * @param {*} ev - Data event from WebUSBPlinky
     * @returns {Boolean} - True if correct header is present in event data
     */
    function hasHeader(ctx, ev) {
      const data = new Uint8Array(ev.data);
      if(!data) return false;
      if(data.byteLength !== 10) return false;
      if (data[0]!==0xf3) return false;
      if (data[1]!==0x0f) return false;
      if (data[2]!==0xab) return false;
      if (data[3]!==0xca) return false;
      if (data[4]!==1) return false;
      if (data[6]!==0) return false;
      if (data[7]!==0) return false;
      return true;
    }

    /**
     * Read incoming bytes and add them to the result
     * @param {*} ctx - State machine context
     * @param {*} ev - Data event from WebUSBPlinky
     * @returns {*} - State machine context with data added to result
     */
    function readBytes(ctx, ev) {
      // Incoming patch data is in the event
      const data = new Uint8Array(ev.data);
      ctx.result.push(data);
      ctx.processedBytes += data.byteLength;
      return ctx;
    }

    /**
     * Check if state machine should continue to process bytes
     * @param {*} ctx - State machine context
     * @returns {Boolean} - True if all bytes have been processed
     */
    function hasNoMoreData(ctx) {
      return ctx.processedBytes >= ctx.bytesToProcess;
    }

    /**
     * Send a packet asking to load a patch from Plinky
     * @param {*} ctx - State machine context
     * @returns {Boolean} - True when sent
     */
    async function sendLoadRequest(ctx) {
      console.log('sendLoadRequest', ctx.port, 'patchNumber', ctx.patchNumber);
      // [0xf3,0x0f,0xab,0xca,  0,   32,             0,0,0,0 ]
      //  header                get  current preset  padding ]
      const buf = new Uint8Array([0xf3,0x0f,0xab,0xca,0,ctx.patchNumber,0,0,0,0]);
      ctx.port.send(buf);
      return true;
    }

    /**
     * Loading state machine
     */
    const PatchLoadMachine = createMachine({
      idle: state(
        immediate('getHeader', action(sendLoadRequest)), // upon entering this machine, immediately send the patch load request
      ),
      getHeader: state(
        transition('data', 'header', guard(hasHeader)), // the next state guards that there is a header in the first data event coming from WebUSBPlinky
      ),
      header: state(
        immediate('read', reduce(processHeader)) // this reads the header and sets the parameters for the patch loading (how many bytes we need to read)
      ),
      read: state(
        immediate('finished', guard(hasNoMoreData)), // check if we have any more data, if not then go to the finished state
        transition('data', 'read', reduce(readBytes)), // otherwise transition back to the read state when receiving another data event from WebUSBPlinky
      ),
      finished: state()
    }, (ctx) => ({ ...ctx }));

    // ███████╗ █████╗ ██╗   ██╗███████╗    ██████╗  █████╗ ████████╗ ██████╗██╗  ██╗
    // ██╔════╝██╔══██╗██║   ██║██╔════╝    ██╔══██╗██╔══██╗╚══██╔══╝██╔════╝██║  ██║
    // ███████╗███████║██║   ██║█████╗      ██████╔╝███████║   ██║   ██║     ███████║
    // ╚════██║██╔══██║╚██╗ ██╔╝██╔══╝      ██╔═══╝ ██╔══██║   ██║   ██║     ██╔══██║
    // ███████║██║  ██║ ╚████╔╝ ███████╗    ██║     ██║  ██║   ██║   ╚██████╗██║  ██║
    // ╚══════╝╚═╝  ╚═╝  ╚═══╝  ╚══════╝    ╚═╝     ╚═╝  ╚═╝   ╚═╝    ╚═════╝╚═╝  ╚═╝
    //
    // The save patch machine is basically the same as the load machine, but
    // in reverse. The first event is the write request (sendWriteRequest), after
    // which we just send the necessary data over to Plinky.
    //
    // The machine loops over the necessary bytes like the load machine does, then
    // transitions out.
    //

    /**
     * Send a header asking to write a patch to Plinky
     * @param {*} ctx - State machine context
     * @returns {Boolean} - True when sent
     */
    async function sendWriteRequest(ctx) {
      console.log('sendWriteRequest', ctx.port, 'patchNumber', ctx.patchNumber);
      // [0xf3,0x0f,0xab,0xca,  1,   32,             0,0,0,0 ]
      //  header                set  current preset  padding ]
      //(header: 243,15,171,202,1,9,0,0,16,6)
      let arr = new ArrayBuffer(4); // an Int32 takes 4 bytes in Javascript. The ctx.bytesToProcess is an Int32.
      let view = new DataView(arr);
      view.setUint32(0, ctx.bytesToProcess, true);
      const len = new Uint8Array(arr);
      const buf = new Uint8Array([0xf3,0x0f,0xab,0xca,1,ctx.patchNumber,0,0,len[0],len[1]]);
      console.log('sending buffer', buf, "ctx.bytesToProcess", ctx.bytesToProcess, "len.byteLength", len.byteLength, "len", len);
      ctx.port.send(buf);
      return true;
    }

    /**
     * Send bytes to Plinky
     * @param {*} ctx - State machine context
     * @returns {*} - New state machine context
     */
    async function sendBytes(ctx) {
      const start = ctx.currentIteration * USB_BUFFER_SIZE;
      const end = start + USB_BUFFER_SIZE;
      const data = ctx.data.slice(start, end);
      ctx.port.send(data);
      ctx.currentIteration++;
      ctx.processedBytes += data.byteLength;
      return ctx;
    }

    /**
     * Saving state machine
     */
    const PatchSaveMachine = createMachine({
      idle: state(
        immediate('setHeader', reduce(ctx => {
          const data = new Uint8Array(ctx.patch.buffer);
          const currentIteration = 0;
          return { ...ctx, processedBytes: 0, bytesToProcess: data.byteLength, data, currentIteration } 
        })),
      ),
      setHeader: state(
        immediate('write', action(sendWriteRequest))
      ),
      getDataFromPatch: state(
        immediate('write', reduce((ctx) => {
          return { ...ctx };
        }))
      ),
      write: state(
        immediate('finished', guard(hasNoMoreData)),
        immediate('getDataFromPatch', action(sendBytes)),
      ),
      finished: state()
    }, (ctx) => ({ ...ctx }));

    // ██╗      ██████╗  █████╗ ██████╗     ██████╗  █████╗ ███╗   ██╗██╗  ██╗
    // ██║     ██╔═══██╗██╔══██╗██╔══██╗    ██╔══██╗██╔══██╗████╗  ██║██║ ██╔╝
    // ██║     ██║   ██║███████║██║  ██║    ██████╔╝███████║██╔██╗ ██║█████╔╝ 
    // ██║     ██║   ██║██╔══██║██║  ██║    ██╔══██╗██╔══██║██║╚██╗██║██╔═██╗ 
    // ███████╗╚██████╔╝██║  ██║██████╔╝    ██████╔╝██║  ██║██║ ╚████║██║  ██╗
    // ╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚═════╝     ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝
    //
    // The raw approach: just invoke loadMachine 32 times.
    // TODO: This needs fleshing out.
    //

    /**
     * Bank loading machine
     */
    const BankLoadMachine = createMachine({
      // 1. Initial state
      // Set the patch number to 0 and create an empty bank in this context.
      idle: state(
        immediate('sendHeader', reduce((ctx) => {
          ctx.patchNumber = 0;
          ctx.bank = [];
          return { ...ctx };
        })),
      ),
      // 2. Load state
      // Use the PatchLoadMachine to 
      sendHeader: state(
        immediate('getHeader', action(sendLoadRequest)),
      ),
      getHeader: state(
        transition('data', 'header', guard(hasHeader)),
      ),
      header: state(
        immediate('read', reduce(processHeader))
      ),
      read: state(
        immediate('finished', guard(hasNoMoreData)),
        transition('data', 'read', reduce(readBytes)),
      ),
      nextPatch: state(
        //immediate('finished', guard(hasNoMorePatches)),
        immediate('sendHeader', reduce((ctx) => {
          ctx.patchNumber = ctx.patchNumber + 1;
          return { ...ctx };
        })),
      ),
      finished: state()
    }, (ctx) => ({ ...ctx }));

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    /**
     * Wrap an FSM in a Svelte store
     * @param {Machine} machine - Robot3 state machine
     * @param {any} initialContext - Initial context for machine
     * @returns {[Writable<any>, function, Service<any>]}
     */
    const MachineStore = (
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

    /**
     * WebUSB port
     */
    class Port$1 extends EventTarget {

      constructor(device) {
        super();
        this.device = device;
        this.interfaceNumber = 0;
        this.endpointIn = 0;
        this.endpointOut = 0;
        this.queue = [];
        this.transferInflight = false;
        //this.startQueue();
      }

      onReceive(data) {}
      onReceiveError(error) {}

      setEndpoints() {

        // Go through all the interfaces in this device configuration.
        let interfaces = this.device.configuration.interfaces;

        console.log("Interfaces", this.device.configuration.interfaces);

        interfaces.forEach(element => {
          
          console.log("Element", element);

          // Element alternates - these are the *real* elements
          // that we want to connect to.
          element.alternates.forEach(elementalt => {

          if (elementalt.interfaceClass==0xFF) {

            this.interfaceNumber = element.interfaceNumber;

            // Alternates have endpoints, that we then attach to
            // so we can communicate with the device through
            // a shared pointer.
            elementalt.endpoints.forEach(elementendpoint => {

              if (elementendpoint.direction == "out") {
                this.endpointOut = elementendpoint.endpointNumber;
              }

              if (elementendpoint.direction=="in") {
                this.endpointIn = elementendpoint.endpointNumber;
              }

            });

          }

        });});

        if(this.endpointIn === 0) { console.error('endpointIn is 0'); }    if(this.endpointOut === 0) { console.error('endpointOut is 0'); }
      }

      async connect() {

        let readLoop = async () => {
          try {
            const result = await this.device.transferIn(this.endpointIn, 64);
            this.onReceive(result.data);
            readLoop();
          }
          catch(error) {
            this.onReceiveError(error);
          }
        };

        try {

          // Open the WebUSB device connection
          await this.device.open();

          // Select the passe configuration to that device
          // It is 1 as we are only interested in the first one.
          // We are only connecting to one device here.
          if (this.device.configuration === null) {
            return this.device.selectConfiguration(1);
          }

          // Set the endpoint for that device.
          await this.setEndpoints();

          console.log("Interface number:", this.interfaceNumber);
          console.log("Configuration:", this.device.configuration);

          // Claim the interface to be in use by this app.
          await this.device.claimInterface(this.interfaceNumber);

          try {
            // ??? leftover?
            await this.device.selectAlternateInterface(this.interfaceNumber, this.endpointIn);
          }
          catch(err) {
            //console.error('BOO!!! this.device.selectAlternateInterface() failed');
          }

          await this.device.controlTransferOut({
              'requestType': 'class',
              'recipient': 'interface',
              'request': 0x22,
              'value': 0x01,
              'index': this.interfaceNumber});

          // Start the read loop defined above
          readLoop();
          
        }
        catch(error) {
          console.error(error);
          throw error;
        }

      }

      async disconnect() {
        return this.device.controlTransferOut({
            'requestType': 'class',
            'recipient': 'interface',
            'request': 0x22,
            'value': 0x00,
            'index': this.interfaceNumber})
        .then(() => this.device.close());
      };

      send(data) {
        console.log('sending', data, this.endpointOut);
        return this.device.transferOut(this.endpointOut, data);
      };
      
      queueMessage (data) {
        if (queue.length > 5000) return console.warn('You have queued too many messages, have more chill')
        this.queue.push(data);
      }
      
      async processQueue () {
        // bounce if there's nothing left to do
        if (this.queue.length === 0) return;
        // bounce if we're already sending something and it hasn't been accepted yet
        if (this.transferInflight) return;
        
        this.transferInflight = true;
        
        const data = this.queue.shift();
        try {
          await this.send(data);
        } catch (e) {
          console.error(e);
          this.queue.unshift(data); // naive retry.
        }
        
        this.transferInflight = false;
      }
      
      startQueue () {
        this.stopQueue();
        this.queueInterval = setInterval(this.processQueue.bind(this), 1);
      }
      
      stopQueue () {
        if (this.queueInterval) clearInterval(this.queueInterval);
      }

    }

    /**
     * Hardware vendor ID filters for requesting access to a device
     * Controls which devices are listed in the pop-up requesting access to one.
     */
    const filters = [
      { 'vendorId': 0x239A }, // Adafruit boards
      { 'vendorId': 0xcafe }, // TinyUSB example
    ];

    /**
     * WebUSB serial connection
     */
    class Serial {

      constructor() {
      }

      static async getPorts(constructor) {
        return navigator.usb.getDevices().then(devices => {
          return devices.map(device => constructor ? new constructor(device) : new Port(device));
        });
      };

      static async requestPort(constructor) {
        return navigator.usb.requestDevice({ 'filters': filters }).then(
          device => new constructor ? new constructor(device) : new Port(device)
        );
      }

    }

    // This is a list of the params in a Plinky patch, in this order.
    // The order is therefore important. The list is from params_new.h in the Plinky fw.
    // It is used to translate the TypedArray that we get from the device into JSON.
    const EParams = [
      "P_PWM",
      "P_DRIVE",
      "P_PITCH",
      "P_OCT",
      "P_GLIDE",
      "P_INTERVAL",
      "P_NOISE",
      "P_MIXRESO",
      "P_ROTATE",
      "P_SCALE",
      "P_MICROTUNE",
      "P_STRIDE",
      "P_SENS",
      "P_A",
      "P_D",
      "P_S",
      "P_R",
      "P_ENV1_UNUSED",
      "P_ENV_LEVEL1",
      "P_A2",
      "P_D2",
      "P_S2",
      "P_R2",
      "P_ENV2_UNUSED",
      "P_DLSEND",
      "P_DLTIME",
      "P_DLRATIO",
      "P_DLWOB",
      "P_DLFB",
      "P_TEMPO",
      "P_RVSEND",
      "P_RVTIME",
      "P_RVSHIM",
      "P_RVWOB",
      "P_RVUNUSED",
      "P_SWING",
      "P_ARPONOFF",
      "P_ARPMODE",
      "P_ARPDIV",
      "P_ARPPROB",
      "P_ARPLEN",
      "P_ARPOCT",
      "P_LATCHONOFF",
      "P_SEQMODE",
      "P_SEQDIV",
      "P_SEQPROB",
      "P_SEQLEN",
      "P_GATE_LENGTH",
      "P_SMP_POS",
      "P_SMP_GRAINSIZE",
      "P_SMP_RATE",
      "P_SMP_TIME",
      "P_SAMPLE",
      "P_SEQPAT",
      "P_JIT_POS",
      "P_JIT_GRAINSIZE",
      "P_JIT_RATE",
      "P_JIT_PULSE",
      "P_JIT_UNUSED",
      "P_SEQSTEP",
      "P_ASCALE",
      "P_AOFFSET",
      "P_ADEPTH",
      "P_AFREQ",
      "P_ASHAPE",
      "P_AWARP",
      "P_BSCALE",
      "P_BOFFSET",
      "P_BDEPTH",
      "P_BFREQ",
      "P_BSHAPE",
      "P_BWARP",
      "P_XSCALE",
      "P_XOFFSET",
      "P_XDEPTH",
      "P_XFREQ",
      "P_XSHAPE",
      "P_XWARP",
      "P_YSCALE",
      "P_YOFFSET",
      "P_YDEPTH",
      "P_YFREQ",
      "P_YSHAPE",
      "P_YWARP",
      "P_MIXSYNTH",
      "P_MIXWETDRY",
      "P_MIXHPF",
      "P_MIX_UNUSED",
      "P_CV_QUANT",
      "P_HEADPHONE",
      "P_MIXINPUT",
      "P_MIXINWETDRY",
      "P_SYS_UNUSED1",
      "P_SYS_UNUSED2",
      "P_SYS_UNUSED3",
      "P_ACCEL_SENS",
    ];

    const PatchCategories = [
      "",
      "Bass",
      "Leads",
      "Pads",
      "Arps",
      "Plinks",
      "Plonks",
      "Beeps",
      "Boops",
      "SFX",
      "Line-In",
      "Sampler",
      "Donk",
      "Jolly",
      "Sadness",
      "Wild",
      "Gnarly",
      "Weird",
    ];

    const PlinkyParams = [
      {
        "id": "P_PWM",
        "min": -100,
        "max": 100,
        "type": "int16",
        "offset": 0,
        "cc": 13,
        "name": "Shape",
        "description": "Controls the shape of the oscillators in Plinky. When exactly 0%, you get 4 sawtooths per voice. When positive, you blend smoothly through 16 ROM wavetable shapes, (2 per voice,) provided by @miunau. When negative, you get PWM control of pulse/square shapes, (also 2 per voice.) CV and internal modulation only work either positive or negative: you can blend through the wavetables when the parameter is over 0, or you can modulate pulse/square waves when the value is negative. You cant cross through zero. Plinky pans each set of oscillators, (and the sample grains) a little giving the sound a rich stereo field. With the 4 saws at position 0, we have 2 oscilators panned left and 2 panned right. With the wavetable and pulse oscilators 1 is panned left and 1 is panned right."
      },
      {
        "id": "P_DRIVE",
        "min": -1024,
        "max": 1024,
        "cc": 4,
        "name":"Distortion",
        "description": "Drive/Saturation. When turned up high, the saturation unit will create guitar-like tones, especially when playing polyphonically. It can also be used to compensate for changes in volume, for example if the Sensitivity parameter is low."
      },
      {
        "id": "P_PITCH",
        "min": -1024,
        "max": 1024,
        "cc": 9,
        "name": "Pitch",
        "description": "Use this to (fine) tune plinky. Range is 1 octave up or down, unquantized."
      },
      {
        "id": "P_OCT",
        "min": -1024,
        "max": 1024,
        "cc": -1,
        "name": "Octave",
        "description": "Use this to quickly change pitch, quantised to octaves."
      },
      {
        "id": "P_GLIDE",
        "min": 0,
        "max": 127,
        "cc": 5,
        "name": "Glide",
        "description": "Controls the speed of the portamento between notes in a single voice. Higher = slower"
      },
      {
        "id": "P_INTERVAL",
        "min": 0,
        "max": 127,
        "cc": 14,
        "name": "Interval",
        "description": "Each voice has several oscillators, and this sets a fixed interval between them, from +1 to -1 octaves."
      },
      {
        "id": "P_NOISE",
        "min": -127,
        "max": 127,
        "cc": 2,
        "name": "Noise",
        "description": "Each voice can add a variable amount of white noise to the oscillator, before the low-pass gate."
      },
      {
        "id": "P_MIXRESO",
        "min": 0,
        "max": 127,
        "cc": 71,
        "name": "Resonance",
        "description": "Each voice has a 2-pole lowpass gate controlled by your finger pressure and the Sensitivity control. This parameter adds resonance to the filter. Note that at high levels of resonance, you may wish to adjust the drive or the high pass filter paramters."
      },
      {
        "id": "P_ROTATE",
        "min": 0,
        "max": 127,
        "cc": -1,
        "name": "Degree",
        "description": "Think of this as a quantized pitch control, that transposes plinky in such a way that all the notes stay in the same scale. In other words, it changes which degree of the scale is played, but not the root of the scale itself."
      },
      {
        "id": "P_SCALE",
        "min": 0,
        "max": 26,
        "cc": -1,
        "name": "Scale",
        "enum_id": [
            "S_MAJOR",			
            "S_MINOR",			
            "S_HARMMINOR",		
            "S_PENTA",			
            "S_PENTAMINOR",		
            "S_HIRAJOSHI",		
            "S_INSEN",			
            "S_IWATO",			
            "S_MINYO",			
            "S_FIFTHS",			
            "S_TRIADMAJOR",		
            "S_TRIADMINOR",		
            "S_DORIAN",		
            "S_PHYRGIAN",		
            "S_LYDIAN",			
            "S_MIXOLYDIAN",		
            "S_AEOLIAN",		
            "S_LOCRIAN",			
            "S_BLUESMINOR",		
            "S_BLUESMAJOR",		
            "S_ROMANIAN",		
            "S_WHOLETONE",		
            "S_HARMONICS",
            "S_HEXANY", 
            "S_JUST",
            "S_CHROMATIC",
            "S_LAST"
        ],
        "enum_name": [
            "Major",
            "Minor",
            "Harminoc Min",
            "Penta Maj",
            "Penta Min",
            "Hirajoshi",
            "Insen",
            "Iwato",
            "Minyo",
            "Fifths",
            "Triad Maj",
            "Triad Min",
            "Dorian",
            "Phrygian",
            "Lydian",
            "Mixolydian",
            "Aeolian",
            "Locrian",
            "Blues Min",
            "Blues Maj",
            "Romanian",
            "Wholetone",
            "Harmonics",
            "Hexany",
            "Just",
            "Chromatic"
        ],
        "description": "Selects which scale of notes plinky uses"
      },
      {
        "id": "P_MICROTUNE",
        "min": 0,
        "max": 127,
        "cc": -1,
        "name": "Microtune",
        "description": "Controls how much vertical movement of your finger detunes the note. This also thickens the sound through 'unison' detuning of the individual oscillators in each note, so values above 0 are recommended."
      },
      {
        "id": "P_STRIDE",
        "min": 0,
        "max": 127,
        "cc": -1,
        "name": "Stride",
        "description": "Controls the interval, in semitones, between each column of plinky. It defaults to 7 semitones, a perfect fifth, like a Cello or Violin. The notes are always snapped to the chosen scale, even if the stride calls for chromatic notes, so plinky does its best to choose column pitches that follow this stride while staying in-scale."
      },
      {
        "id": "P_SENS",
        "min": 0,
        "max": 1,
        "default": 0.5,
        "cc": 3,
        "name": "Sensitivity",
        "description": "Master sensitivty, controlling the mapping of finger pressure to the opening/closing of each voice's low-pass gate. If you are looking for a lowpass cutoff frequency, this is the parameter you want."
      },
      {
        "id": "P_A",
        "min": 0,
        "max": 127,
        "cc": 73,
        "name": "Attack",
        "description": "Attack time for the main envelope that controls the lowpass gate. The peak level is set by the pressure of your finger, modulated by the Sensitivity parameter."
      },
      {
        "id": "P_D",
        "min": 0,
        "max": 127,
        "cc": 75,
        "name": "Decay",
        "description": "Decay time for the main envelope that controls the lowpass gate."
      },
      {
        "id": "P_S",
        "min": 0,
        "max": 127,
        "cc": 74,
        "name": "Sustain",
        "description": "Sustain level for the main envelope that controls the lowpass gate."
      },
      {
        "id": "P_R",
        "min": 0,
        "max": 127,
        "cc": 72,
        "name": "Release",
        "description": "Release time for the main envelope that controls the lowpass gate."
      },
      {
        "id": "P_ENV_LEVEL1",
        "min": 0,
        "max": 127,
        "cc": -1,
        "name": "Envelope 1 level",
        "description": "Envelope 1 level"
      },
      {
        "id": "P_ENV_LEVEL",
        "min": 0,
        "max": 127,
        "cc": 19,
        "name": "Env 2 Level",
        "description": "Sets the peak level of the second envelope, which can be used as a modulation source."
      },
      {
        "id": "P_A2",
        "min": 0,
        "max": 127,
        "cc": 20,
        "name": "Attack 2",
        "description": "Attack time of the second envelope, which can be used as a modulation source."
      },
      {
        "id": "P_D2",
        "min": 0,
        "max": 127,
        "cc": 21,
        "name": "Decay 2",
        "description": "Decay time of the second envelope, which can be used as a modulation source."
      },
      {
        "id": "P_S2",
        "min": 0,
        "max": 127,
        "cc": 22,
        "name": "Sustain 2",
        "description": "Sustain level of the second envelope, which can be used as a modulation source."
      },
      {
        "id": "P_R2",
        "min": 0,
        "max": 127,
        "cc": 23,
        "name": "Release 2",
        "description": "Release time of the second envelope, which can be used as a modulation source."
      },
      {
        "id": "P_ENV2_UNUSED",
        "min": 0,
        "max": 127,
        "cc": -1,
        "description": "unused parameter slot"
      },
      {
        "id": "P_DLSEND",
        "min": 0,
        "max": 1,
        "default": 0,
        "cc": 94,
        "name": "Delay Send",
        "description": "Amount of the dry sound sent to the delay unit. Turn it up for echos!"
      },
      {
        "id": "P_DLTIME",
        "min": -1,
        "max": 1,
        "default": 0.375,
        "cc": 12,
        "name": "Delay Time",
        "description": "The time between each echo. Positive values are un-quantized; negative values are multiples of the current tempo."
      },
      {
        "id": "P_DLRATIO",
        "min": 0,
        "max": 1,
        "default": 1,
        "cc": -1,
        "name": "Delay Ratio",
        "description": "The delay unit is stereo. This moves the right tap to an earlier time, causing ping-pong poly-rhthmic repeats. Try simple ratios like 33%, 50%, 75%."
      },
      {
        "id": "P_DLWOB",
        "min": 0,
        "max": 1,
        "default": 0.25,
        "name": "Delay Wobble",
        "cc": -1,
        "description": "Amount of simulated tape speed wobble, causing pitch distortions in the delay."
      },
      {
        "id": "P_DLFB",
        "min": 0,
        "max": 1,
        "default": 0.5,
        "name": "Delay Feedback",
        "cc": 95,
        "description": "Amount of feedback - the volume of each echo reduces by this amount."
      },
      {
        "id": "P_TEMPO",
        "min": -1,
        "max": 1,
        "name": "BPM",
        "remap": "120*Math.pow(2,x)",
        "default": 0,
        "cc": -1,
        "description": "Tempo in BPM. You can also tap this parameter pad rhythmically to set the tempo."
      },
      {
        "id": "P_RVSEND",
        "min": 0,
        "max": 1,
        "name": "Reverb Send",
        "default": 0.25,
        "cc": 91,
        "description": "Amount of the dry sound sent to the reverb unit. Turn it up for reverb!"
      },
      {
        "id": "P_RVTIME",
        "min": 0,
        "max": 1,
        "default": 0.5,
        "name": "Reverb Time",
        "cc": 92,
        "description": "Reverb time. controls the length of the decay of the reverb."
      },
      {
        "id": "P_RVSHIM",
        "min": 0,
        "max": 1,
        "default": 0.25,
        "name": "Shimmer",
        "cc": 93,
        "description": "Amount of octave-up signal that is fed into the reverb, causing a shimmer effect."
      },
      {
        "id": "P_RVWOB",
        "min": 0,
        "max": 1,
        "default": 0.25,
        "name": "Reverb Wobble",
        "cc": -1,
        "description": "Amount of simulated tape speed wobble, causing pitch distortions in the reverb. Avoids metallic artefacts."
      },
      {
        "id": "P_RVUNUSED",
        "min": 0,
        "max": 1,
        "cc": -1,
        "description": "unused parameter slot"
      },
      {
        "id": "P_SWING",
        "min": 0,
        "max": 1,
        "cc": -1,
        "name": "Swing",
        "description": "OUT OF ORDER. This parameter will be used to add swing in a future firmware update"
      },
      {
        "id": "P_ARPONOFF",
        "min": 0,
        "max": 1,
        "cc": 102,
        "default": 0,
        "name": "Arp on/off",
        "description": "Switches the arpeggiator on and off."
      },
      {
        "id": "P_ARPMODE",
        "cc": 103,
        "default": 0,
        "min": 0,
        "max": 15,
        "name": "Arpeggiator Mode",
        "enum_id": [
          "ARP_UP",
          "ARP_DOWN",
          "ARP_UPDOWN",
          "ARP_UPDOWNREP",
          "ARP_PEDALUP",
          "ARP_PEDALDOWN",
          "ARP_PEDALUPDOWN",
          "ARP_RANDOM",
          "ARP_RANDOM2",
          "ARP_ALL",
          "ARP_UP8",
          "ARP_DOWN8",
          "ARP_UPDOWN8",
          "ARP_RANDOM8",
          "ARP_RANDOM28",
          "ARP_LAST"
        ],
        "enum_name": [
          "Up",
          "Down",
          "Up then Down",
          "Up then Down (repeat end notes)",
          "Up with lowest note pedal",
          "Down with lowest note pedal",
          "Up then down with lowest note pedal",
          "Random",
          "Random playing 2 notes at a time",
          "Repeat all notes (polyphonic)",
          "Up (all 8 columns)",
          "Down (all 8 columns)",
          "Up then Down (all 8 columns)",
          "Random (all 8 columns)",
          "Random, 2 notes at a time (all 8 columns)"
        ],
        "description": "Arpeggiator mode. The '8 column' modes include every column, even those without a note, introducing rests into the arpeggio."
      },
      {
        "id": "P_ARPDIV",
        "min": -1,
        "max": 22,
        "default": 0.09090909,
        "name": "Arp Clock Divide",
        "enum_id": [
          "1","2", "3","4","5", "6","8","10", "12","16","20", "24","32","40", "48","64","80", "96","128","160", "192", "256" 
        ],
        "enum_name": [
          "1/32","2/32", "3/32","4/32","5/32", "6/32","8/32","10/32", "12/32","16/32","20/32", "24/32","32/32","40/32", "48/32","64/32","80/32", "96/32","128/32","160/32", "192/32", "256/32" 
        ],
        "cc": -1,
        "description": "Sets the speed of the arpeggiator. Negative numbers are un-quantized, positive numbers divide a 32nd note clock."
      },
      {
        "id": "P_ARPPROB",
        "min": 0,
        "max": 1,
        "default": 1,
        "cc": -1,
        "name": "Arp Probability / Density",
        "description": "Sets the probability of the apreggiator progressing on each tick of its clock. If the Arp Length parameter is 0, this is a true random probability, otherwise it's the density of a Euclidean rhythm."
      },
      {
        "id": "P_ARPLEN",
        "min": -17,
        "max": 17,
        "default": 8,
        "cc": -1,
        "name": "Arp Pattern Length",
        "description": "When non zero, this sets the length of the euclidean pattern used by the arp. Use the Arp probability parameter to change how many note are included in each pattern. Negative values treat rests differently, try both."
      },
      {
        "id": "P_ARPOCT",
        "min": 0,
        "max": 4,
        "default": 0,
        "cc": -1,
        "name": "Arp Octaves",
        "description": "Sets how many octaves the arpeggiator ranges over."
      },
      {
        "id": "P_LATCHONOFF",
        "min": 0,
        "max": 1,
        "name": "Latch on/off",
        "cc": -1,
        "description": "Switches the latch on/off. When on, played notes will sustain even when you take your fingers off plinky. Useful for chords, arps, drones, or using plinky as an oscillator voice."
      },
      {
        "id": "P_SEQMODE",
        "min": 0,
        "max": 6,
        "name": "Sequencer Mode",
        "default": 0,
        "enum_id": [
          "SEQ_PAUSE",
          "SEQ_FWD",
          "SEQ_BACK",
          "SEQ_PINGPONG",
          "SEQ_PINGPONGREP",
          "SEQ_RANDOM",
          "SEQ_LAST"    
        ],
        "enum_name": [
          "Pause",
          "Forwards",
          "Backwards",
          "Pingpong",
          "Pingpong (repeat end notes)",
          "Random"
        ],
        "cc": -1,
        "description": "Sets the order that notes are played by the sequencer."
      },
      {
        "id": "P_SEQDIV",
        "min": 0,
        "max": 22,
        "default": 0.27272727,
        "name": "Seq Clock Divide",
        "enum_id": [
          "1","2", "3","4","5", "6","8","10", "12","16","20", "24","32","40", "48","64","80", "96","128","160", "192", "256" 
        ],
        "enum_name": [
          "1/32","2/32", "3/32","4/32","5/32", "6/32","8/32","10/32", "12/32","16/32","20/32", "24/32","32/32","40/32", "48/32","64/32","80/32", "96/32","128/32","160/32", "192/32", "256/32" 
        ],
        "cc": -1,
        "description": "Sets the speed of the sequencer. Negative numbers are un-quantized, positive numbers divide a 32nd note clock."
      },
      {
        "id": "P_SEQPROB",
        "min": 0,
        "max": 1,
        "default": 1,
        "cc": -1,
        "name": "Seq Probability / Density",
        "description": "Sets the probability of the sequencer progressing on each tick of its clock. If the Arp Length parameter is 0, this is a true random probability, otherwise it's the density of a Euclidean rhythm."
      },
      {
        "id": "P_SEQLEN",
        "min": -17,
        "max": 17,
        "default": 8,
        "cc": -1,
        "name": "Seq Pattern Length",
        "description": "When non zero, this sets the length of the euclidean pattern used by the sequencer. Use the Seq Probability parameter to change how many note are included in each pattern. Negative values treat rests differently, try both."
      },
      {
        "id": "P_GATE_LENGTH",
        "min": 0,
        "max": 127,
        "cc": 11,
        "name": "Gate length",
        "description": "Sets the length of the gate of each step. The gate is the signal that determines whether a note is on or off. Longer gates means notes are played longer, which (in tandem with Envelope 1) determines how long notes are sustained."
      },
      {
        "id": "P_SMP_POS",
        "min": 0,
        "max": 127,
        "cc": 15,
        "name": "Sample position",
        "description": "Controls the starting point of the sample playback, relative to the slice point. If you modulate this parameter you get dynamic slicing."
      },
      {
        "id": "P_SMP_GRAINSIZE",
        "min": 0,
        "max": 127,
        "cc": 16,
        "name": "Grain size",
        "description": "Sets the size of the grains. Modulate to achieve granular sound effects."
      },
      {
        "id": "P_SMP_RATE",
        "min": 0,
        "max": 127,
        "cc": 17,
        "name": "Sample playback rate",
        "description": "Determines at what relative speed the sample is played back, eg. 50% slows the sample down by a factor of 2, 200% speeds up the sample twice. Playback speed affects the pitch of the sample accordingly, slowing the sample down pitches it down, speeding up also pitches up."
      },
      {
        "id": "P_SMP_TIME",
        "min": 0,
        "max": 127,
        "cc": 18,
        "name": "Sample playback time",
        "description": "Determines at what relative speed the sample is played back, but without changing the pitch. As the sample is cut up in miniscule ‘grains’ of audio (milliseconds), Plinky repeats some of these grains to slow down, and leaves some grains out to speed up. Changes in grain size have more drastic effects when samples are stretched severely. "
      },
      {
        "id": "P_SAMPLE",
        "min": 0,
        "max": 127,
        "cc": 82,
        "name": "Sample #",
        "description": "Controls which sample is being played, allowing you to change samples from within a preset by assigning a LFO or CV source to this parameter."
      },
      {
        "id": "P_SEQPAT",
        "min": 0,
        "max": 127,
        "cc": 83,
        "name": "Sequencer pattern #",
        "description": "Controls which sequencer pattern is being played back, allowing you to change patterns from within a preset by assigning an LFO or CV source to this parameter. If you add a slow rising saw to this parameter you can chain various patterns together. "
      },
      {
        "id": "P_JIT_POS",
        "min": 0,
        "max": 127,
        "cc": -1,
        "name": "Sample position jitter",
        "description": "Adds an amount of randomness to the sample playback position."
      },
      {
        "id": "P_JIT_GRAINSIZE",
        "min": 0,
        "max": 127,
        "cc": -1,
        "name": "Grain size jitter",
        "description": "Adds an amount of randomness to the sample grain size."
      },
      {
        "id": "P_JIT_RATE",
        "min": 0,
        "max": 127,
        "cc": -1,
        "name": "Sample speed jitter",
        "description": "Adds an amount of randomness to the sample playback speed."
      },
      {
        "id": "P_JIT_PULSE",
        "min": 0,
        "max": 127,
        "cc": -1,
        "description": "unused parameter slot"
      },
      {
        "id": "P_JIT_UNUSED",
        "min": 0,
        "max": 127,
        "cc": -1,
        "description": "unused parameter slot"
      },
      {
        "id": "P_SEQSTEP",
        "min": 0,
        "max": 127,
        "cc": 85,
        "name": "Pattern offset",
        "description": "Offsets the starting point of the sequencer pattern allowing for variations in sequencer playback."
      },
      {
        "id": "P_ASCALE",
        "min": 0,
        "max": 127,
        "cc": -1,
        "name": "A scale",
        "description": "An attenuator for the signal coming from the corresponding CV input jacks."
      },
      {
        "id": "P_AOFFSET",
        "min": 0,
        "max": 127,
        "cc": 24,
        "name": "A offset",
        "description": "Offsets the CV and/or LFO. This is a constant voltage that is being added (or subtracted) from the sum of the CV input and the LFO."
      },
      {
        "id": "P_ADEPTH",
        "min": 0,
        "max": 127,
        "cc": 25,
        "name": "A depth",
        "description": "Attenuator for the internal LFO's.The default value is zero so turn this up for LFO's."
      },
      {
        "id": "P_AFREQ",
        "min": 0,
        "max": 127,
        "cc": 26,
        "name": "A rate",
        "description": "Controls the rate of the internal LFO. The LFO rates can range from 20 sceonds (at +100%) to milliseconds at -100%."
      },
      {
        "id": "P_ASHAPE",
        "min": 0,
        "max": 127,
        "cc": -1,
        "name": "A shape",
        "description": "Sets the shape of the LFO. The following shapes are available; Triangle, Sine, SmthRnd (Smooth Random), StepRnd (Stepped Random), BiSquare (Bipolar Square wave), Square (Unipolar Square wave), Castle (looks like a sandcastle), BiTrigs (Bipolar Trigger pulses), Trigs (Unipolar Trigger Pulses), Env."
      },
      {
        "id": "P_AWARP",
        "min": 0,
        "max": 127,
        "cc": -1,
        "name": "A warp",
        "description": "Sets the slope of the LFO shape - for example turning a triangle wave into a sharp ramp up (symmetry +100) or down (symmetry -100). "
      },
      {
        "id": "P_BSCALE",
        "min": 0,
        "max": 127,
        "cc": -1,
        "name": "B scale",
        "description": "An attenuator for the signal coming from the corresponding CV input jacks."
      },
      {
        "id": "P_BOFFSET",
        "min": 0,
        "max": 127,
        "cc": 27,
        "name": "B offset",
        "description": "Offsets the CV and/or LFO. This is a constant voltage that is being added (or subtracted) from the sum of the CV input and the LFO."
      },
      {
        "id": "P_BDEPTH",
        "min": 0,
        "max": 127,
        "cc": 28,
        "name": "B depth",
        "description": "Attenuator for the internal LFO's.The default value is zero so turn this up for LFO's."
      },
      {
        "id": "P_BFREQ",
        "min": 0,
        "max": 127,
        "cc": 29,
        "name": "B rate",
        "description": "Controls the rate of the internal LFO. The LFO rates can range from 20 sceonds (at +100%) to milliseconds at -100%."
      },
      {
        "id": "P_BSHAPE",
        "min": 0,
        "max": 127,
        "cc": -1,
        "name": "B shape",
        "description": "Sets the shape of the LFO. The following shapes are available; Triangle, Sine, SmthRnd (Smooth Random), StepRnd (Stepped Random), BiSquare (Bipolar Square wave), Square (Unipolar Square wave), Castle (looks like a sandcastle), BiTrigs (Bipolar Trigger pulses), Trigs (Unipolar Trigger Pulses), Env."
      },
      {
        "id": "P_BWARP",
        "min": 0,
        "max": 127,
        "cc": -1,
        "name": "B warp",
        "description": "Sets the slope of the LFO shape - for example turning a triangle wave into a sharp ramp up (symmetry +100) or down (symmetry -100). "
      },
      {
        "id": "P_XSCALE",
        "min": 0,
        "max": 127,
        "cc": -1,
        "name": "X scale",
        "description": "An attenuator for the signal coming from the corresponding CV input jacks."
      },
      {
        "id": "P_XOFFSET",
        "min": 0,
        "max": 127,
        "cc": 78,
        "name": "X offset",
        "description": "Offsets the CV and/or LFO. This is a constant voltage that is being added (or subtracted) from the sum of the CV input and the LFO."
      },
      {
        "id": "P_XDEPTH",
        "min": 0,
        "max": 127,
        "cc": 77,
        "name": "X depth",
        "description": "Attenuator for the internal LFO's.The default value is zero so turn this up for LFO's."
      },
      {
        "id": "P_XFREQ",
        "min": 0,
        "max": 127,
        "cc": 76,
        "name": "X rate",
        "description": "Controls the rate of the internal LFO. The LFO rates can range from 20 sceonds (at +100%) to milliseconds at -100%."
      },
      {
        "id": "P_XSHAPE",
        "min": 0,
        "max": 127,
        "cc": -1,
        "name": "X shape",
        "description": "Sets the shape of the LFO. The following shapes are available; Triangle, Sine, SmthRnd (Smooth Random), StepRnd (Stepped Random), BiSquare (Bipolar Square wave), Square (Unipolar Square wave), Castle (looks like a sandcastle), BiTrigs (Bipolar Trigger pulses), Trigs (Unipolar Trigger Pulses), Env."
      },
      {
        "id": "P_XWARP",
        "min": 0,
        "max": 127,
        "cc": -1,
        "name": "X warp",
        "description": "Sets the slope of the LFO shape - for example turning a triangle wave into a sharp ramp up (symmetry +100) or down (symmetry -100). "
      },
      {
        "id": "P_YSCALE",
        "min": 0,
        "max": 127,
        "cc": -1,
        "name": "Y scale",
        "description": "An attenuator for the signal coming from the corresponding CV input jacks."
      },
      {
        "id": "P_YOFFSET",
        "min": 0,
        "max": 127,
        "cc": 81,
        "name": "Y offset",
        "description": "Offsets the CV and/or LFO. This is a constant voltage that is being added (or subtracted) from the sum of the CV input and the LFO."
      },
      {
        "id": "P_YDEPTH",
        "min": 0,
        "max": 127,
        "cc": 80,
        "name": "Y depth",
        "description": "Attenuator for the internal LFO's.The default value is zero so turn this up for LFO's."
      },
      {
        "id": "P_YFREQ",
        "min": 0,
        "max": 127,
        "cc": 79,
        "name": "Y rate",
        "description": "Controls the rate of the internal LFO. The LFO rates can range from 20 sceonds (at +100%) to milliseconds at -100%."
      },
      {
        "id": "P_YSHAPE",
        "min": 0,
        "max": 127,
        "cc": -1,
        "name": "Y shape",
        "description": "Sets the shape of the LFO. The following shapes are available; Triangle, Sine, SmthRnd (Smooth Random), StepRnd (Stepped Random), BiSquare (Bipolar Square wave), Square (Unipolar Square wave), Castle (looks like a sandcastle), BiTrigs (Bipolar Trigger pulses), Trigs (Unipolar Trigger Pulses), Env."
      },
      {
        "id": "P_YWARP",
        "min": 0,
        "max": 127,
        "cc": -1,
        "name": "Y warp",
        "description": "Sets the slope of the LFO shape - for example turning a triangle wave into a sharp ramp up (symmetry +100) or down (symmetry -100). "
      },
      {
        "id": "P_MIXSYNTH",
        "min": 0,
        "max": 127,
        "cc": 7,
        "name": "Synth level",
        "description": "Sets the gain level of Plinky's synth / sampler. Above 50% you will start hitting a limiter, which can help to glue patches with wide dynamic range together. You can use this as a volume control if you are taking audio from the left / mono output."
      },
      {
        "id": "P_MIXWETDRY",
        "min": 0,
        "max": 127,
        "cc": 8,
        "name": "Synth wet/dry",
        "description": "Sets the balance between the dry signal of Plinky's voice (synth or sampler) and the wet signal of the Reverb and Delay units (the distortion/saturation device is applied directly to the 8 individual voices.) The default setting is zero where there is an equal mix of wet and dry signals. 100 is completely wet and -100 is completely dry."
      },
      {
        "id": "P_MIXHPF",
        "min": 0,
        "max": 127,
        "cc": 21,
        "name": "HPF",
        "description": "After the synth/sampler, external audio and the effects are mixed, they pass through a High Pass Filter. This parameter controls the cut off frequency."
      },
      {
        "id": "P_MIX_UNUSED",
        "min": 0,
        "max": 127,
        "cc": -1,
        "description": "unused parameter slot"
      },
      {
        "id": "P_CV_QUANT",
        "min": 0,
        "max": 127,
        "cc": -1,
        "name": "Pitch quantisation",
        "description": "Plinky’s pitch input is most useful when you have a sequence or latched note playing; the pitch is transposed according to the pitch CV input (1 volt per octave), and you can use this last parameter to choose if the transposition is unquantized, quantized to semitones, or transposed in-scale. 0v (C0) means no transposition."
      },
      {
        "id": "P_HEADPHONE",
        "min": 0,
        "max": 127,
        "cc": -1,
        "name": "Headphone level",
        "description": "Sets the level of the final output stage for the headphone out. Turn this up to 11."
      },
      {
        "id": "P_MIXINPUT",
        "min": 0,
        "max": 127,
        "cc": 89,
        "name": "Input level",
        "description": "Sets the gain level of Plinky's inputs. These inputs take line level signals and amplify them to Eurorack levels, but... If you feed it eurorack level, the analog saturation unit in Plinky V2 does it's thing. In case both the inputs on the face plate and the front/back side are used, Plinky mixes the inputs at fixed levels."
      },
      {
        "id": "P_MIXINWETDRY",
        "min": 0,
        "max": 127,
        "cc": 90,
        "name": "Input wet/dry",
        "description": "Sets the balance between the dry signal of the audio inputs and the wet signal passing through the Reverb and Delay units."
      },
      {
        "id": "P_ACCEL_SENS",
        "min": 0,
        "max": 127,
        "cc": -1,
        "name": "Accelerometer sensitivity",
        "description": "Sets the sensitivity of the accelerometer. Changes in orientation will send to the X & Y parameters. Turn this up to wiggle X & Y by moving your Plinky around in space."
      },
      {
        "id": "P_SYS_UNUSED1",
        "min": 0,
        "max": 127,
        "cc": -1,
        "description": "unused parameter slot"
      },
      {
        "id": "P_SYS_UNUSED2",
        "min": 0,
        "max": 127,
        "cc": -1,
        "description": "unused parameter slot"
      },
      {
        "id": "P_SYS_UNUSED3",
        "min": 0,
        "max": 127,
        "cc": -1,
        "description": "unused parameter slot"
      },
      {
        "id": "P_SYS_UNUSED4",
        "min": 0,
        "max": 127,
        "cc": -1,
        "description": "unused parameter slot"
      }
    ];

    const paramIconMap = {
      "P_PWM": "shape.svg",
      "P_DRIVE": "distortion--resonance.svg",
      "P_PITCH": "pitch.svg",
      "P_OCT": "octave--scale.svg",
      "P_GLIDE": "glide--microtone.svg",
      "P_INTERVAL": "osc-interval--column.svg",
      "P_NOISE": "noise.svg",
      "P_MIXRESO": "distortion--resonance.svg",
      "P_ROTATE": "degree.svg",
      "P_SCALE": "octave--scale.svg",
      "P_MICROTUNE": "glide--microtone.svg",
      "P_STRIDE": "osc-interval--column.svg",
      "P_SENS": "sensitivity--env-2-level.svg",
      "P_A": "attack.svg",
      "P_D": "decay.svg",
      "P_S": "sustain.svg",
      "P_R": "release.svg",
      "P_ENV1_UNUSED": "blank.svg",
      "P_ENV_LEVEL1": "sensitivity--env-2-level.svg",
      "P_A2": "attack.svg",
      "P_D2": "decay.svg",
      "P_S2": "sustain.svg",
      "P_R2": "release.svg",
      "P_ENV2_UNUSED": "blank.svg",
      "P_DLSEND": "delay--reverb.svg",
      "P_DLTIME": "time.svg",
      "P_DLRATIO": "pingpong--shimmer.svg",
      "P_DLWOB": "wobble.svg",
      "P_DLFB": "feedback.svg",
      "P_TEMPO": "tempo--swing.svg",
      "P_RVSEND": "delay--reverb.svg",
      "P_RVTIME": "time.svg",
      "P_RVSHIM": "pingpong--shimmer.svg",
      "P_RVWOB": "wobble.svg",
      "P_RVUNUSED": "feedback.svg",
      "P_SWING": "tempo--swing.svg",
      "P_ARPONOFF": "arp--latch.svg",
      "P_ARPMODE": "order.svg",
      "P_ARPDIV": "clock-div.svg",
      "P_ARPPROB": "chance.svg",
      "P_ARPLEN": "euclid-len.svg",
      "P_ARPOCT": "arp-octaves.svg",
      "P_LATCHONOFF": "arp--latch.svg",
      "P_SEQMODE": "order.svg",
      "P_SEQDIV": "clock-div.svg",
      "P_SEQPROB": "chance.svg",
      "P_SEQLEN": "euclid-len.svg",
      "P_GATE_LENGTH": "gate-len.svg",
      "P_SMP_POS": "scrub--jitter.svg",
      "P_SMP_GRAINSIZE": "grain-size--jitter.svg",
      "P_SMP_RATE": "play-speed--jitter.svg",
      "P_SMP_TIME": "time.svg",
      "P_SAMPLE": "sample.svg",
      "P_SEQPAT": "pattern--step-offset.svg",
      "P_JIT_POS": "scrub--jitter.svg",
      "P_JIT_GRAINSIZE": "grain-size--jitter.svg",
      "P_JIT_RATE": "play-speed--jitter.svg",
      "P_JIT_PULSE": "time.svg",
      "P_JIT_UNUSED": "blank.svg",
      "P_SEQSTEP": "pattern--step-offset.svg",
      "P_ASCALE": "a-b-cv-level.svg",
      "P_AOFFSET": "offset.svg",
      "P_ADEPTH": "lfo--depth.svg",
      "P_AFREQ": "lfo--rate.svg",
      "P_ASHAPE": "lfo--shape.svg",
      "P_AWARP": "lfo--symmetry.svg",
      "P_BSCALE": "a-b-cv-level.svg",
      "P_BOFFSET": "offset.svg",
      "P_BDEPTH": "lfo--depth.svg",
      "P_BFREQ": "lfo--rate.svg",
      "P_BSHAPE": "lfo--shape.svg",
      "P_BWARP": "lfo--symmetry.svg",
      "P_XSCALE": "x-y-cv-level.svg",
      "P_XOFFSET": "offset.svg",
      "P_XDEPTH": "lfo--depth.svg",
      "P_XFREQ": "lfo--rate.svg",
      "P_XSHAPE": "lfo--shape.svg",
      "P_XWARP": "lfo--symmetry.svg",
      "P_YSCALE": "x-y-cv-level.svg",
      "P_YOFFSET": "offset.svg",
      "P_YDEPTH": "lfo--depth.svg",
      "P_YFREQ": "lfo--rate.svg",
      "P_YSHAPE": "lfo--shape.svg",
      "P_YWARP": "lfo--symmetry.svg",
      "P_MIXSYNTH": "synth.svg",
      "P_MIXWETDRY": "wet-dry.svg",
      "P_MIXHPF": "hpf.svg",
      "P_MIX_UNUSED": "blank.svg",
      "P_CV_QUANT": "cv-quantize.svg",
      "P_HEADPHONE": "volume.svg",
      "P_MIXINPUT": "input.svg",
      "P_MIXINWETDRY": "wet-dry.svg",
      "P_SYS_UNUSED1": "blank.svg",
      "P_SYS_UNUSED2": "blank.svg",
      "P_SYS_UNUSED3": "blank.svg",
      "P_ACCEL_SENS": "cv-quantize.svg",
    };

    function getParam(id) {
      return PlinkyParams.find(param => {
        return param.id === id;
      });
    }

    class Param {

      constructor(params) {
        Object.assign(this, params);
        this.mods = {
          get env() {
            return params.arr[1];
          },
          set env(val) {
            params.arr[1] = val;
          },
          get pressure() {
            return params.arr[2];
          },
          set pressure(val) {
            params.arr[2] = val;
          },
          get a() {
            return params.arr[3];
          },
          set a(val) {
            params.arr[3] = val;
          },
          get b() {
            return params.arr[4];
          },
          set b(val) {
            params.arr[4] = val;
          },
          get x() {
            return params.arr[5];
          },
          set x(val) {
            params.arr[5] = val;
          },
          get y() {
            return params.arr[6];
          },
          set y(val) {
            params.arr[6] = val;
          },
          get random() {
            return params.arr[7];
          },
          set random(val) {
            params.arr[7] = val;
          },
        };
      }

      // @TODO — these could apply scale etc according to min, max, etc from 
      //         PlinkyParam
      get value() {
        return this.arr[0]
      }
      set value(val) {
        this.arr[0] = val;
      }
      
      getActiveSelectOption () {
        let values = this.getSelectOptions();
        if (!values) return null
        
        const width = 1024 / values.length;
        
        const i = Math.floor(this.value / width);
        
        return values[i]
      }
      
      get icon () {
        return paramIconMap[this.id]
      }
      
      getSelectOptions () {

        if (this.enum_name) {
          
          const length = this.enum_name.length;
          const values = this
            .enum_name
            .map(
              (entry, i) => ({ 
                label: entry, 
                value: Math.floor(i * (1024 / length) + (1024 / length * 0.5)) 
              })
            );
          return values
        } else {
          return null
        }

      }

    }


    class Patch {

      constructor(patch) {
        this.buffer = patch;
        this.params = [];

        // each parameter has 16 bytes;
        // first 2 bytes are the value, then the 7 mod matrix amounts
        EParams.forEach((param, index) => {
          // We have 16 bytes that we're looking at
          const len = 16;
          // Index to start slicing at
          const idx = index * len;
          // We have 16 bytes in the ArrayBuffer that we want — create an Int16Array
          // over those bytes
          const arr = new Int16Array(patch, idx, len);
          const plinkyParam = getParam(param) || { name: param, id: param };
          this.params.push(new Param({
            ...plinkyParam,
            arr
          }));
        });

        // bitfield
        this.bitFieldUInt8 = new Uint8Array(patch, patch.byteLength - 16, 16);
        this.bitFieldInt8 = new Int8Array(patch, patch.byteLength - 16, 16);
      }

      // @TODO — i'm not quite sure I understand what the setters for these should 
      //         look like yet
      get arp() { return (this.bitFieldUInt8[0] & 1) > 0; }
      get latch() { return (this.bitFieldUInt8[0] & 2) > 0; }
      get loopStart() { return this.bitFieldInt8[1]; }
      get loopLength() { return this.bitFieldInt8[2]; }
      
      get category () {
        const categoryArray = new Uint8Array(this.buffer, 1543, 1);
        return categoryArray[0];
      }
      
      set category (i) {
        if (i < 0) i = 0;
        const categoryArray = new Uint8Array(this.buffer, 1543, 1);
        categoryArray[0] = i;
      }
      
      get name () {
        const nameArray = new Uint8Array(this.buffer, 1544, 8);
        let str = "";
        nameArray.forEach(a => { 
          if (a == 0) return;
          str += String.fromCharCode(a);
        });
        return str;
      }
      
      set name (str) {
        const nameArray = new Uint8Array(this.buffer, 1544, 8);
        let i = 0;
        while (i < 8) {
          let charCode = str.charCodeAt(i);
          if (isNaN(charCode)) charCode = 0;
          nameArray[i] = charCode;
          i++;
        }
      }

      /**
       * # Replace the entire contents of the patch's underlying buffer
       * 
       */ 
      updateBuffer(patch) {
        // @todo - blat `patch` over the contents of this.buffer without reassigning this.buffer. 
      }
      
      setData(data, byteOffset) {
        // @todo - blat this data over the relevant bit of this.buffer
      }
      
    }

    /**
     * Class to wire up the WebUSB port responses to the Plinky state machine
     */
    class WebUSBPlinky extends Port$1 {

      onReceive(data) {
        console.log('Port data:', data);
        const { service } = PlinkyMachine;
        if(service.child) {
          // If we're in a child state machine state, try to transition that.
          service.child.send({
            type: 'data',
            data: data.buffer
          });
        }
        else {
          // Otherwise, transition the main machine.
          // NB: this isn't really used at the moment. The patch loading/saving
          // machines are their own child machines, and the only ones that accept
          // data events currently.
          service.send({
            type: 'data',
            data: data.buffer
          });
        }
      }

      onReceiveError(error) {
        console.error('Port error:', error);
        const { service } = PlinkyMachine;
        if(service.child) {
          service.child.send({
            type: 'error',
            data: error
          });
        }
        else {
          service.send({
            type: 'error',
            data: error
          });
        }

      }

    }

    /**
     * Connect the port inside the state machine context to a WebUSB port
     * @param {*} ctx - State machine context 
     * @returns {*} - New context with connected port
     */
    async function connect(ctx) {
      try {
        ctx.port = await Serial.requestPort(WebUSBPlinky);
        await ctx.port.connect();
        return ctx;
      }
      catch(err) {
        throw err;
      }
    }

    /**
     * Creates a Plinky state machine backed by a context that writes
     * to a Svelte store
     * @param {*} initialContext - Initial context to provide to machine
     * @returns {MachineStore} - Plinky state machine
     */
    function createPlinkyMachine(initialContext = {}) {

      const states = {
        disconnected: state(
          transition('connect', 'connecting'),
          transition('parsePatch', 'disconnected', reduce((ctx, ev) => {
            if(ev.patch) {
              const patch = ev.patch;
              const arrayBuffer = patch.buffer.slice(patch.byteOffset, patch.byteLength + patch.byteOffset);
              const patchObject = new Patch(arrayBuffer);

              window.currentPatch = patchObject; // <--- grab this if you need to do some debugging
              return { ...ctx, patch: patchObject }
            }
            return { ...ctx };
          }))
        ),
        connecting: invoke(
          connect,
          transition('done', 'connected'),
          transition('error', 'error', reduce((ctx, ev) =>
            ({ ...ctx, error: ev.error })
          ))
        ),
        connected: state(
          transition('loadPatch', 'loadPatch', reduce((ctx, ev) =>
            ({ ...ctx, patchNumber: ev.patchNumber })
          )),
          transition('savePatch', 'savePatch'),
          transition('clearPatch', 'clearPatch'),
          transition('error', 'error', reduce((ctx, ev) => {
            return { ...ctx, error: ev.error };
          }))
        ),
        clearPatch: state(
          immediate('connected', reduce((ctx) => {
            ctx.patch = null;
            return { ...ctx }
          }))
        ),
        loadPatch: invoke(
          PatchLoadMachine,
          transition('done', 'connected', reduce((ctx, ev) => {
            // The result from the PatchLoadMachine is an array in ev.data.result.
            // Concat all of them together into a new Uint8Array to get the whole patch data.
            const patchData = Uint8Array.from(Array.prototype.concat(...ev.data.result.map(a => Array.from(a))));
            const arrayBuffer = patchData.buffer.slice(patchData.byteOffset, patchData.byteLength + patchData.byteOffset);
            const patch = new Patch(arrayBuffer);

            window.currentPatch = patch; // <--- grab this if you wanna try debugging things
            return { ...ctx, patch };
          })),
          transition('error', 'error', reduce((ctx, ev) => {
            return { ...ctx, error: ev.error };
          }))
        ),
        savePatch: invoke(
          PatchSaveMachine,
          transition('done', 'connected'),
          transition('error', 'error', reduce((ctx, ev) => {
            return { ...ctx, error: ev.error };
          }))
        ),
        loadBank: invoke(
          BankLoadMachine,
          transition('done', 'connected', reduce((ctx, ev) => {
            const patch = Uint8Array.from(Array.prototype.concat(...ev.data.result.map(a => Array.from(a))));
            const arrayBuffer = patch.buffer.slice(patch.byteOffset, patch.byteLength + patch.byteOffset);
            const patchObject = new Patch(arrayBuffer);

            window.currentPatch = patchObject; // <--- grab this if you wanna try debugging things
            return { ...ctx, patch: patchObject };
          })),
          transition('error', 'error', reduce((ctx, ev) => {
            return { ...ctx, error: ev.error };
          }))
        ),
        error: state(
          transition('connect', 'connecting', reduce(ctx => {
            ctx.error = null;
            return { ...ctx };
          })),
        )
      };

      const context = (ctx) => {
        return { ...ctx };
      };

      const machine = createMachine(states, context);

      const bankSize = 32;
      const bank = Array(bankSize).fill().map((i, index) => {
        return {
          number: index,
          path: null
        }
      });

      return MachineStore(machine, Object.assign(initialContext, {
        port: null,
        patch: null,
        bank,
        patch: null
      }));
    }

    /**
     * Export a singleton of the Plinky state machine
     */
    const PlinkyMachine = createPlinkyMachine({
      patchNumber: 0,
    });

    // takes a 1152 element array b and turns into a short base64 string
    function bytecompress(b) {
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
      const compressed = btoa(String.fromCharCode.apply(null, bc));
      const uriSafe = compressed
        .replace(/\//g, "-")
        .replace(/=/g, "_")
        .replace(/\+/g, ".");
      return uriSafe
    }

    // takes a short base64 string and returns a 1152 element Uint8Array
    function bytedecompress(s) {
      s = s
        .replace(/-/g, "/")
        .replace(/_/g, "=")
        .replace(/\./g, "+");
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

    /* src/Param.svelte generated by Svelte v3.32.1 */

    const file = "src/Param.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	child_ctx[14] = i;
    	return child_ctx;
    }

    // (72:2) {:else}
    function create_else_block(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "range");
    			attr_dev(input, "min", /*rangeMin*/ ctx[3]);
    			attr_dev(input, "max", /*rangeMax*/ ctx[4]);
    			attr_dev(input, "step", 1);
    			input.value = /*val*/ ctx[1];
    			attr_dev(input, "passive", false);
    			add_location(input, file, 72, 2, 1415);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*updateVal*/ ctx[9], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*val*/ 2) {
    				prop_dev(input, "value", /*val*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(72:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (61:2) {#if hasDropdown}
    function create_if_block(ctx) {
    	let select;
    	let mounted;
    	let dispose;
    	let each_value = /*selectOptions*/ ctx[5];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(select, file, 61, 2, 1198);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*activeOption*/ ctx[6].value);

    			if (!mounted) {
    				dispose = listen_dev(select, "blur", /*updateVal*/ ctx[9], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*selectOptions*/ 32) {
    				each_value = /*selectOptions*/ ctx[5];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(select);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(61:2) {#if hasDropdown}",
    		ctx
    	});

    	return block;
    }

    // (66:4) {#each selectOptions as option, i}
    function create_each_block(ctx) {
    	let option;
    	let t0_value = /*option*/ ctx[12].label + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = space();
    			option.__value = /*option*/ ctx[12].value;
    			option.value = option.__value;
    			add_location(option, file, 66, 6, 1310);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(66:4) {#each selectOptions as option, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let li;
    	let header;
    	let img;
    	let img_src_value;
    	let t0;
    	let h3;
    	let t1_value = /*param*/ ctx[0].name + "";
    	let t1;
    	let t2;
    	let p0;
    	let t4;
    	let t5;
    	let div0;
    	let table0;
    	let tr0;
    	let td0;
    	let t7;
    	let td1;
    	let t8_value = round(/*normalise*/ ctx[2](/*param*/ ctx[0].value)) + "";
    	let t8;
    	let t9;
    	let br0;
    	let t10;
    	let tr1;
    	let td2;
    	let t12;
    	let td3;
    	let t13_value = round(/*normalise*/ ctx[2](/*param*/ ctx[0].mods.env)) + "";
    	let t13;
    	let t14;
    	let br1;
    	let t15;
    	let tr2;
    	let td4;
    	let t17;
    	let td5;
    	let t18_value = round(/*normalise*/ ctx[2](/*param*/ ctx[0].mods.pressure)) + "";
    	let t18;
    	let t19;
    	let br2;
    	let t20;
    	let tr3;
    	let td6;
    	let t22;
    	let td7;
    	let t23_value = round(/*normalise*/ ctx[2](/*param*/ ctx[0].mods.a)) + "";
    	let t23;
    	let t24;
    	let br3;
    	let t25;
    	let table1;
    	let tr4;
    	let td8;
    	let t27;
    	let td9;
    	let t28_value = round(/*normalise*/ ctx[2](/*param*/ ctx[0].mods.b)) + "";
    	let t28;
    	let t29;
    	let br4;
    	let t30;
    	let tr5;
    	let td10;
    	let t32;
    	let td11;
    	let t33_value = round(/*normalise*/ ctx[2](/*param*/ ctx[0].mods.x)) + "";
    	let t33;
    	let t34;
    	let br5;
    	let t35;
    	let tr6;
    	let td12;
    	let t37;
    	let td13;
    	let t38_value = round(/*normalise*/ ctx[2](/*param*/ ctx[0].mods.y)) + "";
    	let t38;
    	let t39;
    	let br6;
    	let t40;
    	let tr7;
    	let td14;
    	let t42;
    	let td15;
    	let t43_value = round(/*normalise*/ ctx[2](/*param*/ ctx[0].mods.random)) + "";
    	let t43;
    	let t44;
    	let br7;
    	let t45;
    	let div1;
    	let p1;
    	let t46_value = /*param*/ ctx[0].description + "";
    	let t46;

    	function select_block_type(ctx, dirty) {
    		if (/*hasDropdown*/ ctx[7]) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			li = element("li");
    			header = element("header");
    			img = element("img");
    			t0 = space();
    			h3 = element("h3");
    			t1 = text(t1_value);
    			t2 = space();
    			p0 = element("p");
    			p0.textContent = `${/*displayValue*/ ctx[8]}`;
    			t4 = space();
    			if_block.c();
    			t5 = space();
    			div0 = element("div");
    			table0 = element("table");
    			tr0 = element("tr");
    			td0 = element("td");
    			td0.textContent = "Base";
    			t7 = space();
    			td1 = element("td");
    			t8 = text(t8_value);
    			t9 = text("%");
    			br0 = element("br");
    			t10 = space();
    			tr1 = element("tr");
    			td2 = element("td");
    			td2.textContent = "Env";
    			t12 = space();
    			td3 = element("td");
    			t13 = text(t13_value);
    			t14 = text("%");
    			br1 = element("br");
    			t15 = space();
    			tr2 = element("tr");
    			td4 = element("td");
    			td4.textContent = "Pressure";
    			t17 = space();
    			td5 = element("td");
    			t18 = text(t18_value);
    			t19 = text("%");
    			br2 = element("br");
    			t20 = space();
    			tr3 = element("tr");
    			td6 = element("td");
    			td6.textContent = "A";
    			t22 = space();
    			td7 = element("td");
    			t23 = text(t23_value);
    			t24 = text("%");
    			br3 = element("br");
    			t25 = space();
    			table1 = element("table");
    			tr4 = element("tr");
    			td8 = element("td");
    			td8.textContent = "B";
    			t27 = space();
    			td9 = element("td");
    			t28 = text(t28_value);
    			t29 = text("%");
    			br4 = element("br");
    			t30 = space();
    			tr5 = element("tr");
    			td10 = element("td");
    			td10.textContent = "X";
    			t32 = space();
    			td11 = element("td");
    			t33 = text(t33_value);
    			t34 = text("%");
    			br5 = element("br");
    			t35 = space();
    			tr6 = element("tr");
    			td12 = element("td");
    			td12.textContent = "Y";
    			t37 = space();
    			td13 = element("td");
    			t38 = text(t38_value);
    			t39 = text("%");
    			br6 = element("br");
    			t40 = space();
    			tr7 = element("tr");
    			td14 = element("td");
    			td14.textContent = "Random";
    			t42 = space();
    			td15 = element("td");
    			t43 = text(t43_value);
    			t44 = text("%");
    			br7 = element("br");
    			t45 = space();
    			div1 = element("div");
    			p1 = element("p");
    			t46 = text(t46_value);
    			if (img.src !== (img_src_value = "icons/" + /*param*/ ctx[0].icon)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-xxz8nc");
    			add_location(img, file, 48, 4, 971);
    			attr_dev(h3, "class", "svelte-xxz8nc");
    			add_location(h3, file, 49, 4, 1015);
    			add_location(p0, file, 52, 4, 1053);
    			attr_dev(header, "class", "svelte-xxz8nc");
    			add_location(header, file, 47, 2, 958);
    			attr_dev(td0, "class", "svelte-xxz8nc");
    			add_location(td0, file, 85, 8, 1617);
    			add_location(br0, file, 86, 44, 1675);
    			attr_dev(td1, "class", "svelte-xxz8nc");
    			add_location(td1, file, 86, 8, 1639);
    			add_location(tr0, file, 84, 6, 1604);
    			attr_dev(td2, "class", "svelte-xxz8nc");
    			add_location(td2, file, 89, 8, 1716);
    			add_location(br1, file, 90, 47, 1776);
    			attr_dev(td3, "class", "svelte-xxz8nc");
    			add_location(td3, file, 90, 8, 1737);
    			add_location(tr1, file, 88, 6, 1703);
    			attr_dev(td4, "class", "svelte-xxz8nc");
    			add_location(td4, file, 93, 8, 1817);
    			add_location(br2, file, 94, 52, 1887);
    			attr_dev(td5, "class", "svelte-xxz8nc");
    			add_location(td5, file, 94, 8, 1843);
    			add_location(tr2, file, 92, 6, 1804);
    			attr_dev(td6, "class", "svelte-xxz8nc");
    			add_location(td6, file, 97, 8, 1928);
    			add_location(br3, file, 98, 45, 1984);
    			attr_dev(td7, "class", "svelte-xxz8nc");
    			add_location(td7, file, 98, 8, 1947);
    			add_location(tr3, file, 96, 6, 1915);
    			attr_dev(table0, "class", "svelte-xxz8nc");
    			add_location(table0, file, 83, 4, 1590);
    			attr_dev(td8, "class", "svelte-xxz8nc");
    			add_location(td8, file, 103, 8, 2050);
    			add_location(br4, file, 104, 45, 2106);
    			attr_dev(td9, "class", "svelte-xxz8nc");
    			add_location(td9, file, 104, 8, 2069);
    			add_location(tr4, file, 102, 6, 2037);
    			attr_dev(td10, "class", "svelte-xxz8nc");
    			add_location(td10, file, 107, 8, 2147);
    			add_location(br5, file, 108, 45, 2203);
    			attr_dev(td11, "class", "svelte-xxz8nc");
    			add_location(td11, file, 108, 8, 2166);
    			add_location(tr5, file, 106, 6, 2134);
    			attr_dev(td12, "class", "svelte-xxz8nc");
    			add_location(td12, file, 111, 8, 2244);
    			add_location(br6, file, 112, 45, 2300);
    			attr_dev(td13, "class", "svelte-xxz8nc");
    			add_location(td13, file, 112, 8, 2263);
    			add_location(tr6, file, 110, 6, 2231);
    			attr_dev(td14, "class", "svelte-xxz8nc");
    			add_location(td14, file, 115, 8, 2341);
    			add_location(br7, file, 116, 50, 2407);
    			attr_dev(td15, "class", "svelte-xxz8nc");
    			add_location(td15, file, 116, 8, 2365);
    			add_location(tr7, file, 114, 6, 2328);
    			attr_dev(table1, "class", "svelte-xxz8nc");
    			add_location(table1, file, 101, 4, 2023);
    			attr_dev(div0, "class", "mods svelte-xxz8nc");
    			add_location(div0, file, 82, 2, 1567);
    			attr_dev(p1, "class", "svelte-xxz8nc");
    			add_location(p1, file, 121, 4, 2483);
    			attr_dev(div1, "class", "description svelte-xxz8nc");
    			add_location(div1, file, 120, 2, 2453);
    			attr_dev(li, "class", "svelte-xxz8nc");
    			add_location(li, file, 46, 0, 951);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, header);
    			append_dev(header, img);
    			append_dev(header, t0);
    			append_dev(header, h3);
    			append_dev(h3, t1);
    			append_dev(header, t2);
    			append_dev(header, p0);
    			append_dev(li, t4);
    			if_block.m(li, null);
    			append_dev(li, t5);
    			append_dev(li, div0);
    			append_dev(div0, table0);
    			append_dev(table0, tr0);
    			append_dev(tr0, td0);
    			append_dev(tr0, t7);
    			append_dev(tr0, td1);
    			append_dev(td1, t8);
    			append_dev(td1, t9);
    			append_dev(td1, br0);
    			append_dev(table0, t10);
    			append_dev(table0, tr1);
    			append_dev(tr1, td2);
    			append_dev(tr1, t12);
    			append_dev(tr1, td3);
    			append_dev(td3, t13);
    			append_dev(td3, t14);
    			append_dev(td3, br1);
    			append_dev(table0, t15);
    			append_dev(table0, tr2);
    			append_dev(tr2, td4);
    			append_dev(tr2, t17);
    			append_dev(tr2, td5);
    			append_dev(td5, t18);
    			append_dev(td5, t19);
    			append_dev(td5, br2);
    			append_dev(table0, t20);
    			append_dev(table0, tr3);
    			append_dev(tr3, td6);
    			append_dev(tr3, t22);
    			append_dev(tr3, td7);
    			append_dev(td7, t23);
    			append_dev(td7, t24);
    			append_dev(td7, br3);
    			append_dev(div0, t25);
    			append_dev(div0, table1);
    			append_dev(table1, tr4);
    			append_dev(tr4, td8);
    			append_dev(tr4, t27);
    			append_dev(tr4, td9);
    			append_dev(td9, t28);
    			append_dev(td9, t29);
    			append_dev(td9, br4);
    			append_dev(table1, t30);
    			append_dev(table1, tr5);
    			append_dev(tr5, td10);
    			append_dev(tr5, t32);
    			append_dev(tr5, td11);
    			append_dev(td11, t33);
    			append_dev(td11, t34);
    			append_dev(td11, br5);
    			append_dev(table1, t35);
    			append_dev(table1, tr6);
    			append_dev(tr6, td12);
    			append_dev(tr6, t37);
    			append_dev(tr6, td13);
    			append_dev(td13, t38);
    			append_dev(td13, t39);
    			append_dev(td13, br6);
    			append_dev(table1, t40);
    			append_dev(table1, tr7);
    			append_dev(tr7, td14);
    			append_dev(tr7, t42);
    			append_dev(tr7, td15);
    			append_dev(td15, t43);
    			append_dev(td15, t44);
    			append_dev(td15, br7);
    			append_dev(li, t45);
    			append_dev(li, div1);
    			append_dev(div1, p1);
    			append_dev(p1, t46);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*param*/ 1 && img.src !== (img_src_value = "icons/" + /*param*/ ctx[0].icon)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*param*/ 1 && t1_value !== (t1_value = /*param*/ ctx[0].name + "")) set_data_dev(t1, t1_value);
    			if_block.p(ctx, dirty);
    			if (dirty & /*param*/ 1 && t8_value !== (t8_value = round(/*normalise*/ ctx[2](/*param*/ ctx[0].value)) + "")) set_data_dev(t8, t8_value);
    			if (dirty & /*param*/ 1 && t13_value !== (t13_value = round(/*normalise*/ ctx[2](/*param*/ ctx[0].mods.env)) + "")) set_data_dev(t13, t13_value);
    			if (dirty & /*param*/ 1 && t18_value !== (t18_value = round(/*normalise*/ ctx[2](/*param*/ ctx[0].mods.pressure)) + "")) set_data_dev(t18, t18_value);
    			if (dirty & /*param*/ 1 && t23_value !== (t23_value = round(/*normalise*/ ctx[2](/*param*/ ctx[0].mods.a)) + "")) set_data_dev(t23, t23_value);
    			if (dirty & /*param*/ 1 && t28_value !== (t28_value = round(/*normalise*/ ctx[2](/*param*/ ctx[0].mods.b)) + "")) set_data_dev(t28, t28_value);
    			if (dirty & /*param*/ 1 && t33_value !== (t33_value = round(/*normalise*/ ctx[2](/*param*/ ctx[0].mods.x)) + "")) set_data_dev(t33, t33_value);
    			if (dirty & /*param*/ 1 && t38_value !== (t38_value = round(/*normalise*/ ctx[2](/*param*/ ctx[0].mods.y)) + "")) set_data_dev(t38, t38_value);
    			if (dirty & /*param*/ 1 && t43_value !== (t43_value = round(/*normalise*/ ctx[2](/*param*/ ctx[0].mods.random)) + "")) set_data_dev(t43, t43_value);
    			if (dirty & /*param*/ 1 && t46_value !== (t46_value = /*param*/ ctx[0].description + "")) set_data_dev(t46, t46_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const paramMax = 100;
    const xMax = 1024;

    function round(num) {
    	return Math.round(num * 10 + Number.EPSILON) / 10;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Param", slots, []);
    	let { param = null } = $$props;

    	function normalise(x) {
    		return (paramMax - paramMin) * ((x - xMin) / (xMax - xMin)) + paramMin;
    	}

    	const paramMin = -100;
    	const xMin = -1024;
    	let val = param;
    	let rangeMin = param.min < 0 ? -1024 : 0;
    	let rangeMax = 1024;
    	let selectOptions = param.getSelectOptions();
    	let activeOption = param.getActiveSelectOption();
    	let hasDropdown = selectOptions !== null;

    	let displayValue = activeOption
    	? activeOption.label
    	: round(normalise(param.value));

    	function updateVal(e) {
    		// take into account LERP from minmax
    		$$invalidate(1, val = e.target.value);

    		$$invalidate(0, param.value = val, param);
    	}

    	const writable_props = ["param"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Param> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("param" in $$props) $$invalidate(0, param = $$props.param);
    	};

    	$$self.$capture_state = () => ({
    		param,
    		normalise,
    		round,
    		paramMin,
    		paramMax,
    		xMin,
    		xMax,
    		val,
    		rangeMin,
    		rangeMax,
    		selectOptions,
    		activeOption,
    		hasDropdown,
    		displayValue,
    		updateVal
    	});

    	$$self.$inject_state = $$props => {
    		if ("param" in $$props) $$invalidate(0, param = $$props.param);
    		if ("val" in $$props) $$invalidate(1, val = $$props.val);
    		if ("rangeMin" in $$props) $$invalidate(3, rangeMin = $$props.rangeMin);
    		if ("rangeMax" in $$props) $$invalidate(4, rangeMax = $$props.rangeMax);
    		if ("selectOptions" in $$props) $$invalidate(5, selectOptions = $$props.selectOptions);
    		if ("activeOption" in $$props) $$invalidate(6, activeOption = $$props.activeOption);
    		if ("hasDropdown" in $$props) $$invalidate(7, hasDropdown = $$props.hasDropdown);
    		if ("displayValue" in $$props) $$invalidate(8, displayValue = $$props.displayValue);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		param,
    		val,
    		normalise,
    		rangeMin,
    		rangeMax,
    		selectOptions,
    		activeOption,
    		hasDropdown,
    		displayValue,
    		updateVal
    	];
    }

    class Param$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { param: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Param",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get param() {
    		throw new Error("<Param>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set param(value) {
    		throw new Error("<Param>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.32.1 */

    const { console: console_1 } = globals;
    const file$1 = "src/App.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[22] = list[i];
    	child_ctx[23] = list;
    	child_ctx[24] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[25] = list[i];
    	child_ctx[27] = i;
    	return child_ctx;
    }

    // (110:1) {#if error}
    function create_if_block_3(ctx) {
    	let p;
    	let t_value = /*$store*/ ctx[0].context.error + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			attr_dev(p, "class", "error");
    			add_location(p, file$1, 110, 2, 2857);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$store*/ 1 && t_value !== (t_value = /*$store*/ ctx[0].context.error + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(110:1) {#if error}",
    		ctx
    	});

    	return block;
    }

    // (114:1) {#if !connected}
    function create_if_block_2(ctx) {
    	let p;
    	let t0;
    	let a;
    	let br;
    	let t2;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text("You need the 0.9l firmware (or newer) to use this. ");
    			a = element("a");
    			a.textContent = "Download here!";
    			br = element("br");
    			t2 = text("\n\t\tPlease use a Chromium based browser like Google Chrome (Edge might work too). Firefox does not work currently.");
    			attr_dev(a, "href", "https://plinkysynth.com/firmware");
    			add_location(a, file$1, 114, 56, 2983);
    			add_location(br, file$1, 114, 117, 3044);
    			add_location(p, file$1, 114, 2, 2929);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, a);
    			append_dev(p, br);
    			append_dev(p, t2);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(114:1) {#if !connected}",
    		ctx
    	});

    	return block;
    }

    // (192:1) {:else}
    function create_else_block$1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "No patch in browser memory";
    			add_location(p, file$1, 192, 2, 5299);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(192:1) {:else}",
    		ctx
    	});

    	return block;
    }

    // (155:1) {#if $store.context.patch}
    function create_if_block$1(ctx) {
    	let p0;
    	let t1;
    	let button;
    	let t3;
    	let p1;
    	let t4;
    	let t5_value = /*$store*/ ctx[0].context.patch.buffer.byteLength + "";
    	let t5;
    	let t6;
    	let t7;
    	let h30;
    	let t9;
    	let label;
    	let t11;
    	let input0;
    	let t12;
    	let h31;
    	let t14;
    	let input1;
    	let input1_value_value;
    	let t15;
    	let select;
    	let select_value_value;
    	let t16;
    	let h32;
    	let t18;
    	let p2;
    	let t19;
    	let t20_value = /*$store*/ ctx[0].context.patch.arp + "";
    	let t20;
    	let br0;
    	let t21;
    	let t22_value = /*$store*/ ctx[0].context.patch.latch + "";
    	let t22;
    	let br1;
    	let t23;
    	let t24_value = /*$store*/ ctx[0].context.patch.loopStart + "";
    	let t24;
    	let br2;
    	let t25;
    	let t26_value = /*$store*/ ctx[0].context.patch.loopLength + "";
    	let t26;
    	let br3;
    	let t27;
    	let ul;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_1 = PatchCategories;
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = /*$store*/ ctx[0].context.patch.params;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			p0 = element("p");
    			p0.textContent = "This is the patch that has been loaded into the browser's memory.";
    			t1 = space();
    			button = element("button");
    			button.textContent = "Clear patch in browser memory";
    			t3 = space();
    			p1 = element("p");
    			t4 = text("Loaded: ");
    			t5 = text(t5_value);
    			t6 = text(" bytes");
    			t7 = space();
    			h30 = element("h3");
    			h30.textContent = "Link to patch";
    			t9 = space();
    			label = element("label");
    			label.textContent = "Link:";
    			t11 = space();
    			input0 = element("input");
    			t12 = space();
    			h31 = element("h3");
    			h31.textContent = "Patch name and category";
    			t14 = space();
    			input1 = element("input");
    			t15 = space();
    			select = element("select");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t16 = space();
    			h32 = element("h3");
    			h32.textContent = "Params";
    			t18 = space();
    			p2 = element("p");
    			t19 = text("Arp: ");
    			t20 = text(t20_value);
    			br0 = element("br");
    			t21 = text("\n\t\t\tLatch: ");
    			t22 = text(t22_value);
    			br1 = element("br");
    			t23 = text("\n\t\t\tLoop start: ");
    			t24 = text(t24_value);
    			br2 = element("br");
    			t25 = text("\n\t\t\tLoop length: ");
    			t26 = text(t26_value);
    			br3 = element("br");
    			t27 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(p0, file$1, 156, 2, 4177);
    			attr_dev(button, "class", "svelte-5ss4gt");
    			add_location(button, file$1, 158, 2, 4253);
    			add_location(p1, file$1, 160, 2, 4340);
    			add_location(h30, file$1, 162, 2, 4407);
    			attr_dev(label, "for", "i-link-url");
    			add_location(label, file$1, 163, 2, 4432);
    			attr_dev(input0, "class", "link svelte-5ss4gt");
    			input0.value = /*linkUrl*/ ctx[5];
    			attr_dev(input0, "id", "i-link-url");
    			add_location(input0, file$1, 164, 2, 4472);
    			add_location(h31, file$1, 166, 2, 4528);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "maxlength", "8");
    			input1.value = input1_value_value = /*$store*/ ctx[0].context.patch.name;
    			attr_dev(input1, "id", "i-name");
    			add_location(input1, file$1, 167, 2, 4563);
    			attr_dev(select, "id", "i-category");
    			add_location(select, file$1, 168, 2, 4673);
    			add_location(h32, file$1, 175, 2, 4872);
    			add_location(br0, file$1, 178, 34, 4929);
    			add_location(br1, file$1, 179, 38, 4972);
    			add_location(br2, file$1, 180, 47, 5024);
    			add_location(br3, file$1, 181, 49, 5078);
    			add_location(p2, file$1, 177, 2, 4891);
    			attr_dev(ul, "class", "params svelte-5ss4gt");
    			add_location(ul, file$1, 184, 2, 5093);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, button, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, p1, anchor);
    			append_dev(p1, t4);
    			append_dev(p1, t5);
    			append_dev(p1, t6);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, h30, anchor);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, label, anchor);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, input0, anchor);
    			insert_dev(target, t12, anchor);
    			insert_dev(target, h31, anchor);
    			insert_dev(target, t14, anchor);
    			insert_dev(target, input1, anchor);
    			insert_dev(target, t15, anchor);
    			insert_dev(target, select, anchor);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(select, null);
    			}

    			select_option(select, /*$store*/ ctx[0].context.patch.category);
    			insert_dev(target, t16, anchor);
    			insert_dev(target, h32, anchor);
    			insert_dev(target, t18, anchor);
    			insert_dev(target, p2, anchor);
    			append_dev(p2, t19);
    			append_dev(p2, t20);
    			append_dev(p2, br0);
    			append_dev(p2, t21);
    			append_dev(p2, t22);
    			append_dev(p2, br1);
    			append_dev(p2, t23);
    			append_dev(p2, t24);
    			append_dev(p2, br2);
    			append_dev(p2, t25);
    			append_dev(p2, t26);
    			append_dev(p2, br3);
    			insert_dev(target, t27, anchor);
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "click", prevent_default(/*clearPatch*/ ctx[10]), false, true, false),
    					listen_dev(input1, "change", /*updatePatchName*/ ctx[12], false, false, false),
    					listen_dev(select, "blur", /*updateCategory*/ ctx[13], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*$store*/ 1) && t5_value !== (t5_value = /*$store*/ ctx[0].context.patch.buffer.byteLength + "")) set_data_dev(t5, t5_value);

    			if (!current || dirty & /*linkUrl*/ 32 && input0.value !== /*linkUrl*/ ctx[5]) {
    				prop_dev(input0, "value", /*linkUrl*/ ctx[5]);
    			}

    			if (!current || dirty & /*$store*/ 1 && input1_value_value !== (input1_value_value = /*$store*/ ctx[0].context.patch.name) && input1.value !== input1_value_value) {
    				prop_dev(input1, "value", input1_value_value);
    			}

    			if (dirty & /*PatchCategories*/ 0) {
    				each_value_1 = PatchCategories;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (!current || dirty & /*$store*/ 1 && select_value_value !== (select_value_value = /*$store*/ ctx[0].context.patch.category)) {
    				select_option(select, /*$store*/ ctx[0].context.patch.category);
    			}

    			if ((!current || dirty & /*$store*/ 1) && t20_value !== (t20_value = /*$store*/ ctx[0].context.patch.arp + "")) set_data_dev(t20, t20_value);
    			if ((!current || dirty & /*$store*/ 1) && t22_value !== (t22_value = /*$store*/ ctx[0].context.patch.latch + "")) set_data_dev(t22, t22_value);
    			if ((!current || dirty & /*$store*/ 1) && t24_value !== (t24_value = /*$store*/ ctx[0].context.patch.loopStart + "")) set_data_dev(t24, t24_value);
    			if ((!current || dirty & /*$store*/ 1) && t26_value !== (t26_value = /*$store*/ ctx[0].context.patch.loopLength + "")) set_data_dev(t26, t26_value);

    			if (dirty & /*$store*/ 1) {
    				each_value = /*$store*/ ctx[0].context.patch.params;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(ul, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(button);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(h30);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(label);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(input0);
    			if (detaching) detach_dev(t12);
    			if (detaching) detach_dev(h31);
    			if (detaching) detach_dev(t14);
    			if (detaching) detach_dev(input1);
    			if (detaching) detach_dev(t15);
    			if (detaching) detach_dev(select);
    			destroy_each(each_blocks_1, detaching);
    			if (detaching) detach_dev(t16);
    			if (detaching) detach_dev(h32);
    			if (detaching) detach_dev(t18);
    			if (detaching) detach_dev(p2);
    			if (detaching) detach_dev(t27);
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(155:1) {#if $store.context.patch}",
    		ctx
    	});

    	return block;
    }

    // (170:3) {#each PatchCategories as category, i}
    function create_each_block_1(ctx) {
    	let option;
    	let t_value = /*category*/ ctx[25] + "";
    	let t;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = /*i*/ ctx[27];
    			option.value = option.__value;
    			add_location(option, file$1, 170, 4, 4807);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(170:3) {#each PatchCategories as category, i}",
    		ctx
    	});

    	return block;
    }

    // (187:4) {#if param.name && !param.name.endsWith('_UNUSED')}
    function create_if_block_1(ctx) {
    	let paramlistitem;
    	let updating_param;
    	let current;

    	function paramlistitem_param_binding(value) {
    		/*paramlistitem_param_binding*/ ctx[15].call(null, value, /*param*/ ctx[22], /*each_value*/ ctx[23], /*param_index*/ ctx[24]);
    	}

    	let paramlistitem_props = {};

    	if (/*param*/ ctx[22] !== void 0) {
    		paramlistitem_props.param = /*param*/ ctx[22];
    	}

    	paramlistitem = new Param$1({
    			props: paramlistitem_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(paramlistitem, "param", paramlistitem_param_binding));

    	const block = {
    		c: function create() {
    			create_component(paramlistitem.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(paramlistitem, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const paramlistitem_changes = {};

    			if (!updating_param && dirty & /*$store*/ 1) {
    				updating_param = true;
    				paramlistitem_changes.param = /*param*/ ctx[22];
    				add_flush_callback(() => updating_param = false);
    			}

    			paramlistitem.$set(paramlistitem_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(paramlistitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(paramlistitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(paramlistitem, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(187:4) {#if param.name && !param.name.endsWith('_UNUSED')}",
    		ctx
    	});

    	return block;
    }

    // (186:3) {#each $store.context.patch.params as param}
    function create_each_block$1(ctx) {
    	let show_if = /*param*/ ctx[22].name && !/*param*/ ctx[22].name.endsWith("_UNUSED");
    	let if_block_anchor;
    	let current;
    	let if_block = show_if && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$store*/ 1) show_if = /*param*/ ctx[22].name && !/*param*/ ctx[22].name.endsWith("_UNUSED");

    			if (show_if) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$store*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(186:3) {#each $store.context.patch.params as param}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let main;
    	let h1;
    	let t1;
    	let h20;
    	let t2;
    	let t3_value = /*$store*/ ctx[0].state + "";
    	let t3;
    	let t4;
    	let t5;
    	let t6;
    	let button0;
    	let t7;
    	let t8;
    	let div;
    	let h21;
    	let t10;
    	let p;
    	let t12;
    	let label;
    	let t14;
    	let input;
    	let t15;
    	let button1;
    	let t16;
    	let t17;
    	let button2;
    	let t18;
    	let t19;
    	let h22;
    	let t21;
    	let current_block_type_index;
    	let if_block2;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*error*/ ctx[4] && create_if_block_3(ctx);
    	let if_block1 = !/*connected*/ ctx[2] && create_if_block_2(ctx);
    	const if_block_creators = [create_if_block$1, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$store*/ ctx[0].context.patch) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block2 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = "Plinky WebUSB editor";
    			t1 = space();
    			h20 = element("h2");
    			t2 = text("Current state: ");
    			t3 = text(t3_value);
    			t4 = space();
    			if (if_block0) if_block0.c();
    			t5 = space();
    			if (if_block1) if_block1.c();
    			t6 = space();
    			button0 = element("button");
    			t7 = text("Connect");
    			t8 = space();
    			div = element("div");
    			h21 = element("h2");
    			h21.textContent = "Patch";
    			t10 = space();
    			p = element("p");
    			p.textContent = "Per-patch operations - you can load and save patches on the device.";
    			t12 = space();
    			label = element("label");
    			label.textContent = "Patch number";
    			t14 = space();
    			input = element("input");
    			t15 = space();
    			button1 = element("button");
    			t16 = text("Load patch");
    			t17 = space();
    			button2 = element("button");
    			t18 = text("Save patch");
    			t19 = space();
    			h22 = element("h2");
    			h22.textContent = "Current patch";
    			t21 = space();
    			if_block2.c();
    			attr_dev(h1, "class", "svelte-5ss4gt");
    			add_location(h1, file$1, 106, 1, 2771);
    			add_location(h20, file$1, 107, 1, 2802);
    			set_style(button0, "display", !/*connected*/ ctx[2] ? "block" : "none");
    			attr_dev(button0, "class", "svelte-5ss4gt");
    			add_location(button0, file$1, 118, 1, 3175);
    			add_location(h21, file$1, 121, 2, 3326);
    			add_location(p, file$1, 122, 2, 3343);
    			attr_dev(label, "for", "i-patch-number");
    			add_location(label, file$1, 123, 2, 3420);
    			attr_dev(input, "min", "1");
    			attr_dev(input, "max", "32");
    			attr_dev(input, "type", "number");
    			input.disabled = /*disabled*/ ctx[3];
    			attr_dev(input, "id", "i-patch-number");
    			add_location(input, file$1, 124, 2, 3471);
    			button1.disabled = /*disabled*/ ctx[3];
    			attr_dev(button1, "class", "svelte-5ss4gt");
    			add_location(button1, file$1, 133, 2, 3630);
    			button2.disabled = /*disabled*/ ctx[3];
    			attr_dev(button2, "class", "svelte-5ss4gt");
    			add_location(button2, file$1, 134, 2, 3701);
    			set_style(div, "display", /*connected*/ ctx[2] ? "block" : "none");
    			add_location(div, file$1, 120, 1, 3270);
    			add_location(h22, file$1, 152, 1, 4122);
    			attr_dev(main, "class", "svelte-5ss4gt");
    			add_location(main, file$1, 105, 0, 2763);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(main, t1);
    			append_dev(main, h20);
    			append_dev(h20, t2);
    			append_dev(h20, t3);
    			append_dev(main, t4);
    			if (if_block0) if_block0.m(main, null);
    			append_dev(main, t5);
    			if (if_block1) if_block1.m(main, null);
    			append_dev(main, t6);
    			append_dev(main, button0);
    			append_dev(button0, t7);
    			append_dev(main, t8);
    			append_dev(main, div);
    			append_dev(div, h21);
    			append_dev(div, t10);
    			append_dev(div, p);
    			append_dev(div, t12);
    			append_dev(div, label);
    			append_dev(div, t14);
    			append_dev(div, input);
    			set_input_value(input, /*patchVal*/ ctx[1]);
    			append_dev(div, t15);
    			append_dev(div, button1);
    			append_dev(button1, t16);
    			append_dev(div, t17);
    			append_dev(div, button2);
    			append_dev(button2, t18);
    			append_dev(main, t19);
    			append_dev(main, h22);
    			append_dev(main, t21);
    			if_blocks[current_block_type_index].m(main, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*connect*/ ctx[7], false, false, false),
    					listen_dev(input, "input", /*input_input_handler*/ ctx[14]),
    					listen_dev(input, "change", /*setPatchVal*/ ctx[11], false, false, false),
    					listen_dev(button1, "click", /*loadPatch*/ ctx[8], false, false, false),
    					listen_dev(button2, "click", /*savePatch*/ ctx[9], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*$store*/ 1) && t3_value !== (t3_value = /*$store*/ ctx[0].state + "")) set_data_dev(t3, t3_value);

    			if (/*error*/ ctx[4]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_3(ctx);
    					if_block0.c();
    					if_block0.m(main, t5);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (!/*connected*/ ctx[2]) {
    				if (if_block1) ; else {
    					if_block1 = create_if_block_2(ctx);
    					if_block1.c();
    					if_block1.m(main, t6);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (!current || dirty & /*connected*/ 4) {
    				set_style(button0, "display", !/*connected*/ ctx[2] ? "block" : "none");
    			}

    			if (!current || dirty & /*disabled*/ 8) {
    				prop_dev(input, "disabled", /*disabled*/ ctx[3]);
    			}

    			if (dirty & /*patchVal*/ 2 && to_number(input.value) !== /*patchVal*/ ctx[1]) {
    				set_input_value(input, /*patchVal*/ ctx[1]);
    			}

    			if (!current || dirty & /*disabled*/ 8) {
    				prop_dev(button1, "disabled", /*disabled*/ ctx[3]);
    			}

    			if (!current || dirty & /*disabled*/ 8) {
    				prop_dev(button2, "disabled", /*disabled*/ ctx[3]);
    			}

    			if (!current || dirty & /*connected*/ 4) {
    				set_style(div, "display", /*connected*/ ctx[2] ? "block" : "none");
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block2 = if_blocks[current_block_type_index];

    				if (!if_block2) {
    					if_block2 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block2.c();
    				} else {
    					if_block2.p(ctx, dirty);
    				}

    				transition_in(if_block2, 1);
    				if_block2.m(main, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block2);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block2);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if_blocks[current_block_type_index].d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function compress(input) {
    	return input.split("").reduce(
    		(o, c) => {
    			if (o[o.length - 2] === c && o[o.length - 1] < 35) o[o.length - 1]++; else o.push(c, 0);
    			return o;
    		},
    		[]
    	).map(_ => typeof _ === "number" ? _.toString(36) : _).join("");
    }

    function decompress(input) {
    	return input.split("").map((c, i, a) => i % 2
    	? undefined
    	: new Array(2 + parseInt(a[i + 1], 36)).join(c)).join("");
    }

    function selectBankItem(num) {
    	console.log(num);
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let connected;
    	let disabled;
    	let error;
    	let linkUrl;
    	let $store;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let port;
    	let inref;
    	let inarrbufref;
    	let outref;
    	const { store, send, service } = PlinkyMachine;
    	validate_store(store, "store");
    	component_subscribe($$self, store, value => $$invalidate(0, $store = value));

    	onMount(() => {
    		let params = new URL(document.location).searchParams;
    		let patch = params.get("p");

    		if (patch) {
    			const decodedPatch = bytedecompress(decodeURIComponent(patch));
    			console.log("patch: ", patch, decodedPatch);
    			send({ type: "parsePatch", patch: decodedPatch });
    		}
    	});

    	async function connect() {
    		send("connect");
    	}

    	function loadPatch() {
    		if ($store.context.patchNumber < 0) set_store_value(store, $store.context.patchNumber = 0, $store);
    		if ($store.context.patchNumber > 31) set_store_value(store, $store.context.patchNumber = 31, $store);

    		send({
    			type: "loadPatch",
    			patchNumber: $store.context.patchNumber
    		});
    	}

    	function savePatch() {
    		if ($store.context.patchNumber < 0) set_store_value(store, $store.context.patchNumber = 0, $store);
    		if ($store.context.patchNumber > 31) set_store_value(store, $store.context.patchNumber = 31, $store);

    		send({
    			type: "savePatch",
    			patchNumber: $store.context.patchNumber
    		});
    	}

    	function clearPatch() {
    		const uri = window.location.toString();

    		if (uri.indexOf("?") > 0) {
    			window.history.replaceState({}, document.title, uri.substring(0, uri.indexOf("?")));
    		}

    		send({ type: "clearPatch" });
    	}

    	let patchVal = $store.context.patchNumber + 1;

    	let setPatchVal = () => {
    		const zeroIndexPatchVal = patchVal - 1;
    		set_store_value(store, $store.context.patchNumber = zeroIndexPatchVal, $store);
    	};

    	function updatePatchName(e) {
    		set_store_value(store, $store.context.patch.name = e.target.value, $store);
    	}

    	function updateCategory(e) {
    		set_store_value(store, $store.context.patch.category = e.target.value, $store);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		patchVal = to_number(this.value);
    		$$invalidate(1, patchVal);
    	}

    	function paramlistitem_param_binding(value, param, each_value, param_index) {
    		each_value[param_index] = value;
    		store.set($store);
    	}

    	$$self.$capture_state = () => ({
    		encode,
    		decode,
    		onMount,
    		PlinkyMachine,
    		state,
    		PatchCategories,
    		bytecompress,
    		bytedecompress,
    		ParamListItem: Param$1,
    		port,
    		inref,
    		inarrbufref,
    		outref,
    		store,
    		send,
    		service,
    		compress,
    		decompress,
    		connect,
    		loadPatch,
    		savePatch,
    		clearPatch,
    		patchVal,
    		setPatchVal,
    		selectBankItem,
    		updatePatchName,
    		updateCategory,
    		$store,
    		connected,
    		disabled,
    		error,
    		linkUrl
    	});

    	$$self.$inject_state = $$props => {
    		if ("port" in $$props) port = $$props.port;
    		if ("inref" in $$props) inref = $$props.inref;
    		if ("inarrbufref" in $$props) inarrbufref = $$props.inarrbufref;
    		if ("outref" in $$props) outref = $$props.outref;
    		if ("patchVal" in $$props) $$invalidate(1, patchVal = $$props.patchVal);
    		if ("setPatchVal" in $$props) $$invalidate(11, setPatchVal = $$props.setPatchVal);
    		if ("connected" in $$props) $$invalidate(2, connected = $$props.connected);
    		if ("disabled" in $$props) $$invalidate(3, disabled = $$props.disabled);
    		if ("error" in $$props) $$invalidate(4, error = $$props.error);
    		if ("linkUrl" in $$props) $$invalidate(5, linkUrl = $$props.linkUrl);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$store*/ 1) {
    			$$invalidate(2, connected = ["connected", "loadPatch", "savePatch"].indexOf($store.state) > -1);
    		}

    		if ($$self.$$.dirty & /*$store*/ 1) {
    			$$invalidate(3, disabled = ["loadPatch", "savePatch"].indexOf($store.state) > -1);
    		}

    		if ($$self.$$.dirty & /*$store*/ 1) {
    			$$invalidate(4, error = ["error"].indexOf($store.state) > -1);
    		}

    		if ($$self.$$.dirty & /*$store*/ 1) {
    			$$invalidate(5, linkUrl = $store.context.patch
    			? location.protocol + "//" + location.host + location.pathname + "?p=" + encodeURIComponent(bytecompress(new Uint8Array($store.context.patch.buffer)))
    			: "");
    		}
    	};

    	return [
    		$store,
    		patchVal,
    		connected,
    		disabled,
    		error,
    		linkUrl,
    		store,
    		connect,
    		loadPatch,
    		savePatch,
    		clearPatch,
    		setPatchVal,
    		updatePatchName,
    		updateCategory,
    		input_input_handler,
    		paramlistitem_param_binding
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
