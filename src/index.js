const VENDOR_ID = 0x16d0;
const PRODUCT_ID = 0x0de0;

export class Tiller extends EventTarget {
	#device = null;
	#ledOn = false;
	#ledColor = { r: 255, g: 255, b: 255 };
	#isPressed = false;
	#longPressFired = false;
	#lastTapTime = 0;
	#tapTimeout = null;
	#longPressTimeout = null;

	#scrollSensitivity;
	#doubleTapThreshold;
	#longPressThreshold;

	constructor({ scrollSensitivity = 1, doubleTapThreshold = 300, longPressThreshold = 500 } = {}) {
		super();
		this.#scrollSensitivity = scrollSensitivity;
		this.#doubleTapThreshold = doubleTapThreshold;
		this.#longPressThreshold = longPressThreshold;
	}

	async connect() {
		if (!('hid' in navigator)) throw new Error('WebHID is not supported in this browser');

		const paired = await navigator.hid.getDevices();
		let device = paired.find((d) => d.vendorId === VENDOR_ID && d.productId === PRODUCT_ID);

		if (!device) {
			[device] = await navigator.hid.requestDevice({
				filters: [{ vendorId: VENDOR_ID, productId: PRODUCT_ID }],
			});
		}

		if (!device) throw new Error('No Tiller device selected');

		this.#device = device;
		if (!device.opened) await device.open();

		this.#setupInputListener();
		this.#setupConnectionListeners();
	}

	#setupInputListener() {
		this.#device.addEventListener('inputreport', (event) => {
			const { data } = event;
			const byte0 = data.getUint8(0);
			const velocity = data.getInt8(1);

			if (byte0 === 1 && !this.#isPressed) {
				this.#isPressed = true;
				this.#longPressFired = false;
				this.#emit('press');
				this.#longPressTimeout = setTimeout(() => {
					this.#longPressFired = true;
					this.#emit('longpress');
				}, this.#longPressThreshold);
			}

			if (byte0 === 0 && this.#isPressed) {
				this.#isPressed = false;
				clearTimeout(this.#longPressTimeout);
				this.#emit('release');
				if (!this.#longPressFired) this.#handleTap();
			}

			if (velocity !== 0) {
				this.#emit('scroll', velocity * this.#scrollSensitivity);
			}
		});
	}

	#handleTap() {
		const now = Date.now();
		if (now - this.#lastTapTime < this.#doubleTapThreshold) {
			clearTimeout(this.#tapTimeout);
			this.#lastTapTime = 0;
			this.#emit('doubletap');
		} else {
			this.#lastTapTime = now;
			this.#tapTimeout = setTimeout(() => {
				this.#lastTapTime = 0;
				this.#emit('tap');
			}, this.#doubleTapThreshold);
		}
	}

	#setupConnectionListeners() {
		navigator.hid.addEventListener('disconnect', ({ device }) => {
			if (device === this.#device) {
				this.#device = null;
				this.#emit('disconnect');
			}
		});

		navigator.hid.addEventListener('connect', async ({ device }) => {
			if (device.vendorId === VENDOR_ID && device.productId === PRODUCT_ID) {
				this.#device = device;
				await device.open();
				this.#setupInputListener();
				this.#emit('connect');
			}
		});
	}

	#emit(event, detail) {
		this.dispatchEvent(
			detail !== undefined
				? new CustomEvent(event, { detail })
				: new Event(event)
		);
	}

	on(event, handler) {
		this.addEventListener(event, (e) => handler(e instanceof CustomEvent ? e.detail : undefined));
		return this;
	}

	async setLedColor(r, g, b) {
		if (!this.#device) return;
		this.#ledColor = { r, g, b };
		await this.#device.sendReport(0, new Uint8Array([0x31, r, g, b]));
		await this.#device.sendReport(0, new Uint8Array([0x30, 0x02]));
		this.#ledOn = true;
	}

	async setLedOn() {
		if (!this.#device) return;
		const { r, g, b } = this.#ledColor;
		await this.#device.sendReport(0, new Uint8Array([0x31, r, g, b]));
		await this.#device.sendReport(0, new Uint8Array([0x30, 0x02]));
		this.#ledOn = true;
	}

	async setLedOff() {
		if (!this.#device) return;
		await this.#device.sendReport(0, new Uint8Array([0x30, 0x01]));
		this.#ledOn = false;
	}

	async toggleLed() {
		this.#ledOn ? await this.setLedOff() : await this.setLedOn();
	}

	get isConnected() {
		return this.#device !== null;
	}

	get ledOn() {
		return this.#ledOn;
	}

	get ledColor() {
		return { ...this.#ledColor };
	}
}
