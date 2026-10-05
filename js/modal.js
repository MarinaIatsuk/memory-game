'use strict';



const BODY_LOCK_CLASS = 'is-modal-open';
let activeModal = null;
let modalTitleCounter = 0;

function createModalAction(action, closeCurrentModal) {
  const { label, icon, variant = 'default', closeOnClick = true, onClick } = action;

  return createButton({
    label,
    icon,
    variant,
    onClick: () => {
      if (closeOnClick) {
        closeCurrentModal();
      }

      if (typeof onClick === 'function') {
        onClick();
      }
    },
  });
}

function closeModal() {
  if (activeModal) {
    activeModal.close();
  }
}

function openModal({ title, content, actions = [], onClose }) {
  closeModal();

  modalTitleCounter += 1;

  const titleId = `modal-title-${modalTitleCounter}`;
  const dialog = createElement('dialog', {
    className: 'modal',
    attrs: { 'aria-labelledby': titleId },
  });

  let isClosed = false;

 
  const handleClosed = () => {
    if (isClosed) {
      return;
    }

    isClosed = true;

    if (activeModal && activeModal.element === dialog) {
      activeModal = null;
    }

    document.removeEventListener('keydown', handleFallbackEscape);
    dialog.remove();

    if (!activeModal) {
      document.body.classList.remove(BODY_LOCK_CLASS);
    }

    if (typeof onClose === 'function') {
      onClose();
    }
  };

  function handleFallbackEscape(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
    }
  }

  function close() {
    if (isClosed) {
      return;
    }

    if (typeof dialog.close === 'function' && dialog.open) {
      dialog.close();
    } else {
      dialog.removeAttribute('open');
    }

    handleClosed();
  }


  dialog.addEventListener('close', handleClosed);

  let pointerDownOnBackdrop = false;

  dialog.addEventListener('mousedown', (event) => {
    pointerDownOnBackdrop = event.target === dialog;
  });

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog && pointerDownOnBackdrop) {
      close();
    }

    pointerDownOnBackdrop = false;
  });

  const modalWindow = createElement('div', {
    className: 'modal__window',
    children: [
      createElement('h2', { className: 'modal__title', text: title, attrs: { id: titleId } }),
      createElement('div', { className: 'modal__body', children: content }),
    ],
  });

  if (actions.length > 0) {
    appendChildren(modalWindow, createElement('div', {
      className: 'modal__actions',
      children: actions.map((action) => createModalAction(action, close)),
    }));
  }

  appendChildren(dialog, modalWindow);
  document.body.append(dialog);
  document.body.classList.add(BODY_LOCK_CLASS);

  if (typeof dialog.showModal === 'function') {
    dialog.showModal();
  } else {
    dialog.classList.add('modal--fallback');
    dialog.setAttribute('open', '');
    document.addEventListener('keydown', handleFallbackEscape);

    const firstButton = modalWindow.querySelector('button');

    if (firstButton) {
      firstButton.focus();
    }
  }

  activeModal = { element: dialog, close };

  return activeModal;
}
