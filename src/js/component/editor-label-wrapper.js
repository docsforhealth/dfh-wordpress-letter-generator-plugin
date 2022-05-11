import { useState } from '@wordpress/element';
import { uniqueId } from 'lodash';
import PropTypes from 'prop-types';

export const STYLE_CONTAINER = 'container';
export const STYLE_FORM_LABEL = 'formLabel';

const styleToClass = {
  [STYLE_CONTAINER]: 'editor-label-wrapper--style-container',
  [STYLE_FORM_LABEL]: 'editor-label-wrapper--style-form-label',
};

export default function EditorLabelWrapper({
  label,
  children,
  style = STYLE_CONTAINER,
  className,
}) {
  const [id] = useState(uniqueId());
  return (
    <div
      className={`editor-label-wrapper ${style ? styleToClass[style] : ''} ${
        className ?? ''
      }`}
    >
      <div className="editor-label-wrapper__controls">
        <label className="editor-label-wrapper__controls__label" htmlFor={id}>
          {label}
        </label>
      </div>
      <div className="editor-label-wrapper__content">{children(id)}</div>
    </div>
  );
}
EditorLabelWrapper.propTypes = {
  label: PropTypes.node.isRequired,
  // This is the "render prop" pattern
  // see https://reactjs.org/docs/render-props.html#using-props-other-than-render
  children: PropTypes.func.isRequired,
  style: PropTypes.string,
  className: PropTypes.string,
};
