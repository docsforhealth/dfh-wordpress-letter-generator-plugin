import { Children, cloneElement, useState } from '@wordpress/element';
import { uniqueId } from 'lodash';
import PropTypes from 'prop-types';

// TODO add collapsible and startOpen functionality

export default function EditorLabelWrapper({ label, className, children }) {
  const [id] = useState(uniqueId());
  return (
    <div className={`editor-label-wrapper ${className ?? ''}`}>
      <label className="editor-label-wrapper__label" htmlFor={id}>
        {label}
      </label>
      {Children.map(Children.only(children), (child) =>
        cloneElement(child, { id }),
      )}
    </div>
  );
}
EditorLabelWrapper.propTypes = {
  label: PropTypes.string.isRequired,
  className: PropTypes.string,
  children: PropTypes.element,
};
