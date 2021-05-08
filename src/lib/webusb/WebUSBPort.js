/**
 * WebUSB port
 */
export class Port extends EventTarget {

  constructor(device) {
    super();
    this.device = device;
    this.interfaceNumber = 0;
    this.endpointIn = 0;
    this.endpointOut = 0;
    this.queue = [];
    this.transferInflight = false
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

    })});

    if(this.endpointIn === 0) { console.error('endpointIn is 0') };
    if(this.endpointOut === 0) { console.error('endpointOut is 0') };

  }

  async connect() {

    let readLoop = async () => {
      try {
        const result = await this.device.transferIn(this.endpointIn, 64)
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
    
    this.transferInflight = true
    
    const data = this.queue.shift();
    try {
      await this.send(data)
    } catch (e) {
      console.error(e)
      this.queue.unshift(data) // naive retry.
    }
    
    this.transferInflight = false
  }
  
  startQueue () {
    this.stopQueue()
    this.queueInterval = setInterval(this.processQueue.bind(this), 1);
  }
  
  stopQueue () {
    if (this.queueInterval) clearInterval(this.queueInterval)
  }

}
