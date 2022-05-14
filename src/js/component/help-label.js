import { Tooltip } from '@wordpress/components';
import PropTypes from 'prop-types';

export default function HelpLabel({
  text,
  wrapperElementType: Wrapper,
  wrapperProps,
  children,
}) {
  return (
    <Tooltip text={text} aria-label={text}>
      {Wrapper ? <Wrapper {...wrapperProps}>{children}</Wrapper> : children}
    </Tooltip>
  );
}
HelpLabel.propTypes = {
  text: PropTypes.node.isRequired,
  wrapperElementType: PropTypes.elementType,
  wrapperProps: PropTypes.object,
};
