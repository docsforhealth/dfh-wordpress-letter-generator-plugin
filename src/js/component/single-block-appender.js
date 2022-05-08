import { createBlock } from '@wordpress/blocks';
import { Button } from '@wordpress/components';
import PropTypes from 'prop-types';
import useInsertBlock from 'src/js/hook/use-insert-block';

export default function SingleBlockAppender({
  label,
  blockName,
  clientId,
  className,
  deemphasized,
}) {
  const insertBlock = useInsertBlock(clientId);
  return (
    <Button
      className={`single-block-appender ${
        deemphasized ? 'single-block-appender--deemphasized' : ''
      } ${className ?? ''}`}
      onClick={() => insertBlock(createBlock(blockName))}
    >
      <span className="single-block-appender__label">{label}</span>
    </Button>
  );
}
SingleBlockAppender.propTypes = {
  label: PropTypes.string.isRequired,
  blockName: PropTypes.string.isRequired,
  clientId: PropTypes.string.isRequired,
  className: PropTypes.string,
  deemphasized: PropTypes.bool,
};
