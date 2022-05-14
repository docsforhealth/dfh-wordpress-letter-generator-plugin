import { useState } from '@wordpress/element';
import { uniqueId } from 'lodash';
import PropTypes from 'prop-types';
import { tryChildrenAsFunction } from 'src/js/utils/component';

export const STYLE_SR_ONLY = 'screenReaderOnly';
export const STYLE_FORM_LABEL = 'formLabel';
export const STYLE_CONTAINER = 'container';

const styleToClass = {
  [STYLE_SR_ONLY]: 'editor-label-wrapper--style-sr-only',
  [STYLE_FORM_LABEL]: 'editor-label-wrapper--style-form-label',
  [STYLE_CONTAINER]: 'editor-label-wrapper--style-container', // TODO is anyone using this?? remove?
};

export default function EditorLabelWrapper({
  label,
  children,
  style = STYLE_SR_ONLY,
  contentSpacing = true,
  className,
  controlsClassName,
  contentClassName,
}) {
  const [id] = useState(uniqueId());
  return (
    <div
      className={`editor-label-wrapper ${style ? styleToClass[style] : ''} ${
        contentSpacing ? '' : 'editor-label-wrapper--no-content-spacing'
      } ${className ?? ''}`}
    >
      <div
        className={`editor-label-wrapper__controls ${controlsClassName ?? ''}`}
      >
        <label className="editor-label-wrapper__controls__label" htmlFor={id}>
          {label}
        </label>
      </div>
      <div
        className={`editor-label-wrapper__content ${contentClassName ?? ''}`}
      >
        {tryChildrenAsFunction(children, id)}
      </div>
    </div>
  );
}
EditorLabelWrapper.propTypes = {
  label: PropTypes.node.isRequired,
  // This is the "render prop" pattern
  // see https://reactjs.org/docs/render-props.html#using-props-other-than-render
  children: PropTypes.func.isRequired,
  style: PropTypes.string,
  contentSpacing: PropTypes.bool,
  className: PropTypes.string,
  controlsClassName: PropTypes.string,
  contentClassName: PropTypes.string,
};
