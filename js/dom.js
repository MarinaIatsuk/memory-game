'use strict';


function appendChildren(parent, children) {
  const list = Array.isArray(children) ? children : [children];

  list.forEach((child) => {
    if (child === null || child === undefined || child === false) {
      return;
    }

    parent.append(child);
  });

  return parent;
}

function clearElement(node) {
  while (node.firstChild) {
    node.firstChild.remove();
  }

  return node;
}


function createElement(tag, options = {}) {
  const { className, text, attrs, dataset, on, children } = options;
  const element = document.createElement(tag);

  if (className) {
    const classNames = Array.isArray(className) ? className : String(className).split(' ');

    classNames.filter(Boolean).forEach((name) => element.classList.add(name));
  }

  if (text !== undefined && text !== null) {
    element.textContent = String(text);
  }

  if (attrs) {
    Object.entries(attrs).forEach(([name, value]) => {
      if (value === false || value === null || value === undefined) {
        return;
      }

      element.setAttribute(name, value === true ? '' : String(value));
    });
  }

  if (dataset) {
    Object.entries(dataset).forEach(([name, value]) => {
      element.dataset[name] = String(value);
    });
  }

  if (on) {
    Object.entries(on).forEach(([type, handler]) => element.addEventListener(type, handler));
  }

  if (children) {
    appendChildren(element, children);
  }

  return element;
}

function createButton(options = {}) {
  const { label, icon, ariaLabel, variant = 'default', onClick } = options;
  const classNames = ['button'];

  if (variant !== 'default') {
    classNames.push(`button--${variant}`);
  }

  const button = createElement('button', {
    className: classNames,
    attrs: {
      type: 'button',
      'aria-label': ariaLabel || null,
    },
    on: onClick ? { click: onClick } : null,
  });

  if (icon) {
    appendChildren(button, createElement('span', {
      className: 'button__icon',
      text: icon,
      attrs: { 'aria-hidden': 'true' },
    }));
  }

  if (label) {
    appendChildren(button, createElement('span', {
      className: 'button__label',
      text: label,
    }));
  }

  return button;
}
