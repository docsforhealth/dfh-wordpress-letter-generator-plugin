import { useState } from '@wordpress/element';
import { uniqueId } from 'lodash';
import PropTypes from 'prop-types';

// TODO make the label look less like an editable field

export default function EditorLabelWrapper({
  label,
  children,
  className = '',
  collapsible = false,
  startOpen = false,
}) {
  const [id] = useState(uniqueId()),
    [isOpen, setIsOpen] = useState(collapsible ? startOpen : true);
  return (
    <div
      className={`editor-label-wrapper ${
        collapsible ? 'editor-label-wrapper--has-toggle' : ''
      } ${isOpen ? 'editor-label-wrapper--open' : ''} ${className ?? ''}`}
    >
      <div className="editor-label-wrapper__controls">
        <label className="editor-label-wrapper__controls__label" htmlFor={id}>
          {label}
        </label>
        {collapsible && (
          <button
            type="button"
            className="editor-label-wrapper__toggle"
            onClick={() => setIsOpen((status) => !status)}
          >
            <span className="editor-label-wrapper__toggle__label">
              Toggle visibility for content
            </span>
          </button>
        )}
      </div>
      <div className="editor-label-wrapper__content">{children(id)}</div>
    </div>
  );
}
EditorLabelWrapper.propTypes = {
  label: PropTypes.string.isRequired,
  // This is the "render prop" pattern
  // see https://reactjs.org/docs/render-props.html#using-props-other-than-render
  children: PropTypes.func.isRequired,
  className: PropTypes.string,
  collapsible: PropTypes.bool,
  startOpen: PropTypes.bool,
};
