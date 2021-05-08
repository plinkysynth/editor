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
export class Serial {

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
