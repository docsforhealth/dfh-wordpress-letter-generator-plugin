import {
  PluginDocumentSettingPanel,
  PluginPostPublishPanel,
  PluginPrePublishPanel,
} from '@wordpress/edit-post';
import { __ } from '@wordpress/i18n';
import { registerPlugin } from '@wordpress/plugins';
import PropTypes from 'prop-types';
import { ATTR_ERROR_MESSAGES, TITLE } from 'src/js/block/shared-data-element';
import * as Constants from 'src/js/constants';
import CustomBlockStatusWatcher from 'src/js/setup/component/custom-block-status-watcher';
import { tryFindBlockInfoFromName } from 'src/js/utils/block';

// 1. Add a status badge to key editor interface elements for the shared data element custom post type
// example: https://wordpress.stackexchange.com/questions/339138/add-pre-publish-conditions-to-the-block-editor
// 2. No Slotfill in the block editor header available to add content with extensive hacks
// see https://stackoverflow.com/a/63783598
// see https://github.com/WordPress/gutenberg/issues/16988

function SharedDataElementStatus({ wrapperType: StatusWrapper }) {
  const blockInfo = tryFindBlockInfoFromName(
    Constants.BLOCK_SHARED_DATA_ELEMENT,
  );
  return (
    !!blockInfo && (
      <StatusWrapper title={TITLE} initialOpen>
        <CustomBlockStatusWatcher
          clientId={blockInfo.clientId}
          validMessage={__(
            'This shared data element is all set!',
            Constants.TEXT_DOMAIN,
          )}
          errorsAttrName={ATTR_ERROR_MESSAGES}
          lockSavingIfInvalid
        />
      </StatusWrapper>
    )
  );
}
SharedDataElementStatus.propTypes = {
  wrapperType: PropTypes.elementType.isRequired,
};

// see https://github.com/WordPress/gutenberg/tree/trunk/packages/edit-post#plugindocumentsettingpanel
registerPlugin(`${Constants.NAMESPACE}-shared-data-element-document-settings`, {
  render() {
    return <SharedDataElementStatus wrapperType={PluginDocumentSettingPanel} />;
  },
});

// see https://github.com/WordPress/gutenberg/tree/trunk/packages/edit-post#pluginprepublishpanel
registerPlugin(`${Constants.NAMESPACE}-shared-data-element-pre-publish`, {
  render() {
    return <SharedDataElementStatus wrapperType={PluginPrePublishPanel} />;
  },
});

// see https://github.com/WordPress/gutenberg/tree/trunk/packages/edit-post#pluginpostpublishpanel
registerPlugin(`${Constants.NAMESPACE}-shared-data-element-post-publish`, {
  render() {
    return <SharedDataElementStatus wrapperType={PluginPostPublishPanel} />;
  },
});
