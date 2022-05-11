import { VisuallyHidden } from '@wordpress/components';
import { useState } from '@wordpress/element';
import PropTypes from 'prop-types';

export default function Collapsible({
  display,
  startOpen = false,
  className,
  children,
}) {
  const [isOpen, setIsOpen] = useState(startOpen);
  return (
    <div
      className={`collapsible ${isOpen ? 'collapsible--open' : ''} ${
        className ?? ''
      }`}
    >
      {display(isOpen, setIsOpen)}
      <div className="collapsible__contents">{children}</div>
    </div>
  );
}
Collapsible.propTypes = {
  display: PropTypes.func.isRequired,
  startOpen: PropTypes.bool,
  className: PropTypes.string,
};

// ******************
// * Default button *
// ******************

export function ToggleButton({ isOpen, setIsOpen }) {
  return (
    <button
      type="button"
      className={`collapsible-toggle ${
        isOpen ? 'collapsible-toggle--open' : ''
      }`}
      onClick={() => setIsOpen(!isOpen)}
    >
      <VisuallyHidden as="span">Toggle visibility for content</VisuallyHidden>
    </button>
  );
}
ToggleButton.propTypes = {
  isOpen: PropTypes.bool,
  setIsOpen: PropTypes.func.isRequired,
};
