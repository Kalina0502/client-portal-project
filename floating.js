function attachFloatingUI(targetSelector, content) {
  const target = typeof targetSelector === 'string' ? document.querySelector(targetSelector) : targetSelector;

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

  target.addEventListener('mouseenter', (e) => {
    tooltip.style.display = 'block';
    const rect = target.getBoundingClientRect();
    tooltip.style.left = rect.left + window.scrollX + "px";
    tooltip.style.top = rect.top + window.scrollY - tooltip.offsetHeight - 10 + "px"; // малко над елемента
  });

  target.addEventListener('mouseleave', () => {
    tooltip.style.display = 'none';
  });
}

// Правим я глобална
window.attachFloatingUI = attachFloatingUI;
