import { TextareaControl, TextControl } from '@wordpress/components';
import PropTypes from 'prop-types';
import * as TextDataElement from 'src/js/block/helper/data-element-text';
import * as DataElement from 'src/js/block/shared/data-element';

export default function OptionChoiceValue({
  [DataElement.ATTR_KEY]: dataKey,
  [TextDataElement.ATTR_TYPE]: textType,
  [DataElement.ATTR_LABEL]: label,
  [TextDataElement.ATTR_PLACEHOLDER]: placeholder,
  [DataElement.ATTR_HELP_TEXT]: helpText,
  value,
  onChange,
}) {
  const renderProps = {
    label,
    placeholder,
    help: helpText,
    value,
    onChange: (newValue) => onChange(dataKey, newValue),
  };
  switch (textType) {
    case TextDataElement.TEXT_TYPE_SHORT:
      return <TextControl {...renderProps} />;
    case TextDataElement.TEXT_TYPE_LONG:
      return <TextareaControl {...renderProps} />;
    case TextDataElement.TEXT_TYPE_DATE:
      return <TextControl {...renderProps} type="date" />;
    case TextDataElement.TEXT_TYPE_PHONE_NUMBER:
      return <TextControl {...renderProps} type="tel" />;
    default:
      return null;
  }
}
OptionChoiceValue.propTypes = {
  [DataElement.ATTR_KEY]: PropTypes.string.isRequired,
  [TextDataElement.ATTR_TYPE]: PropTypes.oneOf(
    TextDataElement.TEXT_TYPE_VALUES,
  ),
  [DataElement.ATTR_LABEL]: PropTypes.string,
  [TextDataElement.ATTR_PLACEHOLDER]: PropTypes.string,
  [DataElement.ATTR_HELP_TEXT]: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};
