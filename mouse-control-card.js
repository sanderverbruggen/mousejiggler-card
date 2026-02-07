const LitElement = Object.getPrototypeOf(
  customElements.get("ha-panel-lovelace")
);
const html = LitElement.prototype.html;
const css = LitElement.prototype.css;

class MouseControlCard extends LitElement {
  static get properties() {
    return {
      hass: {},
      config: {},
    };
  }

  static getStubConfig() {
    return {
      entity_lmb: "switch.voorbeeld_links",
      entity_rmb: "switch.voorbeeld_rechts",
      entity_num_l: "input_number.voorbeeld_links",
      entity_num_r: "input_number.voorbeeld_rechts",
      entity_palm_l: "button.voorbeeld_links",
      entity_palm_r: "button.voorbeeld_rechts"
    }
  }

  setConfig(config) {
    if (!config.entity_lmb) {
      throw new Error("Je moet minimaal een entiteit kiezen");
    }
    this.config = config;
  }

  render() {
    if (!this.hass || !this.config) {
      return html``;
    }

    const stateObj = (entity) => this.hass.states[entity];
    
    const lmb = stateObj(this.config.entity_lmb);
    const rmb = stateObj(this.config.entity_rmb);
    const numL = stateObj(this.config.entity_num_l);
    const numR = stateObj(this.config.entity_num_r);
    
    const lmbActive = lmb ? lmb.state === 'on' : false;
    const rmbActive = rmb ? rmb.state === 'on' : false;

    return html`
      <ha-card>
        <div class="mouse-container">
          <div class="clicker-zone">
            <div class="clicker left ${lmbActive ? 'active' : ''}" @click="${() => this._toggle(this.config.entity_lmb)}">
              <ha-icon icon="${lmb?.attributes?.icon || 'mdi:power'}"></ha-icon>
            </div>
            <div class="clicker right ${rmbActive ? 'active' : ''}" @click="${() => this._toggle(this.config.entity_rmb)}">
              <ha-icon icon="${rmb?.attributes?.icon || 'mdi:power'}"></ha-icon>
            </div>
          </div>

          <div class="palm-zone">
            <div class="numbers-row">
              <div class="number-control">
                <div class="num-btn" @click="${() => this._updateNum(this.config.entity_num_l, -1)}">-</div>
                <div class="num-val">${numL ? numL.state : '-'}</div>
                <div class="num-btn" @click="${() => this._updateNum(this.config.entity_num_l, 1)}">+</div>
              </div>
              <div class="number-control">
                <div class="num-btn" @click="${() => this._updateNum(this.config.entity_num_r, -1)}">-</div>
                <div class="num-val">${numR ? numR.state : '-'}</div>
                <div class="num-btn" @click="${() => this._updateNum(this.config.entity_num_r, 1)}">+</div>
              </div>
            </div>

            <div class="buttons-row">
               <div class="action-btn" @click="${() => this._handleTap(this.config.entity_palm_l)}">
                 <ha-icon icon="${this.config.icon_palm_l || 'mdi:gesture-tap'}"></ha-icon>
               </div>
               <div class="action-btn" @click="${() => this._handleTap(this.config.entity_palm_r)}">
                 <ha-icon icon="${this.config.icon_palm_r || 'mdi:gesture-tap'}"></ha-icon>
               </div>
            </div>
          </div>
        </div>
      </ha-card>
    `;
  }

  _toggle(entity) {
    this.hass.callService('homeassistant', 'toggle', { entity_id: entity });
  }

  _updateNum(entity, delta) {
    if(!entity || !this.hass.states[entity]) return;
    const step = this.hass.states[entity].attributes.step || 1;
    const current = parseFloat(this.hass.states[entity].state);
    const newValue = current + (delta * step);
    this.hass.callService('input_number', 'set_value', { entity_id: entity, value: newValue });
  }

  _handleTap(entity) {
    if(!entity) return;
    this.hass.callService('homeassistant', 'toggle', { entity_id: entity });
  }

  static get styles() {
    return css`
      ha-card {
        background: none; border: none; box-shadow: none;
        display: flex; justify-content: center; width: 100%;
      }
      .mouse-container {
        background-color: var(--card-background-color, #fff);
        border: 1px solid var(--divider-color, #e0e0e0);
        width: 100%; max-width: 400px; aspect-ratio: 0.7;
        border-radius: 40% 40% 45% 45% / 25% 25% 50% 50%;
        display: flex; flex-direction: column; overflow: hidden;
        box-shadow: var(--ha-card-box-shadow, 0px 2px 1px -1px rgba(0,0,0,0.2));
      }
      .clicker-zone { flex: 0 0 35%; display: flex; border-bottom: 1px solid var(--divider-color, #e0e0e0); }
      .clicker { flex: 1; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.2s; }
      .clicker.left { border-right: 1px solid var(--divider-color); }
      .clicker:active { background: rgba(127,127,127, 0.2); }
      .clicker.active { background-color: var(--primary-color); color: var(--text-primary-color, #fff); }
      .clicker ha-icon { --mdc-icon-size: 32px; }
      .palm-zone { flex: 1; display: flex; flex-direction: column; padding-top: 10px; }
      .numbers-row { display: flex; justify-content: space-around; padding: 5px 0; }
      .number-control { display: flex; align-items: center; gap: 8px; background: var(--secondary-background-color, #f5f5f5); padding: 4px 8px; border-radius: 12px; }
      .num-btn { cursor: pointer; font-weight: bold; font-size: 18px; color: var(--primary-color); }
      .buttons-row { display: flex; justify-content: space-around; align-items: center; flex: 1; padding-bottom: 15px; }
      .action-btn { background-color: var(--secondary-background-color); border-radius: 50%; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center; cursor: pointer; }
    `;
  }

  // Dit koppelt de editor aan de kaart
  static getConfigElement() {
    return document.createElement("mouse-control-card-editor");
  }
}

// DE EDITOR KLASSE (Voor de GUI)
class MouseControlCardEditor extends LitElement {
  static get properties() {
    return {
      hass: {},
      config: {},
    };
  }

  setConfig(config) {
    this.config = config;
  }

  render() {
    if (!this.hass || !this.config) {
      return html``;
    }

    // Helper om entiteit-pickers te maken
    const renderPicker = (label, value, configKey, domain) => html`
      <ha-entity-picker
        .hass=${this.hass}
        .value=${value}
        .label=${label}
        .includeDomains=${domain}
        @value-changed=${(e) => this._valueChanged(e, configKey)}
      ></ha-entity-picker>
    `;

    return html`
      <div class="card-config">
        <h3>Muis Knoppen (Boven)</h3>
        ${renderPicker("Linker Muisknop (Switch)", this.config.entity_lmb, 'entity_lmb', ['switch', 'light'])}
        ${renderPicker("Rechter Muisknop (Switch)", this.config.entity_rmb, 'entity_rmb', ['switch', 'light'])}

        <h3>Nummers (Midden)</h3>
        ${renderPicker("Nummer Links", this.config.entity_num_l, 'entity_num_l', ['input_number'])}
        ${renderPicker("Nummer Rechts", this.config.entity_num_r, 'entity_num_r', ['input_number'])}

        <h3>Palm Knoppen (Onder)</h3>
        ${renderPicker("Knop Links", this.config.entity_palm_l, 'entity_palm_l', ['button', 'script', 'scene', 'input_button'])}
        ${renderPicker("Knop Rechts", this.config.entity_palm_r, 'entity_palm_r', ['button', 'script', 'scene', 'input_button'])}
        
        <div style="display: flex; gap: 10px; margin-top: 10px;">
            <ha-icon-picker
                .label="${"Icon Palm Links"}"
                .value="${this.config.icon_palm_l}"
                .configValue=${"icon_palm_l"}
                @value-changed=${this._valueChangedRaw}
            ></ha-icon-picker>
            <ha-icon-picker
                .label="${"Icon Palm Rechts"}"
                .value="${this.config.icon_palm_r}"
                .configValue=${"icon_palm_r"}
                @value-changed=${this._valueChangedRaw}
            ></ha-icon-picker>
        </div>
      </div>
    `;
  }

  _valueChanged(ev, key) {
    if (!this.config || !this.hass) return;
    const value = ev.detail.value;
    this._updateConfig(key, value);
  }

  _valueChangedRaw(ev) {
    if (!this.config || !this.hass) return;
    const target = ev.target;
    if (this.config[`${target.configValue}`] === target.value) return;
    this._updateConfig(target.configValue, target.value);
  }

  _updateConfig(key, value) {
    const newConfig = { ...this.config };
    newConfig[key] = value;
    const event = new CustomEvent("config-changed", {
      detail: { config: newConfig },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }
}

customElements.define("mouse-control-card", MouseControlCard);
customElements.define("mouse-control-card-editor", MouseControlCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "mouse-control-card",
  name: "Mouse Control Card",
  preview: true,
  description: "Een kaart in de vorm van een muis met switches en sliders."
});
