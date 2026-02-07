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
      entity_lmb: "switch.demo_links",
      entity_rmb: "switch.demo_rechts",
      entity_num_l: "input_number.demo_links",
      entity_num_r: "input_number.demo_rechts",
      entity_palm_l: "button.demo_links",
      entity_palm_r: "button.demo_rechts",
      icon_palm_l: "mdi:gesture-tap",
      icon_palm_r: "mdi:gesture-tap"
    }
  }

  setConfig(config) {
    if (!config.entity_lmb || !config.entity_rmb) {
      throw new Error("Selecteer entiteiten voor de muisknoppen.");
    }
    this.config = config;
  }

  render() {
    if (!this.hass || !this.config) return html``;

    const stateObj = (entity) => this.hass.states[entity];
    
    // States ophalen
    const lmb = stateObj(this.config.entity_lmb);
    const rmb = stateObj(this.config.entity_rmb);
    const numL = stateObj(this.config.entity_num_l);
    const numR = stateObj(this.config.entity_num_r);
    
    // Actief status bepalen voor kleuren
    const lmbActive = lmb && lmb.state === 'on';
    const rmbActive = rmb && rmb.state === 'on';

    return html`
      <ha-card>
        <div class="mouse-shape">
          
          <div class="top-section">
            <div class="clicker left ${lmbActive ? 'active' : ''}" 
                 @click="${() => this._toggle(this.config.entity_lmb)}">
                 ${lmbActive ? html`<ha-icon icon="mdi:circle-small" class="indicator"></ha-icon>` : ''}
            </div>
            <div class="clicker right ${rmbActive ? 'active' : ''}" 
                 @click="${() => this._toggle(this.config.entity_rmb)}">
                 ${rmbActive ? html`<ha-icon icon="mdi:circle-small" class="indicator"></ha-icon>` : ''}
            </div>
          </div>

          <div class="bottom-section">
            
            <div class="numbers-row">
              <div class="num-group">
                <div class="stepper" @click="${(e) => this._updateNum(e, this.config.entity_num_l, -1)}">-</div>
                <div class="value">${numL ? parseFloat(numL.state) : '-'}</div>
                <div class="stepper" @click="${(e) => this._updateNum(e, this.config.entity_num_l, 1)}">+</div>
              </div>
              <div class="num-group">
                <div class="stepper" @click="${(e) => this._updateNum(e, this.config.entity_num_r, -1)}">-</div>
                <div class="value">${numR ? parseFloat(numR.state) : '-'}</div>
                <div class="stepper" @click="${(e) => this._updateNum(e, this.config.entity_num_r, 1)}">+</div>
              </div>
            </div>

            <div class="buttons-row">
               <div class="palm-btn" @click="${() => this._handleTap(this.config.entity_palm_l)}">
                 <ha-icon icon="${this.config.icon_palm_l || 'mdi:circle-outline'}"></ha-icon>
               </div>
               <div class="palm-btn" @click="${() => this._handleTap(this.config.entity_palm_r)}">
                 <ha-icon icon="${this.config.icon_palm_r || 'mdi:circle-outline'}"></ha-icon>
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

  _updateNum(e, entity, delta) {
    e.stopPropagation();
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
        background: none;
        box-shadow: none;
        border: none;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 10px;
      }

      .mouse-shape {
        position: relative;
        width: 100%;
        max-width: 320px; /* Mooie breedte voor een muis */
        aspect-ratio: 0.68; /* Verhouding van een echte muis */
        border: 4px solid var(--primary-text-color);
        border-radius: 45% 45% 45% 45% / 25% 25% 45% 45%;
        background-color: var(--card-background-color);
        overflow: hidden;
        display: flex;
        flex-direction: column;
        box-shadow: var(--ha-card-box-shadow, 0 2px 4px rgba(0,0,0,0.3));
      }

      /* --- BOVENKANT (LMB/RMB) --- */
      .top-section {
        flex: 0 0 35%; /* Bovenste 35% is knop */
        display: flex;
        border-bottom: 4px solid var(--primary-text-color);
      }

      .clicker {
        flex: 1;
        cursor: pointer;
        transition: background-color 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .clicker.left {
        border-right: 2px solid var(--primary-text-color);
      }
      .clicker.right {
        border-left: 2px solid var(--primary-text-color);
      }

      .clicker:active {
        background-color: rgba(128,128,128, 0.2);
      }

      .clicker.active {
        background-color: var(--primary-color);
      }
      
      .indicator {
        color: var(--text-primary-color, white);
        opacity: 0.8;
      }

      /* --- ONDERKANT (PALM) --- */
      .bottom-section {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
        padding: 10px;
        background-color: var(--secondary-background-color);
      }

      /* Nummers */
      .numbers-row {
        display: flex;
        justify-content: space-around;
        align-items: center;
      }

      .num-group {
        display: flex;
        align-items: center;
        gap: 5px;
        background: var(--card-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 15px;
        padding: 2px;
      }

      .stepper {
        cursor: pointer;
        width: 25px;
        height: 25px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        color: var(--primary-color);
        border-radius: 50%;
      }
      .stepper:hover { background: rgba(0,0,0,0.05); }

      .value {
        font-size: 14px;
        min-width: 24px;
        text-align: center;
        font-weight: 500;
      }

      /* Buttons */
      .buttons-row {
        display: flex;
        justify-content: space-around;
        align-items: center;
      }

      .palm-btn {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background-color: var(--card-background-color);
        border: 1px solid var(--divider-color);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: var(--primary-text-color);
        transition: all 0.2s;
      }

      .palm-btn:active {
        transform: scale(0.95);
        background-color: var(--divider-color);
      }
    `;
  }

  // Configuratie koppeling
  static getConfigElement() {
    return document.createElement("mouse-control-card-editor");
  }
}

// ----------------------------------------------------------------------------
// EDITOR COMPONENT (GUI)
// ----------------------------------------------------------------------------
class MouseControlCardEditor extends LitElement {
  static get properties() {
    return { hass: {}, config: {} };
  }

  setConfig(config) { this.config = config; }

  render() {
    if (!this.hass || !this.config) return html``;

    const renderPicker = (label, value, key, domain) => html`
      <ha-entity-picker
        .hass=${this.hass}
        .value=${value}
        .label=${label}
        .includeDomains=${domain}
        @value-changed=${(e) => this._valueChanged(e, key)}
        style="margin-bottom: 8px; display: block;"
      ></ha-entity-picker>
    `;

    return html`
      <div class="card-config">
        <h3>Linker/Rechter Muisknop</h3>
        ${renderPicker("Linker Switch", this.config.entity_lmb, 'entity_lmb', ['switch', 'light', 'input_boolean'])}
        ${renderPicker("Rechter Switch", this.config.entity_rmb, 'entity_rmb', ['switch', 'light', 'input_boolean'])}

        <h3>Nummers (Midden)</h3>
        ${renderPicker("Nummer Links", this.config.entity_num_l, 'entity_num_l', ['input_number'])}
        ${renderPicker("Nummer Rechts", this.config.entity_num_r, 'entity_num_r', ['input_number'])}

        <h3>Palm Knoppen (Onder)</h3>
        ${renderPicker("Knop Entity Links", this.config.entity_palm_l, 'entity_palm_l', ['button', 'input_button', 'script', 'scene', 'switch'])}
        ${renderPicker("Knop Entity Rechts", this.config.entity_palm_r, 'entity_palm_r', ['button', 'input_button', 'script', 'scene', 'switch'])}
        
        <div style="display: flex; gap: 10px; margin-top: 10px;">
            <ha-icon-picker .label="Icoon Links" .value="${this.config.icon_palm_l}" .configValue=${"icon_palm_l"} @value-changed=${this._valueChangedRaw}></ha-icon-picker>
            <ha-icon-picker .label="Icoon Rechts" .value="${this.config.icon_palm_r}" .configValue=${"icon_palm_r"} @value-changed=${this._valueChangedRaw}></ha-icon-picker>
        </div>
      </div>
    `;
  }

  _valueChanged(ev, key) {
    if (!this.config || !this.hass) return;
    this._updateConfig(key, ev.detail.value);
  }

  _valueChangedRaw(ev) {
    if (!this.config || !this.hass) return;
    this._updateConfig(ev.target.configValue, ev.target.value);
  }

  _updateConfig(key, value) {
    const newConfig = { ...this.config };
    newConfig[key] = value;
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: newConfig }, bubbles: true, composed: true }));
  }
}

customElements.define("mouse-control-card", MouseControlCard);
customElements.define("mouse-control-card-editor", MouseControlCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "mouse-control-card",
  name: "Mouse Control Card",
  preview: true,
  description: "Muis layout besturing"
});
