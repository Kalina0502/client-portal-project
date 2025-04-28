import { computePosition, offset, flip, shift, autoUpdate } from '@floating-ui/dom';

export function attachFloatingUI(targetSelector, content) {
  const target = document.querySelector(targetSelector);

  if (!target) return;

  const tooltip = document.createElement('div');
  tooltip.className = 'floating-tooltip';
  tooltip.textContent = content;
  document.body.appendChild(tooltip);

  tooltip.style.position = 'absolute';
  tooltip.style.backgroundColor = '#333';
  tooltip.style.color = '#fff';
  tooltip.style.padding = '5px 8px';
  tooltip.style.borderRadius = '4px';
  tooltip.style.fontSize = '12px';
  tooltip.style.pointerEvents = 'none';
  tooltip.style.zIndex = '1000';
  tooltip.style.whiteSpace = 'nowrap';
  tooltip.style.display = 'none';

  target.addEventListener('mouseenter', () => {
    tooltip.style.display = 'block';

    autoUpdate(target, tooltip, () => {
      computePosition(target, tooltip, {
        middleware: [offset(6), flip(), shift()],
      }).then(({ x, y }) => {
        tooltip.style.left = `${x}px`;
        tooltip.style.top = `${y}px`;
      });
    });
  });

  target.addEventListener('mouseleave', () => {
    tooltip.style.display = 'none';
  });
}
