// @ts-ignore
import inlineCss from './style.css?inline';

function createIcon(size: number = 24) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', size.toString());
  svg.setAttribute('height', size.toString());
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.classList.add('my-plus-icon');

  // --- SCALING MODEL ---
  const cx = 50 as number;
  const cy = 50 as number;
  const radius = 50 as number; // full circle
  const arm = radius * 0.6; // plus arm length (60% of radius)
  const stroke = radius * 0.2; // plus thickness (20% of radius)

  // --- CIRCLE ---
  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  circle.setAttribute('cx', cx.toString());
  circle.setAttribute('cy', cy.toString());
  circle.setAttribute('r', radius.toString());
  circle.setAttribute('fill', 'currentColor');

  // --- PLUS SIGN ---
  const plus = document.createElementNS('http://www.w3.org/2000/svg', 'path');

  plus.setAttribute(
    'd',
    `
      M ${cx} ${cy - arm}
      V ${cy + arm}
      M ${cx - arm} ${cy}
      H ${cx + arm}
    `
  );

  plus.setAttribute('stroke', 'currentColor');
  plus.setAttribute('stroke-width', stroke.toString());
  plus.setAttribute('stroke-linecap', 'round');

  svg.appendChild(circle);
  svg.appendChild(plus);
  return svg;
}

function createIconButton(size: number, labelText: string, id: string = 'my-icon-btn') {
  const wrapper = document.createElement('div');
  wrapper.id = id;
  wrapper.appendChild(createIcon(size));
  const label = document.createElement('span');
  label.textContent = labelText;
  wrapper.appendChild(label);
  return wrapper;
}

function setStyle(id: string) {
  if (document.getElementById(id)) return;
  const style = document.createElement('style');
  style.id = `${id}-style`;
  style.textContent = inlineCss;
  document.head.appendChild(style);
}

class Injector {
  private elementID = 'my-icon-btn' as string;
  private container: HTMLElement | null;
  private icon: HTMLElement;

  constructor(size: number = 28, label: string = 'Add to playlist') {
    this.container = document.querySelector('div#container.style-scope.ytd-masthead') as HTMLElement | null;
    this.icon = createIconButton(size, label, this.elementID);
    this.apply = this.apply.bind(this); // bind to avoid context issues in mutation observer
  }

  private isBlocked(): boolean {
    return this.container?.dataset.injected === '1';
  }
  private block() {
    if (this.container) this.container.dataset.injected = '1';
  }

  apply() {
    if (this.isBlocked()) return;
    const center = this.container?.querySelector('div#center');
    setStyle(this.elementID);
    center?.prepend(this.icon);
    this.block();
  }
}

const injector = new Injector(28, 'Add to playlist');
injector.apply();

new MutationObserver(injector.apply).observe(document.body, {
  childList: true,
  subtree: true,
});
