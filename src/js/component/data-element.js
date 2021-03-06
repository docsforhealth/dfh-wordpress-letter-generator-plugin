import { Slot, __experimentalUseSlot as useSlot } from '@wordpress/components';
import { forwardRef } from '@wordpress/element';
import { isEmpty } from 'lodash';
import PropTypes from 'prop-types';
import Contents, { SLOT_OVERLAY } from 'src/js/component/data-element/contents';
import Controls from 'src/js/component/data-element/controls';
import Header from 'src/js/component/data-element/header';
import Info from 'src/js/component/data-element/info';
import { slotName } from 'src/js/utils/block';

// NOTE: `SlotFillProvider` already included in default WP Block Editor's root
// see https://github.com/WordPress/gutenberg/tree/trunk/packages/components/src/slot-fill

const DataElement = forwardRef((props, ref) => {
  const {
    children,
    className,
    clientId,
    blockProps = {},
    errors,
    ...otherProps
  } = props;
  const overlay = useSlot(slotName(SLOT_OVERLAY, clientId)),
    hasOverlays = overlay?.fills?.length > 0;
  return (
    <div
      {...blockProps}
      ref={ref}
      className={`data-element ${
        !isEmpty(errors) ? 'data-element--invalid' : ''
      } ${className ?? ''}`}
    >
      <Info clientId={clientId} errors={errors} />
      <div className="data-element__container">
        <Header {...otherProps} clientId={clientId} />
        <Controls {...otherProps} clientId={clientId} forceHide={hasOverlays} />
        <Contents {...otherProps} clientId={clientId} forceHide={hasOverlays}>
          {children}
        </Contents>
        <Slot
          name={slotName(SLOT_OVERLAY, clientId)}
          // TIP: need `bubblesVirtually` on the Slot in order for InnerBlocks to work propertly
          bubblesVirtually
        />
      </div>
    </div>
  );
});
DataElement.propTypes = {
  clientId: PropTypes.string.isRequired,
  className: PropTypes.string,
  blockProps: PropTypes.object,
  errors: PropTypes.array,
};

// To ensure proper saving for certain WP components
DataElement.Content = function (props) {
  const { children, ...allPropsExceptChildren } = props;
  return (
    <>
      <Controls.Content {...allPropsExceptChildren} />
      {children}
    </>
  );
};

export default DataElement;
