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


