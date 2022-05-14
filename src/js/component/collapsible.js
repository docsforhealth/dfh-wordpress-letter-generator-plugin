import { VisuallyHidden } from '@wordpress/components';
import { forwardRef, useState } from '@wordpress/element';
import PropTypes from 'prop-types';

const Collapsible = forwardRef(
  ({ display, startOpen = false, className, children, ...otherProps }, ref) => {
    const [isOpen, setIsOpen] = useState(startOpen);
    return (
      <div
        {...otherProps}
        ref={ref}
        className={`collapsible ${isOpen ? 'collapsible--open' : ''} ${
          className ?? ''
        }`}
      >
        {display(isOpen, setIsOpen)}
        <div className="collapsible__contents">{children}</div>
      </div>
    );
  },
);
Collapsible.propTypes = {
  display: PropTypes.func.isRequired,
  startOpen: PropTypes.bool,
  className: PropTypes.string,
};

export default Collapsible;

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
      <VisuallyHidden as="span">Toggle visibility</VisuallyHidden>
    </button>
  );
}
ToggleButton.propTypes = {
  isOpen: PropTypes.bool,
  setIsOpen: PropTypes.func.isRequired,
};
